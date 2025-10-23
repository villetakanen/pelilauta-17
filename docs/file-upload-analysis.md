# File Upload & Asset Management Analysis

**Document Version:** 1.0  
**Created:** 2025-10-23  
**Purpose:** Comprehensive analysis of current file upload patterns and recommendations for future development

---

## Executive Summary

Pelilauta-17 currently implements file uploads in **three distinct patterns** across the application:
1. **Client-side uploads** (Sites, Profiles) - Direct Firebase Storage uploads from browser
2. **Server-side uploads** (Threads, Replies) - Multipart form data handled by API routes
3. **Markdown imports** (Site pages) - Text file processing without storage upload

This document analyzes each pattern's strengths, weaknesses, and provides recommendations for standardization and future development.

---

## Current Implementation Overview

### 1. Storage Organization

Firebase Storage follows a hierarchical structure:

```
/Threads/{threadKey}/{uuid}-{filename}
/Sites/{siteKey}/{uuid}-{filename}
/profiles/{uid}/avatar.webp
```

**Key Principles:**
- Assets organized by owning entity (Thread, Site, Profile)
- UUID-prefixed filenames prevent collisions
- Assets deleted when parent entity is deleted (no orphans)
- Metadata stored in Firestore, not solely in Storage

### 2. Client-Side Upload Pattern

**Used by:**
- `src/firebase/client/site/addAssetToSite.ts` - Site asset uploads
- `src/firebase/client/profile/uploadAvatar.ts` - Profile avatar uploads
- `src/firebase/client/threads/addAssetToThread.ts` - Thread asset uploads (not currently used)
- `src/components/svelte/sites/assets/UploadAssetFab.svelte` - Site asset UI

**Flow:**
```typescript
// 1. User selects file in browser
// 2. Client resizes/processes image (if applicable)
await resizeImage(file); // Converts to WebP, max 1920px width

// 3. Direct upload to Firebase Storage (client SDK)
const { getStorage } = await import('firebase/storage');
await uploadBytes(storageRef, file);

// 4. Get download URL
const downloadURL = await getDownloadURL(storageRef);

// 5. Update Firestore with asset metadata
await updateDoc(docRef, { 
  assets: [...existingAssets, newAsset] 
});
```

**Characteristics:**
- ✅ **Pro:** Faster uploads (direct to Storage, no server middleman)
- ✅ **Pro:** Less server load and bandwidth costs
- ✅ **Pro:** Client-side image optimization (resizing, WebP conversion)
- ✅ **Pro:** Better progress tracking potential
- ❌ **Con:** Requires proper Storage security rules
- ❌ **Con:** Harder to validate file types/sizes server-side
- ❌ **Con:** Client can bypass restrictions if rules are misconfigured
- ❌ **Con:** No virus scanning or advanced processing

**Image Processing:**
```typescript
// src/utils/client/resizeImage.ts
export async function resizeImage(file: File, maxWidth = 1920): Promise<File> {
  // Uses Canvas API to resize and convert to WebP
  // Returns optimized File object
}
```

### 3. Server-Side Upload Pattern

**Used by:**
- `src/pages/api/threads/create.ts` - Thread creation with images
- `src/pages/api/threads/add-reply.ts` - Reply creation with images
- `src/firebase/client/threads/submitReply.ts` - Client-side submission helper

**Flow:**
```typescript
// 1. Client builds FormData with files
const formData = new FormData();
formData.append('markdownContent', content);
files.forEach((file, index) => {
  formData.append(`file_${index}`, file);
});

// 2. POST to API endpoint with Bearer token
await fetch('/api/threads/add-reply', {
  method: 'POST',
  headers: { Authorization: `Bearer ${token}` },
  body: formData,
});

// 3. Server parses multipart data
const formData = await request.formData();
const files: File[] = [];
for (const [key, value] of formData.entries()) {
  if (key.startsWith('file_') && value instanceof File) {
    files.push(value);
  }
}

// 4. Server uploads to Storage (Admin SDK)
const storage = getStorage(serverApp);
const buffer = Buffer.from(await file.arrayBuffer());
await bucket.file(storagePath).save(buffer);

// 5. Make file public and get URL
await cloudFile.makePublic();
const url = `https://storage.googleapis.com/${bucket.name}/${storagePath}`;
```

**Characteristics:**
- ✅ **Pro:** Server-side validation and security
- ✅ **Pro:** Can perform virus scanning, advanced processing
- ✅ **Pro:** Centralized error handling and logging
- ✅ **Pro:** Consistent URL generation (public URLs vs signed URLs)
- ❌ **Con:** Slower uploads (client → server → storage)
- ❌ **Con:** Higher server bandwidth and memory usage
- ❌ **Con:** Increased API response times
- ❌ **Con:** Size limits (FormData typically ~10MB in Astro/Node)

**Current Issues:**
1. **Inconsistent URL generation:**
   - `add-reply.ts`: Uses `makePublic()` and constructs public URL
   - `create.ts`: Uses signed URLs with far-future expiry (2491!)
   
2. **No image optimization:**
   - Server receives full-size images from client
   - No resizing or WebP conversion in server-side pattern

3. **Type validation differences:**
   - `add-reply.ts`: Only allows images (`file.type.startsWith('image/')`)
   - `create.ts`: No type validation in upload function

### 4. Markdown Import Pattern

**Used by:**
- `src/components/svelte/sites/import/UploadFilesForm.svelte` - Bulk page imports

**Flow:**
```typescript
// 1. User selects multiple .md files
<input type="file" accept=".md,.markdown" multiple />

// 2. Client reads files as text (FileReader)
const content = await readFileAsText(file);

// 3. Parse frontmatter and body
const { frontmatter, body } = parseMdFile(content);

// 4. Add to import queue (no upload yet)
importStore.addPages(processedFiles);

// 5. Later: Pages created via separate API calls
```

**Characteristics:**
- ✅ **Pro:** Batch processing of content
- ✅ **Pro:** Preview before commit
- ✅ **Pro:** No storage costs for text content
- ⚠️ **Neutral:** Files not uploaded to Storage (content stored in Firestore)
- ❌ **Con:** Embedded images in markdown need separate handling
- ❌ **Con:** No support for binary assets in import

---

## Asset Metadata Schema

```typescript
// src/schemas/AssetSchema.ts
export const AssetSchema = z.object({
  url: z.string(),                    // Download URL
  description: z.string().default(''),
  license: z.string().default('0'),   // See ASSET_LICENSES
  name: z.string().default(''),       // Display name
  mimetype: z.string().optional(),    // e.g., 'image/webp'
  storagePath: z.string().optional(), // Full path in Storage
});

// Stored in site.assets[], thread.images[]
```

**License Support:**
```typescript
export const ASSET_LICENSES = z.enum([
  '0',              // All rights reserved (default)
  'cc-by',          // Creative Commons Attribution
  'cc-by-sa',       // CC Attribution-ShareAlike
  'cc-by-nc',       // CC Attribution-NonCommercial
  'cc-by-nc-sa',    // CC Attribution-NonCommercial-ShareAlike
  'cc0',            // CC0 Public Domain
  'public-domain',  // Public Domain
  'OGL',            // Open Game License
]);
```

---

## UI Components Analysis

### File Input Components

#### 1. `AddFilesButton.svelte` - Generic File Picker
```svelte
<script lang="ts">
interface Props {
  accept?: string;        // MIME types, e.g., 'image/*'
  multiple?: boolean;     // Allow multiple files
  disabled?: boolean;
  addFiles: (files: File[]) => void;
}
</script>

<input type="file" style="display: none" bind:this={fileInputRef} />
<button onclick={handleButtonClick}>
  <cn-icon noun="assets"></cn-icon>
  <span>{t('actions:upload')}</span>
</button>
```
**Used by:** Thread editor, reply dialog

#### 2. `UploadAssetFab.svelte` - Site Asset Upload
```svelte
accept="image/*,video/*,audio/*,application/pdf,application/zip"

async function uploadFiles(files: FileList) {
  for (const file of files) {
    if (file.type.startsWith('image/')) {
      const resizedFile = await resizeImage(file);
      if (resizedFile.size > 10 * 1024 * 1024) throw new Error('Too big');
      await addAssetToSite(site, resizedFile);
    } else if (/* PDF, text, markdown */) {
      if (file.size > 10 * 1024 * 1024) throw new Error('Too big');
      await addAssetToSite(site, file);
    }
  }
}
```
**Features:**
- Multi-file type support
- Per-file-type size limits (10MB)
- Automatic image resizing
- Direct client-side upload

#### 3. `SiteThemeImageInput.svelte` - Theme Images
```svelte
interface Props {
  imageField: 'avatarURL' | 'posterURL' | 'backgroundURL';
}

async function fileChanged(e: Event) {
  const resized = await resizeImage(file);
  // Show preview
  preview = reader.result;
}

async function onsubmit() {
  const url = await addAssetToSite(site, file);
  update({ [imageField]: url });
}
```
**Features:**
- Preview before upload
- Reset/delete options
- Updates specific site theme field

---

## File Type Support Matrix

| File Type        | Client Upload | Server Upload | Size Limit | Processing     | Used By          |
|------------------|---------------|---------------|------------|----------------|------------------|
| Images (JPEG/PNG)| ✅ Yes        | ✅ Yes        | 10MB       | Resize, WebP   | Sites, Profiles, Threads |
| WebP             | ✅ Yes        | ✅ Yes        | 10MB       | Resize only    | Sites            |
| Video            | ✅ Yes*       | ❌ No         | 10MB       | None           | Sites only       |
| Audio            | ✅ Yes*       | ❌ No         | 10MB       | None           | Sites only       |
| PDF              | ✅ Yes*       | ❌ No         | 10MB       | None           | Sites only       |
| ZIP              | ✅ Yes*       | ❌ No         | 10MB       | None           | Sites only       |
| Markdown (.md)   | Import only   | ❌ No         | N/A        | Parse          | Site pages       |

*Only through `UploadAssetFab.svelte` for sites

---

## Security & Validation

### Current Validation

**Client-side (varies by component):**
```typescript
// Sites: Accept multiple types
accept="image/*,video/*,audio/*,application/pdf,application/zip"

// Threads/Replies: Only images
accept="image/*"

// Size check (inconsistent)
if (file.size > 10 * 1024 * 1024) throw new Error('Too big');
```

**Server-side:**
```typescript
// add-reply.ts: Type validation
if (!file.type.startsWith('image/')) {
  throw new Error('Invalid file type, only images allowed');
}

// create.ts: NO type validation!
// Anyone can upload any file type through thread creation
```

### Missing Security Measures

1. **No Storage Security Rules file found** - Critical security gap
2. **No server-side size validation** - Client can bypass limits
3. **No virus/malware scanning** - All uploads trusted
4. **No rate limiting** - Can spam uploads
5. **No content verification** - Files not validated beyond MIME type
6. **Inconsistent type checking** - Some endpoints unprotected

---

## Performance Analysis

### Upload Speed Comparison

**Client-side (direct to Storage):**
```
Browser → Firebase Storage → CDN
Typical: 2-5 seconds for 5MB image
```

**Server-side (via API):**
```
Browser → Netlify Edge → Server → Firebase Storage → CDN
Typical: 5-15 seconds for 5MB image
```

### Resource Usage

**Client uploads:**
- Server CPU: ✅ None
- Server memory: ✅ None
- Server bandwidth: ✅ None
- Client bandwidth: ⚠️ Full file size

**Server uploads:**
- Server CPU: ⚠️ Buffer conversion, file parsing
- Server memory: ⚠️ ~2x file size (buffer + form data)
- Server bandwidth: ❌ 2x file size (receive + send)
- Client bandwidth: ⚠️ Full file size

### Current Bottlenecks

1. **Thread creation/reply API slow** due to synchronous uploads
2. **No chunked uploads** - Large files timeout
3. **No upload progress feedback** for server uploads
4. **FormData size limits** restrict file sizes (~10MB)

---

## Consistency Issues

### 1. URL Generation Mismatch

**Problem:** Two different methods for public URLs

```typescript
// Method 1: add-reply.ts (correct)
await cloudFile.makePublic();
const url = `https://storage.googleapis.com/${bucket.name}/${storagePath}`;

// Method 2: create.ts (problematic)
const [url] = await fileRef.getSignedUrl({
  action: 'read',
  expires: '03-09-2491', // Year 2491! Will break in 466 years
});
```

**Impact:**
- Inconsistent URL formats in database
- Signed URLs have query parameters, complicate caching
- Year 2491 expiry is not infinite (better to use public URLs)

### 2. Metadata Storage Inconsistency

**Threads:**
```typescript
// Stored as images[] array
images: [
  { url: string, alt: string }  // Minimal metadata
]
```

**Sites:**
```typescript
// Stored as assets[] array with full Asset schema
assets: [
  {
    url: string,
    description: string,
    license: string,
    name: string,
    mimetype: string,
    storagePath: string,
  }
]
```

**Profiles:**
```typescript
// Just a URL field
avatarURL: string  // No metadata at all
```

### 3. Function Naming Inconsistency

```typescript
// Sites: "addAssetToSite" - Asset terminology
addAssetToSite(site: Site, file: File, metadata: Partial<Asset>)

// Threads: "addAssetToThread" - Asset terminology but different return
addAssetToThread(threadKey: string, file: File)
  // Returns: { downloadURL, storagePath }
  // Does NOT update Firestore (unlike addAssetToSite)

// Profiles: "uploadAvatar" - Upload terminology
uploadAvatar(file: File)
```

---

## Recommendations

### 1. Standardize on Client-Side Uploads ⭐ PRIORITY

**Rationale:**
- Better performance (direct to Storage)
- Lower server costs
- Better user experience (faster uploads)
- Scalability (offload from server)

**Implementation:**
```typescript
// NEW: src/firebase/client/uploads/standardUpload.ts

interface UploadConfig {
  allowedTypes: string[];      // ['image/*', 'video/*', 'application/pdf']
  maxSizeBytes: number;        // 10 * 1024 * 1024
  autoResize?: boolean;        // true for images
  maxWidth?: number;           // 1920 for images
  convertToWebP?: boolean;     // true for images
}

interface UploadResult {
  url: string;
  storagePath: string;
  metadata: {
    mimetype: string;
    size: number;
    name: string;
    processedAt: string;
  };
}

async function uploadAsset(
  file: File,
  storagePath: string,
  config: UploadConfig
): Promise<UploadResult> {
  // 1. Validate file type
  validateFileType(file, config.allowedTypes);
  
  // 2. Validate file size
  validateFileSize(file, config.maxSizeBytes);
  
  // 3. Process file if needed (resize, convert)
  const processedFile = await processFile(file, config);
  
  // 4. Upload to Storage (with dynamic import)
  const { getStorage, ref, uploadBytes, getDownloadURL } = 
    await import('firebase/storage');
  
  const storageRef = ref(getStorage(), storagePath);
  await uploadBytes(storageRef, processedFile);
  
  // 5. Get download URL
  const url = await getDownloadURL(storageRef);
  
  // 6. Return standardized result
  return {
    url,
    storagePath,
    metadata: {
      mimetype: processedFile.type,
      size: processedFile.size,
      name: processedFile.name,
      processedAt: new Date().toISOString(),
    },
  };
}
```

**Migration Path:**
1. Create new standardized upload utility
2. Migrate Sites to use new utility (already client-side)
3. Migrate Threads to client-side uploads
4. Deprecate server-side upload endpoints
5. Keep server-side only for special cases (virus scanning, admin tools)

### 2. Implement Firebase Storage Security Rules ⭐ CRITICAL

**Create:** `storage.rules`

```javascript
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    
    // Helper: Check if user is authenticated
    function isAuthenticated() {
      return request.auth != null;
    }
    
    // Helper: Check file size (10MB max)
    function isValidSize() {
      return request.resource.size < 10 * 1024 * 1024;
    }
    
    // Helper: Check image types
    function isImage() {
      return request.resource.contentType.matches('image/.*');
    }
    
    // Helper: Check allowed asset types
    function isAllowedAssetType() {
      return request.resource.contentType.matches('image/.*')
          || request.resource.contentType.matches('video/.*')
          || request.resource.contentType.matches('audio/.*')
          || request.resource.contentType == 'application/pdf'
          || request.resource.contentType == 'application/zip';
    }
    
    // Threads: Only authenticated users, only images
    match /Threads/{threadKey}/{filename} {
      allow read: if true; // Public read (threads can be public)
      allow write: if isAuthenticated() 
                   && isImage() 
                   && isValidSize();
      allow delete: if isAuthenticated(); // TODO: Check thread ownership
    }
    
    // Sites: Only authenticated users, multiple types allowed
    match /Sites/{siteKey}/{filename} {
      allow read: if true; // Public read
      allow write: if isAuthenticated() 
                   && isAllowedAssetType() 
                   && isValidSize();
      allow delete: if isAuthenticated(); // TODO: Check site ownership
    }
    
    // Profiles: User's own avatar only
    match /profiles/{userId}/{filename} {
      allow read: if true; // Public read
      allow write: if isAuthenticated() 
                   && request.auth.uid == userId 
                   && isImage() 
                   && isValidSize();
      allow delete: if isAuthenticated() && request.auth.uid == userId;
    }
  }
}
```

### 3. Unify Asset Metadata Schema

**Extend AssetSchema for all use cases:**

```typescript
// src/schemas/AssetSchema.ts (enhanced)

export const AssetMetadataSchema = z.object({
  url: z.string(),
  storagePath: z.string(),
  name: z.string(),
  mimetype: z.string(),
  size: z.number(),              // NEW: File size in bytes
  uploadedAt: z.string(),        // NEW: ISO timestamp
  uploadedBy: z.string(),        // NEW: User ID
  
  // Optional display metadata
  description: z.string().default(''),
  alt: z.string().default(''),   // NEW: For images in threads
  license: z.string().default('0'),
  
  // Optional processing metadata
  originalName: z.string().optional(),  // NEW: Before UUID prefix
  processed: z.boolean().default(false), // NEW: Was it resized/converted?
  originalSize: z.number().optional(),   // NEW: Before processing
});

export type AssetMetadata = z.infer<typeof AssetMetadataSchema>;
```

**Update all entities to use consistent schema:**
```typescript
// Threads
interface Thread {
  images?: AssetMetadata[];  // Was: { url, alt }[]
}

// Sites
interface Site {
  assets?: AssetMetadata[];  // Already uses Asset, just extend
}

// Profiles
interface Profile {
  avatar?: AssetMetadata;    // Was: just avatarURL string
}
```

### 4. Implement Upload Progress Feedback

**For client-side uploads:**

```typescript
// src/firebase/client/uploads/uploadWithProgress.ts

interface ProgressCallback {
  (progress: number): void;  // 0-100
}

async function uploadWithProgress(
  file: File,
  storagePath: string,
  onProgress: ProgressCallback
): Promise<UploadResult> {
  const { getStorage, ref, uploadBytesResumable } = 
    await import('firebase/storage');
  
  const storageRef = ref(getStorage(), storagePath);
  const uploadTask = uploadBytesResumable(storageRef, file);
  
  return new Promise((resolve, reject) => {
    uploadTask.on('state_changed',
      (snapshot) => {
        const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
        onProgress(progress);
      },
      (error) => reject(error),
      async () => {
        const url = await getDownloadURL(uploadTask.snapshot.ref);
        resolve({ url, storagePath, metadata: {...} });
      }
    );
  });
}
```

**UI Component:**

```svelte
<script lang="ts">
let uploadProgress = $state<number>(0);
let isUploading = $state(false);

async function handleUpload(file: File) {
  isUploading = true;
  
  await uploadWithProgress(
    file,
    storagePath,
    (progress) => uploadProgress = progress
  );
  
  isUploading = false;
}
</script>

{#if isUploading}
  <div class="progress-bar">
    <div style="width: {uploadProgress}%"></div>
    <span>{Math.round(uploadProgress)}%</span>
  </div>
{/if}
```

### 5. Add Server-Side Validation API

**Keep server-side for validation, but not upload:**

```typescript
// src/pages/api/validate-asset.ts

export async function POST({ request }: APIContext): Promise<Response> {
  const uid = await tokenToUid(request);
  if (!uid) return unauthorized();
  
  const { storagePath, metadata } = await request.json();
  
  // 1. Verify file exists in Storage
  const bucket = getStorage().bucket();
  const file = bucket.file(storagePath);
  const [exists] = await file.exists();
  
  if (!exists) {
    return new Response(JSON.stringify({ 
      valid: false, 
      error: 'File not found' 
    }), { status: 404 });
  }
  
  // 2. Verify file metadata
  const [fileMetadata] = await file.getMetadata();
  
  // 3. Run validation checks
  // - Virus scan (if implemented)
  // - Size verification
  // - Type verification
  // - Content verification (image dimensions, etc.)
  
  // 4. Update Firestore with validated metadata
  // (Called by client after upload completes)
  
  return new Response(JSON.stringify({ 
    valid: true, 
    metadata: fileMetadata 
  }));
}
```

### 6. Implement Chunked/Resumable Uploads

**For large files (>10MB):**

```typescript
// Already supported by Firebase SDK!
import { uploadBytesResumable } from 'firebase/storage';

// Automatically handles:
// - Chunking
// - Resume after network interruption
// - Progress tracking
```

**Update size limits:**
```typescript
// Current: 10MB for all
// Recommended:
const SIZE_LIMITS = {
  'image/*': 10 * 1024 * 1024,      // 10MB
  'video/*': 100 * 1024 * 1024,     // 100MB (with chunking)
  'audio/*': 50 * 1024 * 1024,      // 50MB
  'application/pdf': 20 * 1024 * 1024, // 20MB
};
```

### 7. Standardize Function Naming

**Proposed naming convention:**

```typescript
// Upload functions (new files)
uploadAsset()           // Generic upload
uploadThreadImage()     // Thread-specific
uploadSiteAsset()       // Site-specific
uploadProfileAvatar()   // Profile-specific

// Update functions (existing files)
updateAssetMetadata()   // Update Firestore metadata
replaceAsset()          // Replace existing asset

// Delete functions
deleteAsset()           // Generic delete
deleteThreadImage()     // Thread-specific
deleteSiteAsset()       // Site-specific

// Query functions
getAssetMetadata()      // Fetch metadata
listAssets()            // List entity's assets
```

### 8. Add Comprehensive Error Handling

```typescript
// src/utils/uploads/UploadError.ts

export enum UploadErrorCode {
  INVALID_FILE_TYPE = 'INVALID_FILE_TYPE',
  FILE_TOO_LARGE = 'FILE_TOO_LARGE',
  UPLOAD_FAILED = 'UPLOAD_FAILED',
  PROCESSING_FAILED = 'PROCESSING_FAILED',
  UNAUTHORIZED = 'UNAUTHORIZED',
  QUOTA_EXCEEDED = 'QUOTA_EXCEEDED',
}

export class UploadError extends Error {
  constructor(
    public code: UploadErrorCode,
    message: string,
    public details?: unknown
  ) {
    super(message);
    this.name = 'UploadError';
  }
}

// Usage
throw new UploadError(
  UploadErrorCode.FILE_TOO_LARGE,
  'File exceeds 10MB limit',
  { size: file.size, limit: 10485760 }
);
```

**User-friendly error messages:**

```typescript
// src/locales/en/errors.json
{
  "upload": {
    "INVALID_FILE_TYPE": "This file type is not supported. Please upload {allowedTypes}.",
    "FILE_TOO_LARGE": "File is too large. Maximum size is {maxSize}.",
    "UPLOAD_FAILED": "Upload failed. Please check your connection and try again.",
    "PROCESSING_FAILED": "Failed to process file. Please try a different file.",
    "UNAUTHORIZED": "You must be signed in to upload files.",
    "QUOTA_EXCEEDED": "Storage quota exceeded. Please delete some files first."
  }
}
```

### 9. Add Upload Monitoring & Logging

```typescript
// src/utils/uploads/uploadLogger.ts

interface UploadLogEntry {
  uid: string;
  entityType: 'thread' | 'site' | 'profile';
  entityId: string;
  fileName: string;
  fileSize: number;
  mimeType: string;
  uploadDuration: number;  // milliseconds
  success: boolean;
  error?: string;
  timestamp: string;
}

async function logUpload(entry: UploadLogEntry): Promise<void> {
  // Log to Firestore for analytics
  await serverDB.collection('upload_logs').add(entry);
  
  // Log to console for debugging
  logDebug('uploadLogger', entry);
}
```

### 10. Implement Asset Cleanup

```typescript
// src/utils/cleanup/orphanedAssets.ts

/**
 * Background job to find and delete orphaned assets
 * Run periodically (e.g., weekly) via Cloud Functions
 */
async function cleanupOrphanedAssets(): Promise<void> {
  // 1. List all files in Storage
  const [files] = await bucket.getFiles();
  
  // 2. For each file, check if parent entity exists
  for (const file of files) {
    const path = file.name;
    const [type, entityId] = parsePath(path);
    
    // Check Firestore for entity
    const exists = await entityExists(type, entityId);
    
    if (!exists) {
      // 3. Delete orphaned file
      await file.delete();
      logDebug('cleanupOrphanedAssets', `Deleted orphaned: ${path}`);
    }
  }
}
```

---

## Migration Checklist

### Phase 1: Security & Consistency (Weeks 1-2)
- [ ] Create and deploy `storage.rules`
- [ ] Fix thread creation URL generation (use public URLs)
- [ ] Add server-side type validation to `create.ts`
- [ ] Standardize error messages across all upload components
- [ ] Add upload size limits to all server endpoints

### Phase 2: Standardization (Weeks 3-4)
- [ ] Create `standardUpload.ts` utility
- [ ] Extend `AssetMetadataSchema` with new fields
- [ ] Update `addAssetToSite` to use standard utility
- [ ] Update `uploadAvatar` to use standard utility
- [ ] Update all UI components to use `AddFilesButton` or standardized versions

### Phase 3: Thread Migration (Weeks 5-6)
- [ ] Create `uploadThreadImage` using client-side pattern
- [ ] Update `ReplyDialog` to use client-side upload
- [ ] Update `ThreadEditorForm` to use client-side upload
- [ ] Deprecate server-side upload in `add-reply.ts` (keep for backward compatibility)
- [ ] Deprecate server-side upload in `create.ts` (keep for backward compatibility)

### Phase 4: Enhanced Features (Weeks 7-8)
- [ ] Implement progress tracking with `uploadBytesResumable`
- [ ] Add upload progress UI components
- [ ] Implement validation API endpoint
- [ ] Add comprehensive logging
- [ ] Create orphaned asset cleanup job

### Phase 5: Testing & Docs (Weeks 9-10)
- [ ] Write unit tests for upload utilities
- [ ] Write integration tests for each entity type
- [ ] Update API documentation
- [ ] Create user-facing help docs
- [ ] Performance testing and optimization

---

## Testing Strategy

### Unit Tests

```typescript
// test/util/standardUpload.test.ts

describe('standardUpload', () => {
  it('should validate file type', async () => {
    const file = new File(['content'], 'test.exe', { type: 'application/exe' });
    await expect(
      uploadAsset(file, 'path', { allowedTypes: ['image/*'] })
    ).rejects.toThrow(UploadError);
  });
  
  it('should validate file size', async () => {
    const largeFile = createMockFile(20 * 1024 * 1024); // 20MB
    await expect(
      uploadAsset(largeFile, 'path', { maxSizeBytes: 10 * 1024 * 1024 })
    ).rejects.toThrow(UploadError);
  });
  
  it('should resize images when configured', async () => {
    const image = createMockImage(3000, 2000);
    const result = await uploadAsset(image, 'path', { 
      autoResize: true, 
      maxWidth: 1920 
    });
    // Verify processed file dimensions
  });
});
```

### Integration Tests (E2E)

```typescript
// e2e/file-upload.spec.ts

test('should upload image to thread reply', async ({ page }) => {
  await page.goto('/threads/test-thread');
  await page.click('[data-testid="reply-button"]');
  
  // Upload file
  await page.setInputFiles('input[type="file"]', {
    name: 'test-image.jpg',
    mimeType: 'image/jpeg',
    buffer: await readFile('fixtures/test-image.jpg'),
  });
  
  // Submit
  await page.click('[data-testid="submit-reply"]');
  
  // Verify upload
  await expect(page.locator('.reply img')).toBeVisible();
});
```

---

## Cost Analysis

### Current Costs (Server-side uploads)

**Per 1000 thread creations with 1 image (5MB avg):**
- Server bandwidth in: 1000 × 5MB = 5GB
- Server bandwidth out: 1000 × 5MB = 5GB
- Firebase Storage write: 1000 operations
- Firebase Storage storage: 5GB
- Total bandwidth: 10GB

**Netlify Functions:**
- Execution time: ~5s per upload
- Total: 5000 seconds = 83 minutes
- Cost: $0.02/minute = $1.66

### Projected Costs (Client-side uploads)

**Per 1000 thread creations with 1 image (5MB avg):**
- Server bandwidth in: 0GB ✅
- Server bandwidth out: 0GB ✅
- Firebase Storage write: 1000 operations (same)
- Firebase Storage storage: 3GB (40% savings from WebP) ✅
- Total bandwidth: 0GB ✅

**Netlify Functions:**
- Execution time: 0 (no upload processing) ✅
- Cost: $0 ✅

**Savings per 1000 uploads: ~$1.66 + bandwidth costs**

---

## Future Enhancements

### 1. Image CDN Integration
- CloudFlare Images or imgix for automatic optimization
- Dynamic resizing based on viewport
- WebP/AVIF serving based on browser support

### 2. Virus Scanning
- Integrate ClamAV or cloud service
- Scan before making files public
- Quarantine suspicious files

### 3. Asset Thumbnails
- Generate thumbnails on upload
- Store multiple sizes for responsive images
- Use Cloud Functions for processing

### 4. Asset Search & Discovery
- Full-text search on asset metadata
- Tag-based filtering
- Usage analytics (which assets are viewed most)

### 5. Asset Sharing & Embedding
- Public asset gallery per site
- Embed codes for external use
- Usage tracking and attribution

### 6. Advanced Processing
- Video transcoding (WebM, MP4)
- Audio format conversion
- PDF thumbnail generation
- Document text extraction

### 7. Collaborative Asset Management
- Asset versioning
- Comment threads on assets
- Collection/album organization
- Batch operations (delete, move, tag)

---

## Appendices

### A. Related Files

**Client-side Upload:**
- `src/firebase/client/site/addAssetToSite.ts`
- `src/firebase/client/threads/addAssetToThread.ts`
- `src/firebase/client/profile/uploadAvatar.ts`
- `src/utils/client/resizeImage.ts`

**Server-side Upload:**
- `src/pages/api/threads/create.ts`
- `src/pages/api/threads/add-reply.ts`
- `src/firebase/client/threads/submitReply.ts`

**UI Components:**
- `src/components/svelte/app/AddFilesButton.svelte`
- `src/components/svelte/sites/assets/UploadAssetFab.svelte`
- `src/components/svelte/sites/settings/SiteThemeImageInput.svelte`
- `src/components/svelte/discussion/ReplyDialog.svelte`
- `src/components/svelte/thread-editor/ThreadEditorForm.svelte`

**Schemas:**
- `src/schemas/AssetSchema.ts`
- `src/schemas/SiteSchema.ts` (assets field)
- `src/schemas/ThreadSchema.ts` (images field)
- `src/schemas/ProfileSchema.ts` (avatarURL field)

**Documentation:**
- `src/docs/73-asset-management.md`

### B. Firebase SDK Reference

**Client-side:**
```typescript
import { getStorage, ref, uploadBytes, uploadBytesResumable, 
         getDownloadURL, deleteObject } from 'firebase/storage';
```

**Server-side (Admin SDK):**
```typescript
import { getStorage } from 'firebase-admin/storage';
const bucket = getStorage().bucket();
```

### C. Glossary

- **Asset**: Any file uploaded and managed by the system (images, videos, documents)
- **Client-side upload**: Browser directly uploads to Firebase Storage
- **Server-side upload**: Browser sends to API endpoint, server uploads to Storage
- **Multipart form data**: HTTP format for sending files with other data
- **Storage path**: Full path to file in Firebase Storage (e.g., `/Sites/abc/file.jpg`)
- **Download URL**: Public URL to access file (may be signed or public)
- **WebP**: Modern image format with better compression than JPEG/PNG
- **UUID**: Universally Unique Identifier, used to prevent filename collisions

---

## Conclusion

The current file upload implementation is **functional but inconsistent**, with three different patterns serving different use cases. The primary recommendation is to **standardize on client-side uploads** for performance and cost reasons, while maintaining server-side validation through dedicated API endpoints.

**Key priorities:**
1. ⭐ **Security first:** Implement Storage security rules immediately
2. ⭐ **Fix inconsistencies:** Standardize URL generation and metadata schemas
3. ⭐ **Performance:** Migrate to client-side uploads for all entity types
4. **User experience:** Add progress tracking and better error messages
5. **Maintainability:** Create reusable upload utilities and comprehensive tests

This migration can be done incrementally over 10 weeks with minimal disruption to existing functionality.

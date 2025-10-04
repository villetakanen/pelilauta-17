# PBI-024: SEO Optimization and Public Page Documentation

**Status:** 🔵 Not Started  
**Priority:** High  
**Estimated Effort:** 1 sprint (1-2 weeks)

**User Story:** As a content creator and site operator, I want all public-facing pages to have proper SEO metadata (descriptions, Open Graph tags, canonical URLs) and proper indexing controls, so that our content is discoverable in search engines while keeping private/admin pages hidden, and I want comprehensive documentation of our public page structure for maintainability.

---

## Problem Statement

Currently, the application lacks:

1. **Systematic SEO Documentation**: No centralized documentation of public pages, their purposes, and SEO requirements
2. **Inconsistent Meta Descriptions**: Many public pages lack proper `description` props or use generic descriptions
3. **Missing Indexing Controls**: Some private/admin routes may not properly use `noSharing` prop to prevent indexing
4. **No SEO Audit Trail**: No easy way to verify which pages are indexed vs. which should be hidden
5. **Inconsistent Snippet Usage**: After PBI-023, we need to ensure all pages use proper snippet generation for meta descriptions

### Current Issues

**Missing/Poor Descriptions:**
- Several public pages use layout without `description` prop
- Some pages have technical descriptions instead of user-friendly SEO copy
- No consistent length (Google recommends 150-160 characters)

**Indexing Control Gaps:**
- Admin pages may lack `noSharing={true}`
- User settings and authentication pages need verification
- Character keeper and other private tools need indexing prevention

**Documentation Gap:**
- No single source of truth for public page hierarchy
- Unclear which pages should be indexed
- No SEO guidelines for new pages

---

## Proposed Solution

Create a three-phase approach:

### Phase 1: Public Page Tree Documentation
Create comprehensive documentation of all public-facing pages, their purposes, and SEO requirements.

### Phase 2: SEO Metadata Audit & Fixes
Systematically review and fix all public pages to ensure proper SEO metadata using `createPlainSnippet()` where applicable.

### Phase 3: Indexing Control Verification
Ensure all private, admin, and authenticated pages properly use `noSharing` to prevent search engine indexing.

---

## Phase 1: Public Page Tree Documentation

### Deliverables

**New Documentation File:** `src/docs/77-public-pages-seo.md`

This document should include:

1. **Public Page Hierarchy Tree**
   - Visual tree structure of all indexable pages
   - Route paths and page titles
   - Short descriptions of page content/purpose
   - SEO priority (High/Medium/Low)

2. **SEO Guidelines**
   - Description length recommendations (150-160 chars)
   - Title format conventions
   - Open Graph image requirements
   - Keyword usage patterns

3. **Indexable vs. Non-Indexable Pages**
   - Clear categorization
   - Reasons for indexing decisions
   - noSharing usage documentation

4. **Snippet Usage Guidelines**
   - When to use `createPlainSnippet()` for descriptions
   - When to use `createRichSnippet()` for content previews
   - Default length parameters for different page types

### Public Page Categories

**Primary Public Pages (High SEO Priority):**
```
/                           - Front page (thread listing)
/channels                   - Channel directory
/channels/[channel]         - Individual channel thread listings
/threads/[threadKey]        - Individual thread discussions
/sites                      - Site/wiki directory
/sites/[siteKey]            - Individual site home
/sites/[siteKey]/[pageKey]  - Site wiki pages
/tags/[tag]                 - Tag-based thread listings
/library/characters         - Public character library
/docs/[id]                  - Documentation pages
```

**Secondary Public Pages (Medium SEO Priority):**
```
/profiles/[uid]             - User profiles (public)
/login                      - Login page (low priority, but public)
/eula                       - End User License Agreement
/search                     - Search page (indexable but no unique content)
```

**Non-Indexable Pages (noSharing=true Required):**
```
/admin/*                    - All admin pages
/settings                   - User settings
/create-profile             - Profile creation
/onboarding                 - User onboarding
/create/*                   - Content creation pages
/sites/[siteKey]/keeper     - Character keeper (private tool)
/sites/[siteKey]/settings   - Site settings
/sites/[siteKey]/options    - Site options
/sites/[siteKey]/import     - Import tools
/sites/[siteKey]/data       - Data export
/sites/[siteKey]/members    - Member management
/sites/[siteKey]/clocks     - Private clocks
/sites/[siteKey]/assets     - Asset management
/sites/[siteKey]/handouts   - Private handouts
/characters/[key]/edit      - Character editing
/characters/[key]/delete    - Character deletion
/threads/[key]/confirmDelete - Thread deletion
/threads/[key]/replies/*/delete - Reply deletion
/threads/[key]/replies/*/fork   - Reply forking
/403                        - Access forbidden
/404                        - Not found
/logout                     - Logout page
/offline.html               - Offline fallback
```

### Documentation Structure

```markdown
# Public Pages and SEO Structure

## Overview
This document describes the public-facing page structure of Pelilauta, including SEO requirements and indexing controls.

## Primary Public Pages

### Front Page (/)
- **Purpose**: Main entry point, shows latest threads
- **SEO Description**: "Pelilauta - Role-playing game community for discussions, wikis, and character management"
- **Priority**: Highest
- **Indexing**: Yes
- **Current Implementation**: [Status and findings]

### Thread Pages (/threads/[threadKey])
- **Purpose**: Individual discussion threads
- **SEO Description**: Dynamic - uses createPlainSnippet(markdownContent, 160)
- **Priority**: High
- **Indexing**: Yes
- **Current Implementation**: ✅ Proper description with snippet utility

[Continue for all page types...]

## Non-Indexable Pages

### Admin Section (/admin/*)
- **Purpose**: Administrative tools and management
- **Indexing**: No (noSharing=true)
- **Current Implementation**: [Audit findings]

[Continue for all non-indexable routes...]

## SEO Best Practices

### Description Guidelines
- Length: 150-160 characters
- Use active voice
- Include primary keywords naturally
- Avoid duplicate descriptions
- Use createPlainSnippet() for dynamic content

### Title Guidelines
- Format: "[Page Title] - Pelilauta" or "[Page Title] | Pelilauta"
- Keep under 60 characters
- Use descriptive, unique titles

### Image Guidelines
- Default: Site logo/banner
- Dynamic: Use thread/site images when available
- Size: 1200x630px (Open Graph standard)
```

---

## Phase 2: SEO Metadata Audit & Fixes

### Audit Process

1. **Create Audit Spreadsheet/Checklist**
   - List all public pages
   - Current description status
   - Recommended improvements
   - Priority ranking

2. **Review Each Public Page**
   - Check for `description` prop
   - Verify description quality and length
   - Ensure proper title formatting
   - Check Open Graph image usage
   - Verify snippet utility usage where applicable

3. **Fix Missing/Poor Descriptions**
   - Add descriptions to pages missing them
   - Improve generic descriptions
   - Standardize description length (150-160 chars)
   - Use `createPlainSnippet()` for dynamic content

### Pages Requiring Attention

**Front Page (index.astro):**
```astro
// Current: May lack proper description
// Proposed:
<Page 
  title="Pelilauta - RPG Community"
  description="Finnish role-playing game community for discussions, campaign wikis, and character management. Join thousands of gamers sharing stories and adventures."
>
```

**Channel Pages (channels/[channel].astro):**
```astro
// Current: Uses channel.description (good)
// Verify: Description length is appropriate (150-160 chars)
// Consider: Truncate long descriptions with createPlainSnippet()
```

**Site List (sites/index.astro):**
```astro
// Current: May lack description
// Proposed:
<Page 
  title="Campaign Wikis - Pelilauta"
  description="Browse community game wikis and campaign sites. Create and share your own RPG campaign worlds, NPCs, locations, and game resources."
>
```

**Character Library (library/characters.astro):**
```astro
// Current: Has description (verify quality)
// Review: Ensure description is compelling and SEO-friendly
```

**Documentation Pages (docs/[id].astro):**
```astro
// Dynamic descriptions based on document content
// Use createPlainSnippet() for document preview
```

**Tag Pages (tags/[tag].astro):**
```astro
// Current: "A list of threads with this tag" (too generic)
// Proposed: Use createPlainSnippet() from top threads or
// "Discussions tagged #${tag} - explore conversations about ${tag} in the Pelilauta RPG community"
```

**Profile Pages (profiles/[uid].astro):**
```astro
// Dynamic descriptions based on user bio
// Use createPlainSnippet(profile.bio, 160) or fallback
```

### Implementation Checklist

- [ ] **Audit all public pages** (create spreadsheet with findings)
- [ ] **Front page**: Add/improve description
- [ ] **Channel index**: Add/improve description
- [ ] **Channel pages**: Verify description quality, truncate if needed
- [ ] **Thread pages**: Already done ✅ (PBI-023)
- [ ] **Site list**: Add/improve description
- [ ] **Site pages**: Verify description from site.description, truncate if needed
- [ ] **Site wiki pages**: Verify page descriptions
- [ ] **Tag pages**: Improve generic description
- [ ] **Character library**: Verify description quality
- [ ] **Profile pages**: Add dynamic descriptions using user bio
- [ ] **Documentation pages**: Add/improve descriptions
- [ ] **Login page**: Add appropriate description
- [ ] **EULA page**: Add appropriate description
- [ ] **Search page**: Add description (note: low unique content)
- [ ] **404/403 pages**: Add appropriate descriptions

### SEO Enhancement Examples

```astro
---
// Example 1: Static description with SEO focus
import Page from '@layouts/Page.astro';

const title = 'Campaign Wikis';
const description = 'Explore community RPG campaign wikis. Create wiki sites for your tabletop games, manage NPCs, locations, and shared game resources.';
---

<Page {title} {description}>
  <!-- Page content -->
</Page>
```

```astro
---
// Example 2: Dynamic description using snippet utility
import Page from '@layouts/Page.astro';
import { createPlainSnippet } from '@utils/snippetHelpers';

const site = await getSite(siteKey);
const description = site.description 
  ? createPlainSnippet(site.description, 160)
  : `${site.name} - A role-playing game campaign wiki on Pelilauta`;
---

<Page title={site.name} {description}>
  <!-- Page content -->
</Page>
```

```astro
---
// Example 3: Description with fallback
import Page from '@layouts/Page.astro';
import { createPlainSnippet } from '@utils/snippetHelpers';

const user = await getProfile(uid);
const description = user.bio
  ? createPlainSnippet(user.bio, 160)
  : `${user.nick} - Pelilauta community member and role-playing game enthusiast`;
---

<Page title={user.nick} {description}>
  <!-- Page content -->
</Page>
```

---

## Phase 3: Indexing Control Verification

### Audit Process

1. **Identify All Non-Public Routes**
   - Admin pages
   - Settings pages
   - Creation workflows
   - Authentication pages
   - Private tools

2. **Verify noSharing Implementation**
   - Check each page for `noSharing` prop
   - Verify BaseHead properly adds `noindex, nofollow`
   - Test with Google Search Console

3. **Fix Missing Indexing Controls**
   - Add `noSharing={true}` to all private pages
   - Verify robots.txt configuration
   - Check sitemap excludes private routes

### Non-Indexable Routes Checklist

**Admin Routes:**
- [ ] `/admin/index.astro` - noSharing verification
- [ ] `/admin/channels.astro` - noSharing verification
- [ ] `/admin/channels/add.astro` - noSharing verification
- [ ] `/admin/messaging.astro` - noSharing verification
- [ ] `/admin/sites.astro` - noSharing verification
- [ ] `/admin/users.astro` - noSharing verification
- [ ] `/admin/sheets/*.astro` - noSharing verification

**User Settings & Auth:**
- [ ] `/settings.astro` - noSharing verification ✅
- [ ] `/create-profile.astro` - noSharing verification
- [ ] `/onboarding.astro` - noSharing verification
- [ ] `/logout.astro` - noSharing verification
- [ ] `/403.astro` - noSharing verification ✅
- [ ] `/404.astro` - noSharing consideration (may be indexable for SEO)

**Content Creation:**
- [ ] `/create/thread.astro` - noSharing verification
- [ ] `/create/site.astro` - noSharing verification
- [ ] `/create/character.astro` - noSharing verification ✅

**Site Management:**
- [ ] `/sites/[siteKey]/keeper.astro` - noSharing verification ✅
- [ ] `/sites/[siteKey]/settings.astro` - noSharing verification
- [ ] `/sites/[siteKey]/options.astro` - noSharing verification
- [ ] `/sites/[siteKey]/import.astro` - noSharing verification
- [ ] `/sites/[siteKey]/data.astro` - noSharing verification
- [ ] `/sites/[siteKey]/members.astro` - noSharing verification
- [ ] `/sites/[siteKey]/clocks.astro` - noSharing verification
- [ ] `/sites/[siteKey]/assets/*.astro` - noSharing verification
- [ ] `/sites/[siteKey]/handouts/*.astro` - noSharing verification ✅
- [ ] `/sites/[siteKey]/create/*.astro` - noSharing verification
- [ ] `/sites/[siteKey]/[pageKey]/edit.astro` - noSharing verification
- [ ] `/sites/[siteKey]/[pageKey]/delete.astro` - noSharing verification
- [ ] `/sites/[siteKey]/[pageKey]/history.astro` - noSharing consideration

**Character Management:**
- [ ] `/characters/[key]/edit.astro` - noSharing verification
- [ ] `/characters/[key]/delete.astro` - noSharing verification

**Thread Management:**
- [ ] `/threads/[key]/confirmDelete.astro` - noSharing verification
- [ ] `/threads/[key]/replies/[replyKey]/delete.astro` - noSharing verification
- [ ] `/threads/[key]/replies/[replyKey]/fork.astro` - noSharing verification

### Verification Methods

**1. Code Review:**
```typescript
// Verify BaseHead implementation
{noSharing && <meta name="robots" content="noindex, nofollow" />}
```

**2. Manual Testing:**
- Load each private page
- Check HTML source for robots meta tag
- Verify tag shows: `<meta name="robots" content="noindex, nofollow" />`

**3. Automated Test:**
Create E2E test to verify noSharing pages:
```typescript
test('private pages should not be indexable', async ({ page }) => {
  const privateRoutes = [
    '/admin',
    '/settings',
    '/create/thread',
    // ... more routes
  ];
  
  for (const route of privateRoutes) {
    await page.goto(route);
    const robotsMeta = await page.locator('meta[name="robots"]');
    await expect(robotsMeta).toHaveAttribute('content', 'noindex, nofollow');
  }
});
```

**4. robots.txt Review:**
Ensure robots.txt properly disallows private sections:
```txt
User-agent: *
Disallow: /admin/
Disallow: /settings
Disallow: /create/
Disallow: /*/edit
Disallow: /*/delete
Disallow: /*/settings
Disallow: /*/options
Disallow: /*/import
Disallow: /*/data
Disallow: /*/keeper
```

---

## Acceptance Criteria

### Phase 1: Documentation
- [ ] Created `src/docs/77-public-pages-seo.md`
- [ ] Documented all public page routes with purposes
- [ ] Categorized indexable vs. non-indexable pages
- [ ] Included SEO best practices and guidelines
- [ ] Added snippet utility usage recommendations
- [ ] Created page tree hierarchy visualization
- [ ] Documented current implementation status

### Phase 2: SEO Metadata
- [ ] Audited all public pages for SEO metadata
- [ ] All public pages have descriptions (150-160 chars)
- [ ] Descriptions are user-friendly and SEO-optimized
- [ ] Dynamic content uses `createPlainSnippet()` appropriately
- [ ] All page titles follow consistent format
- [ ] Open Graph images properly configured
- [ ] No duplicate or generic descriptions remain
- [ ] Meta descriptions tested in Google Search Console

### Phase 3: Indexing Control
- [ ] All admin pages use `noSharing={true}`
- [ ] All settings/auth pages use `noSharing={true}`
- [ ] All creation workflows use `noSharing={true}`
- [ ] All editing/deletion pages use `noSharing={true}`
- [ ] All private tools use `noSharing={true}`
- [ ] robots.txt properly configured
- [ ] E2E tests verify noSharing implementation
- [ ] Manual verification completed
- [ ] Google Search Console shows no indexed private pages

### Testing & Validation
- [ ] All pages render with proper meta tags
- [ ] No TypeScript or linting errors
- [ ] E2E test suite includes indexing verification
- [ ] Manual SEO audit shows improvements
- [ ] Google Search Console configured and monitored

### Documentation
- [ ] Public page documentation complete
- [ ] SEO guidelines documented
- [ ] Implementation notes added to relevant pages
- [ ] PBI marked as complete

---

## Technical Implementation Notes

### Using createPlainSnippet() for Dynamic Descriptions

```astro
---
import { createPlainSnippet } from '@utils/snippetHelpers';

// For markdown content
const description = createPlainSnippet(content.markdownContent, 160);

// With fallback
const description = content.description
  ? createPlainSnippet(content.description, 160)
  : 'Default fallback description';

// For user-generated content with safety
const description = user.bio?.trim()
  ? createPlainSnippet(user.bio, 160)
  : `${user.nick} - Pelilauta community member`;
---

<Page title={title} {description}>
```

### Ensuring noSharing Prop

```astro
---
// For all private/admin pages
import ModalPage from '@layouts/ModalPage.astro';
---

<ModalPage title="Admin Dashboard" noSharing={true}>
  <!-- Private content -->
</ModalPage>
```

### robots.txt Configuration

Ensure `/public/robots.txt` includes:
```txt
User-agent: *
Allow: /
Disallow: /admin/
Disallow: /settings
Disallow: /create/
Disallow: /onboarding
Disallow: /*/edit
Disallow: /*/delete
Disallow: /*/settings
Disallow: /*/options
Disallow: /*/import
Disallow: /*/data
Disallow: /*/keeper
Disallow: /*/members
Disallow: /*/assets
Disallow: /api/

Sitemap: https://pelilauta.org/sitemap.xml
```

---

## Dependencies

- **PBI-023**: Snippet utility implementation (prerequisite - completed ✅)
- **marked**: For rendering markdown in dynamic descriptions (already available)
- **Google Search Console**: For SEO verification and monitoring
- **Astro layouts**: Existing layout system with `noSharing` prop support

---

## Out of Scope (Future Enhancements)

- **Automated Sitemap Generation**: Dynamic sitemap.xml generation
- **Structured Data/Schema.org**: Rich snippets with JSON-LD
- **Open Graph Image Generation**: Dynamic OG image creation
- **Multi-language SEO**: Hreflang tags for i18n
- **SEO Monitoring Dashboard**: Automated SEO health checks
- **Search Console Integration**: Automated reporting
- **Page Speed Optimization**: Separate performance PBI
- **Social Media Cards**: Enhanced preview cards beyond basic OG tags

---

## Migration Strategy

### Week 1: Documentation & Audit
1. Create public pages documentation
2. Audit all pages for SEO metadata
3. Create prioritized fix list
4. Document current state

### Week 2: Implementation
1. Fix high-priority public pages (front, channels, threads, sites)
2. Verify and fix noSharing on admin pages
3. Add missing descriptions to public pages
4. Update robots.txt if needed

### Week 3: Verification & Testing
1. Create E2E tests for indexing controls
2. Manual verification of all changes
3. Google Search Console configuration
4. Monitor indexing changes
5. Final documentation updates

---

## Success Metrics

- **SEO Coverage**: 100% of public pages have quality descriptions
- **Indexing Control**: 100% of private pages use noSharing
- **Description Quality**: All descriptions 150-160 characters
- **Search Visibility**: Improved search console impressions (monitor post-deployment)
- **Documentation**: Complete public page tree documentation
- **Testing**: E2E tests verify indexing controls
- **Zero Regressions**: No public pages accidentally de-indexed

---

## Related PBIs

- **PBI-023**: Robust Markdown Snippet Utility (prerequisite - completed)
- **Future PBI**: Structured Data Implementation (schema.org/JSON-LD)
- **Future PBI**: Automated Sitemap Generation
- **Future PBI**: Performance Optimization (Core Web Vitals)

---

## Notes

- This PBI focuses on SEO fundamentals and indexing control
- Advanced features (structured data, dynamic sitemaps) are intentionally out of scope
- Success depends on completing PBI-023 first for proper snippet generation
- Google Search Console should be monitored after changes to verify indexing
- Consider creating automated SEO health check tools in future iterations

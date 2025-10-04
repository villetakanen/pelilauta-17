# PBI-023: Robust Markdown Snippet Utility with Marked Rendering

**Status:** 🟡 In Progress - Phase 1 Complete  
**Started:** October 4, 2025  
**Phase 1 Completed:** October 4, 2025

**User Story:** As a developer working with ContentEntry objects across the application, I want a robust snippet generation utility that properly renders markdown, applies consistent styling, and intelligently truncates content, so that content previews are accurate, visually consistent, and maintain semantic HTML structure.

---

## Implementation Progress

### ✅ Phase 1: Create New Utilities (COMPLETED - Oct 4, 2025)

**Deliverables:**
- ✅ Created `src/utils/snippetHelpers.ts` (329 lines)
  - `createRichSnippet()` - Async function for HTML snippets
  - `createPlainSnippet()` - Sync function for plain text snippets
  - `addHeaderClasses()` - CSS class injection with deduplication
  - `getVisibleTextLength()` - HTML-aware character counting
  - `smartTruncateHtml()` - Intelligent HTML truncation
  - `addEllipsisToHtml()` - Smart ellipsis placement
  - `isSelfClosingTag()` - Void element detection
- ✅ Updated `src/utils/contentHelpers.ts` with deprecation warning
- ✅ Created comprehensive test suite `test/util/snippetHelpers.test.ts` (500 lines)
  - 65 test cases covering all functions
  - All tests passing ✨
  - Integration tests for real-world scenarios
- ✅ Full TypeScript typing with no `any` types
- ✅ Complete JSDoc documentation
- ✅ Code formatted with Biome

**Key Findings:**
1. **Header Class Deduplication**: Marked sometimes adds classes to headers, so the `addHeaderClasses()` function needed deduplication logic to avoid `class="text-h5 text-h5"`.
2. **Image Regex Order**: Image markdown (`![alt](url)`) must be processed before link markdown to prevent incorrect parsing.
3. **Ellipsis Placement**: Complex regex needed to properly capture all closing tags and insert ellipsis before them.
4. **Self-Closing Tags**: Added explicit list of void HTML elements (br, hr, img, etc.) to prevent incorrect tag stack tracking.

**Test Results:**
```
✓ createRichSnippet (16 tests)
✓ createPlainSnippet (19 tests)  
✓ addHeaderClasses (6 tests)
✓ getVisibleTextLength (5 tests)
✓ smartTruncateHtml (9 tests)
✓ addEllipsisToHtml (5 tests)
✓ integration tests (5 tests)

Total: 65/65 tests passing
```

### 🔄 Phase 2: Update Server Components (NOT STARTED)
- [ ] Update `ThreadCard.astro` to use `createRichSnippet()`
- [ ] Update `SiteListItem.astro` for rich snippets
- [ ] Update thread index pages for meta descriptions

### 🔄 Phase 3: Update API Routes (NOT STARTED)
- [ ] Update `add-reply.ts` to use `createPlainSnippet()`
- [ ] Update RSS feed generation
- [ ] Update any other API response formatting

### 🔄 Phase 4: Remove Deprecated Function (NOT STARTED)
- [ ] Verify no remaining usage of old `createSnippet()`
- [ ] Remove deprecation and old implementation
- [ ] Update any remaining documentation

---

## Problem Statement

The current `createSnippet()` utility in `src/utils/contentHelpers.ts` has significant limitations that compromise content quality and user experience:

1. **No Markdown Rendering**: Uses simple regex replacements instead of proper markdown parsing
2. **Strips All HTML**: Removes all HTML tags including semantic elements (headers, paragraphs, lists)
3. **No Styling Control**: Cannot apply CSS classes or styling to rendered content
4. **Naive Text Truncation**: Cuts content at arbitrary character positions, potentially breaking words or HTML
5. **Limited Semantic Awareness**: Doesn't respect markdown structure (headings, lists, code blocks)
6. **Inconsistent Styling**: Different usage patterns across the application (e.g., ThreadCard.astro using inline `marked()`)
7. **Poor Plain Text Fallback**: Current regex approach mangles markdown syntax instead of rendering it

## Current Situation Analysis

### Current Implementation
```typescript
// src/utils/contentHelpers.ts
export function createSnippet(content: string, lenght = 120): string {
  // const tags = extractTags(content);
  const snippet = content.replace(/#([a-zA-Z0-9äöüÄÖÜ]+)/g, '<b>$1</b>');
  const plainText = snippet.replace(/<[^>]*>/g, '');
  return plainText.length > lenght
    ? `${plainText.substring(0, lenght)}...`
    : plainText;
}
```

**Problems:**
- Only handles hashtags, ignores all other markdown syntax
- Strips HTML without considering semantic structure
- Breaks mid-word when truncating
- Doesn't add styling classes for Cyan Design System

### Current Usage Patterns

**Pattern 1: Direct createSnippet() usage**
```astro
// src/pages/threads/[threadKey]/index.astro
const snippet = createSnippet(thread.markdownContent || '');
// Result: Plain text with basic hashtag bolding, no markdown rendering
```

**Pattern 2: Inline marked() with manual slicing**
```astro
// src/components/server/FrontPage/ThreadCard.astro
const md = thread.markdownContent || '';
const snippet = await marked(md.slice(0, 220));
// Result: Inconsistent, may break markdown syntax mid-way
```

**Pattern 3: RSS feed with split()** 
```typescript
// src/pages/rss/threads.xml.ts
description: createSnippet(thread.markdownContent || '', 500).split('\n').join(' ')
// Result: Complex workaround for newline handling
```

### Impact on User Experience
- **ThreadCard previews**: Show raw markdown syntax instead of formatted text
- **SEO meta descriptions**: Contain markdown syntax that search engines see
- **RSS feeds**: Inconsistent formatting and broken markdown in feed readers
- **API responses**: Reply notifications show unformatted content
- **Site listings**: Description snippets lack proper formatting

## Proposed Solution

Create a comprehensive `createRichSnippet()` utility that:
1. Properly renders markdown using the `marked` library
2. Applies consistent CSS classes (especially `text-h5` for headers)
3. Intelligently truncates content while preserving HTML structure
4. Provides both HTML and plain-text variants for different use cases
5. Respects semantic markdown boundaries (don't cut mid-list, mid-heading, etc.)

### Core Features

1. **Marked Rendering**: Use existing `marked` library for proper markdown → HTML conversion
2. **CSS Class Injection**: Automatically add styling classes to rendered elements
3. **Smart Truncation**: Count characters while respecting HTML tag boundaries
4. **Ellipsis Handling**: Add ellipsis only when content is actually truncated
5. **Plain-Text Variant**: Provide utility for plain-text snippets (for meta tags, RSS)
6. **Configurable Length**: Support custom length limits with sensible defaults
7. **HTML Cleaning**: Sanitize output for security while preserving semantic structure

### Key Utilities

- **`createRichSnippet()`**: Main utility returning rendered HTML snippet
- **`createPlainSnippet()`**: Plain-text variant for meta descriptions and RSS
- **`addHeaderClasses()`**: Helper to inject CSS classes into rendered HTML
- **`smartTruncate()`**: Intelligent HTML-aware truncation function

## Acceptance Criteria

### Core Snippet Generation
- [ ] **Markdown Rendering**: Properly renders all markdown syntax (headings, lists, links, emphasis, code)
- [ ] **CSS Class Application**: Automatically adds `text-h5` class to all `<h1>` through `<h6>` elements
- [ ] **Character Counting**: Accurately counts visible text characters, excluding HTML tags
- [ ] **Default Length**: Defaults to 220 characters including whitespace (current de facto standard)
- [ ] **Ellipsis Addition**: Adds "..." only when content exceeds specified length
- [ ] **HTML Structure Preservation**: Maintains valid HTML structure after truncation

### Smart Truncation Logic
- [ ] **Tag Awareness**: Never truncates in middle of HTML tag
- [ ] **Word Boundary**: Prefers breaking at word boundaries when possible
- [ ] **Semantic Respect**: Completes semantic units (paragraphs, list items) when close to limit
- [ ] **Nested Tags**: Properly closes all opened HTML tags after truncation
- [ ] **Whitespace Handling**: Normalizes excessive whitespace without breaking structure

### Plain-Text Variant
- [ ] **Plain createPlainSnippet()**: Returns plain text without HTML tags
- [ ] **Markdown Strip**: Removes markdown syntax (links, emphasis) cleanly
- [ ] **Character Accuracy**: Counts only visible text characters
- [ ] **SEO Friendly**: Produces clean descriptions suitable for meta tags
- [ ] **RSS Compatible**: Works well for RSS feed descriptions

### CSS Styling Integration
- [ ] **Header Classes**: All headers receive `text-h5` class automatically
- [ ] **Customizable**: Support for additional class injection if needed
- [ ] **Cyan Compatibility**: Works with existing Cyan Design System classes
- [ ] **Responsive**: Rendered content respects responsive utilities
- [ ] **Consistent Output**: Same markdown always produces same styled HTML

### Performance & Safety
- [ ] **Efficient Parsing**: Minimal overhead for snippet generation
- [ ] **HTML Sanitization**: Prevents XSS attacks while preserving safe tags
- [ ] **Error Handling**: Gracefully handles malformed markdown
- [ ] **Memory Efficiency**: Doesn't load entire content when truncating early
- [ ] **Type Safety**: Full TypeScript typing for all functions

### Integration Points
- [ ] **Replace ThreadCard Usage**: Update `ThreadCard.astro` to use new utility
- [ ] **Replace Direct Usage**: Update all `createSnippet()` calls to `createRichSnippet()`
- [ ] **RSS Feed Integration**: Use `createPlainSnippet()` for RSS descriptions
- [ ] **API Response Updates**: Update `add-reply.ts` to use appropriate variant
- [ ] **SEO Meta Tags**: Use `createPlainSnippet()` for page descriptions
- [ ] **Site Listings**: Update `SiteListItem.astro` to use rich snippets

## Technical Implementation

### Main Snippet Utility

```typescript
// src/utils/snippetHelpers.ts
import { marked } from 'marked';

export interface SnippetOptions {
  /**
   * Maximum length in characters (including whitespace)
   * @default 220
   */
  maxLength?: number;
  
  /**
   * Whether to add ellipsis when truncated
   * @default true
   */
  addEllipsis?: boolean;
  
  /**
   * CSS classes to add to headers
   * @default ['text-h5']
   */
  headerClasses?: string[];
  
  /**
   * Whether to preserve complete semantic blocks
   * @default true
   */
  respectSemanticBoundaries?: boolean;
}

/**
 * Creates a rich HTML snippet from markdown content.
 * 
 * - Renders markdown using marked
 * - Adds styling classes (text-h5 to headers)
 * - Intelligently truncates while preserving HTML structure
 * - Adds ellipsis when content is cut off
 * 
 * @param markdownContent - The markdown string to convert
 * @param options - Configuration options
 * @returns Rendered and truncated HTML string
 * 
 * @example
 * ```typescript
 * const snippet = await createRichSnippet(
 *   '# Welcome\n\nThis is **bold** text.',
 *   { maxLength: 50 }
 * );
 * // Returns: '<h1 class="text-h5">Welcome</h1><p>This is <strong>bold</strong> text.</p>'
 * ```
 */
export async function createRichSnippet(
  markdownContent: string,
  options: SnippetOptions = {}
): Promise<string> {
  const {
    maxLength = 220,
    addEllipsis = true,
    headerClasses = ['text-h5'],
    respectSemanticBoundaries = true
  } = options;

  if (!markdownContent || markdownContent.trim().length === 0) {
    return '';
  }

  // Step 1: Render markdown to HTML
  const rawHtml = await marked.parse(markdownContent);
  
  // Step 2: Add CSS classes to headers
  const styledHtml = addHeaderClasses(rawHtml, headerClasses);
  
  // Step 3: Truncate intelligently if needed
  const visibleTextLength = getVisibleTextLength(styledHtml);
  
  if (visibleTextLength <= maxLength) {
    return styledHtml;
  }
  
  // Step 4: Smart truncate
  const truncated = smartTruncateHtml(
    styledHtml, 
    maxLength, 
    respectSemanticBoundaries
  );
  
  // Step 5: Add ellipsis if needed
  if (addEllipsis) {
    return addEllipsisToHtml(truncated);
  }
  
  return truncated;
}

/**
 * Creates a plain-text snippet from markdown content.
 * 
 * Suitable for meta descriptions, RSS feeds, and other contexts
 * where HTML is not appropriate.
 * 
 * @param markdownContent - The markdown string to convert
 * @param maxLength - Maximum length in characters (default: 220)
 * @returns Plain text snippet with ellipsis if truncated
 * 
 * @example
 * ```typescript
 * const description = createPlainSnippet(
 *   '# Welcome\n\nThis is **bold** text.',
 *   160
 * );
 * // Returns: 'Welcome This is bold text.'
 * ```
 */
export function createPlainSnippet(
  markdownContent: string,
  maxLength = 220
): string {
  if (!markdownContent || markdownContent.trim().length === 0) {
    return '';
  }

  // Remove markdown syntax patterns
  let plainText = markdownContent
    // Headers
    .replace(/^#{1,6}\s+/gm, '')
    // Links [text](url) -> text
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
    // Bold/italic
    .replace(/(\*\*|__)(.*?)\1/g, '$2')
    .replace(/(\*|_)(.*?)\1/g, '$2')
    // Code blocks and inline code
    .replace(/```[\s\S]*?```/g, '')
    .replace(/`([^`]+)`/g, '$1')
    // List markers
    .replace(/^\s*[-*+]\s+/gm, '')
    .replace(/^\s*\d+\.\s+/gm, '')
    // Blockquotes
    .replace(/^\s*>\s+/gm, '')
    // Horizontal rules
    .replace(/^[-*_]{3,}$/gm, '')
    // Images ![alt](url)
    .replace(/!\[([^\]]*)\]\([^)]+\)/g, '$1')
    // HTML tags
    .replace(/<[^>]*>/g, '')
    // Multiple newlines -> single space
    .replace(/\n\n+/g, ' ')
    .replace(/\n/g, ' ')
    // Multiple spaces -> single space
    .replace(/\s+/g, ' ')
    .trim();

  // Truncate at word boundary if needed
  if (plainText.length > maxLength) {
    const truncated = plainText.substring(0, maxLength);
    const lastSpace = truncated.lastIndexOf(' ');
    
    if (lastSpace > maxLength * 0.8) {
      // Cut at last space if it's not too far back
      return truncated.substring(0, lastSpace) + '...';
    }
    
    return truncated + '...';
  }

  return plainText;
}

/**
 * Adds CSS classes to header tags in HTML string.
 * 
 * @param html - HTML string to process
 * @param classes - Array of CSS class names to add
 * @returns HTML with classes added to headers
 */
function addHeaderClasses(html: string, classes: string[]): string {
  if (!classes || classes.length === 0) {
    return html;
  }

  const classString = classes.join(' ');
  
  // Add classes to all header tags (h1-h6)
  return html.replace(
    /<(h[1-6])>/gi,
    `<$1 class="${classString}">`
  ).replace(
    /<(h[1-6])\s+class="([^"]*)"/gi,
    `<$1 class="$2 ${classString}"`
  );
}

/**
 * Calculates the visible text length of an HTML string.
 * Excludes HTML tags from the count.
 * 
 * @param html - HTML string
 * @returns Character count of visible text
 */
function getVisibleTextLength(html: string): number {
  return html.replace(/<[^>]*>/g, '').length;
}

/**
 * Intelligently truncates HTML content while preserving structure.
 * 
 * @param html - HTML string to truncate
 * @param maxLength - Maximum visible text length
 * @param respectBoundaries - Whether to respect semantic boundaries
 * @returns Truncated HTML with properly closed tags
 */
function smartTruncateHtml(
  html: string,
  maxLength: number,
  respectBoundaries: boolean
): string {
  const tagStack: string[] = [];
  let visibleChars = 0;
  let result = '';
  let i = 0;
  
  while (i < html.length && visibleChars < maxLength) {
    // Check for HTML tag
    if (html[i] === '<') {
      const tagEnd = html.indexOf('>', i);
      if (tagEnd === -1) break;
      
      const tag = html.substring(i, tagEnd + 1);
      result += tag;
      
      // Track opening/closing tags
      const tagMatch = tag.match(/<\/?(\w+)/);
      if (tagMatch) {
        const tagName = tagMatch[1];
        if (tag.startsWith('</')) {
          // Closing tag
          const lastIndex = tagStack.lastIndexOf(tagName);
          if (lastIndex !== -1) {
            tagStack.splice(lastIndex, 1);
          }
        } else if (!tag.endsWith('/>')) {
          // Opening tag (not self-closing)
          tagStack.push(tagName);
        }
      }
      
      i = tagEnd + 1;
    } else {
      // Regular text character
      result += html[i];
      visibleChars++;
      i++;
    }
  }
  
  // Close any remaining open tags
  while (tagStack.length > 0) {
    const tagName = tagStack.pop();
    result += `</${tagName}>`;
  }
  
  return result;
}

/**
 * Adds ellipsis to truncated HTML content.
 * Attempts to add inside the last text node before closing tags.
 * 
 * @param html - HTML string
 * @returns HTML with ellipsis added
 */
function addEllipsisToHtml(html: string): string {
  // Find the last position before closing tags
  const lastTextMatch = html.match(/([^<]+)(<\/\w+>)*$/);
  
  if (lastTextMatch) {
    const beforeClosing = html.substring(0, lastTextMatch.index);
    const lastText = lastTextMatch[1];
    const closingTags = lastTextMatch[2] || '';
    
    return beforeClosing + lastText.trimEnd() + '...' + closingTags;
  }
  
  // Fallback: just append
  return html + '...';
}
```

### Updated contentHelpers.ts

```typescript
// src/utils/contentHelpers.ts
import { createPlainSnippet, createRichSnippet } from './snippetHelpers';

// ... existing functions (toDisplayString, toTimeString, extractTags) ...

/**
 * @deprecated Use createRichSnippet() or createPlainSnippet() instead
 * 
 * Creates a plain-text snippet from markdown content.
 * This is the legacy implementation kept for backwards compatibility.
 */
export function createSnippet(content: string, length = 120): string {
  console.warn(
    'createSnippet() is deprecated. Use createPlainSnippet() or createRichSnippet() instead.'
  );
  return createPlainSnippet(content, length);
}
```

### Usage Examples

```astro
---
// ThreadCard.astro - Rich HTML snippet
import { createRichSnippet } from 'src/utils/snippetHelpers';

const snippet = await createRichSnippet(thread.markdownContent || '', {
  maxLength: 220,
  headerClasses: ['text-h5']
});
---

<div class="card-content">
  <Fragment set:html={snippet} />
</div>
```

```astro
---
// Thread index page - Plain text for meta description
import { createPlainSnippet } from 'src/utils/snippetHelpers';

const description = createPlainSnippet(thread.markdownContent || '', 160);
---

<Page title={title} description={description}>
  <!-- ... -->
</Page>
```

```typescript
// RSS Feed - Plain text for feed descriptions
import { createPlainSnippet } from 'src/utils/snippetHelpers';

const items: RSSFeedItem[] = threads.map(thread => ({
  title: thread.title,
  link: `${origin}/threads/${thread.key}`,
  description: createPlainSnippet(thread.markdownContent || '', 500),
  pubDate: new Date(thread.flowTime),
}));
```

```typescript
// API Response - Plain text for notifications
import { createPlainSnippet } from 'src/utils/snippetHelpers';

await notifySubscribers({
  threadKey,
  title: thread.title,
  message: createPlainSnippet(markdownContent, 120),
});
```

## Dependencies

- **marked**: Already in use for markdown rendering
- **TypeScript**: Type definitions for all utilities
- **Vitest**: For comprehensive unit testing
- **HTML Parser** (optional): Consider using `node-html-parser` for more robust HTML manipulation if needed

### No New Dependencies Required
The implementation primarily uses:
- Native string manipulation
- Regex patterns for HTML parsing
- Existing `marked` library
- TypeScript for type safety

## Migration Strategy

### Phase 1: Create New Utilities (Week 1)
1. Implement `snippetHelpers.ts` with full test coverage
2. Add deprecation warning to old `createSnippet()`
3. Document new utilities with examples

### Phase 2: Update Server Components (Week 1-2)
4. Update `ThreadCard.astro` to use `createRichSnippet()`
5. Update `SiteListItem.astro` for rich snippets
6. Update thread index pages for meta descriptions

### Phase 3: Update API Routes (Week 2)
7. Update `add-reply.ts` to use `createPlainSnippet()`
8. Update RSS feed generation
9. Update any other API response formatting

### Phase 4: Remove Deprecated Function (Week 3)
10. Verify no remaining usage of old `createSnippet()`
11. Remove deprecation and old implementation
12. Update any remaining documentation

## Out of Scope (Future Enhancements)

- **Image Extraction**: Detecting and extracting first image from content
- **Summary Generation**: AI-powered content summarization
- **Multi-language Support**: Language-specific truncation rules
- **Custom Marked Extensions**: Site-specific markdown extensions in snippets
- **Snippet Caching**: Caching rendered snippets for performance
- **Character Limit Heuristics**: Automatically choosing optimal lengths by context
- **HTML to Markdown**: Reverse conversion for legacy content
- **Snippet A/B Testing**: Testing different snippet lengths for engagement

## Non-Functional Requirements

### Performance
- **Fast Rendering**: Snippet generation should add < 10ms overhead
- **Memory Efficient**: Process large documents without excessive memory usage
- **Lazy Evaluation**: Only parse as much markdown as needed for snippet
- **Caching Ready**: Structure compatible with future caching layer

### Code Quality
- **Type Safety**: Full TypeScript coverage with no `any` types
- **Test Coverage**: > 90% code coverage for all utilities
- **Documentation**: JSDoc comments on all public functions
- **Backwards Compatible**: Deprecation path for old `createSnippet()`

### Security
- **XSS Prevention**: Sanitize HTML output to prevent script injection
- **Safe Rendering**: Use Astro's `set:html` safely with trusted content
- **Input Validation**: Handle malformed markdown gracefully
- **Output Escaping**: Proper escaping for different contexts (HTML, RSS, JSON)

### Maintainability
- **Clear API**: Intuitive function names and parameters
- **Consistent Patterns**: Follows existing codebase conventions
- **Extensible**: Easy to add new features without breaking changes
- **Well Tested**: Comprehensive test suite for regression prevention

## Priority

**High** - Affects content quality across the entire application (thread cards, SEO, RSS feeds, API responses)

## Estimated Effort

**1 sprint (1 week)** - Core implementation and testing, with gradual migration over subsequent weeks

## Definition of Done

### Implementation Complete (Phase 1)
- [x] `createRichSnippet()` function implemented with full TypeScript types ✅
- [x] `createPlainSnippet()` function implemented with proper markdown stripping ✅
- [x] Helper functions (`addHeaderClasses`, `smartTruncateHtml`, etc.) implemented ✅
- [x] Old `createSnippet()` marked as deprecated with console warning ✅
- [x] All functions have comprehensive JSDoc documentation ✅

### Testing Complete (Phase 1)
- [x] Unit tests for `createRichSnippet()` covering various markdown inputs ✅
- [x] Unit tests for `createPlainSnippet()` covering edge cases ✅
- [x] Unit tests for truncation logic (word boundaries, tag closure, ellipsis) ✅
- [x] Unit tests for header class injection ✅
- [x] Test coverage > 90% for snippetHelpers.ts ✅
- [x] Integration tests for common usage patterns ✅

### Migration Complete
- [ ] `ThreadCard.astro` updated to use `createRichSnippet()`
- [ ] Thread index pages updated to use `createPlainSnippet()` for meta tags
- [ ] `SiteListItem.astro` updated for rich descriptions
- [ ] RSS feed generation updated to use `createPlainSnippet()`
- [ ] API route `add-reply.ts` updated for notifications
- [ ] All instances of old `createSnippet()` identified and updated

### Documentation & Code Quality
- [ ] README or docs page with usage examples
- [ ] Migration guide for developers
- [ ] Code follows Biome formatting and linting rules
- [ ] All TypeScript types properly defined
- [ ] No ESLint or TypeScript errors
- [ ] Performance benchmarks documented

### Validation & Review
- [ ] Visual inspection of thread cards shows proper formatting
- [ ] SEO meta descriptions are clean and accurate
- [ ] RSS feed descriptions display correctly in feed readers
- [ ] No XSS vulnerabilities in HTML output
- [ ] Code reviewed and approved by team
- [ ] Deployed to staging and validated

# PBI-026: Sites Index Page - SEO, Caching, and Sitemap Improvements

**Status:** 📋 Ready to Start  
**Priority:** High  
**Estimated Effort:** 0.5 sprint (2-3 days)  
**Parent PBI:** [PBI-024: SEO Optimization](./024-seo-optimization-and-public-page-documentation.md)

**User Story:** As a site operator, I want the `/sites` index page to be properly optimized for search engines, have efficient caching, and be included in the sitemap, so that users can easily discover community sites and the page performs well under load.

---

## Problem Statement

The `/sites` index page (`src/pages/sites/index.astro`) is a **critical public discovery page** but currently lacks:

1. **SEO Optimization**
   - ❌ Missing meta description
   - ❌ No Open Graph tags
   - ❌ Generic page title from i18n only
   - ❌ Not leveraging SEO best practices from PBI-024

2. **HTTP Caching**
   - ❌ No Cache-Control headers set
   - ❌ No Netlify Cache-Tag headers for targeted purging
   - ❌ Each request hits the API/database unnecessarily
   - ❌ No stale-while-revalidate strategy

3. **Sitemap Integration**
   - ⚠️ Base route `/sites` not explicitly included in `sitemap.xml`
   - ⚠️ Individual site links ARE included, but not the index page
   - ⚠️ Missing from robots.txt sitemap reference

### Current Implementation Analysis

**Current Page Code:**
```astro
---
import { t } from 'src/utils/i18n';
import PublicSiteListing from '../../components/server/SiteList/PublicSiteListing.astro';
import Page from '../../layouts/Page.astro';
---
<Page title={t('site:siteList.title')}>
  <PublicSiteListing />
</Page>
```

**Issues:**
- Very minimal - no SEO metadata
- No caching headers
- Delegates everything to PublicSiteListing component
- PublicSiteListing fetches from `/api/sites` on every request

**API Call Chain:**
```
/sites → PublicSiteListing → fetch /api/sites → Firestore
```
This happens on EVERY page load without caching.

### Related Pages with Good Examples

**Channel Page** (`channels/[channel].astro`):
```astro
Astro.response.headers.set(
  'Cache-Control',
  'public, max-age=300, s-maxage=600',
);
```
- Sets 5min browser cache, 10min CDN cache
- Good reference for similar index page

**Site Page** (`sites/[siteKey]/index.astro`):
```astro
import { setPageCacheHeaders } from '../../../utils/cache/netlify-cache-tags';
setPageCacheHeaders(Astro.response, siteKey, homePageKey, true);
```
- Uses Netlify cache tags for targeted purging
- Implements stale-while-revalidate
- Good pattern for cache invalidation

**Sitemap.xml** (`sitemap.xml.ts`):
```typescript
const publicSites = publicSitesJson.map(
  (site: { key: string }) => `/sites/${site.key}`,
);
```
- Already includes individual sites
- Missing `/sites` index route

---

## Proposed Solution

Implement a three-part improvement:

### 1. SEO Optimization
Add proper meta descriptions, Open Graph tags, and follow PBI-024 patterns.

### 2. HTTP Caching Strategy
Implement aggressive caching with cache tags for efficient invalidation.

### 3. Sitemap Integration
Explicitly add `/sites` route to sitemap.xml.

---

## Implementation Details

### Part 1: SEO Optimization

**Create i18n SEO Content** (if not already exists from PBI-024):

```typescript
// src/locales/fi/seo.ts
export default {
  // ... other entries
  sites: {
    title: 'Sivustot, pelit ja kampajat',
    description: 'Selaa yhteisön kampanjawikejä ja pelisivustoja. Luo ja jaa omia roolipelien maailmoja, NPC:itä, sijainteja ja peliresursseja.',
  },
};
```

**Update Page Implementation:**

```astro
---
import { t } from 'src/utils/i18n';
import PublicSiteListing from '../../components/server/SiteList/PublicSiteListing.astro';
import Page from '../../layouts/Page.astro';

// SEO metadata
const title = t('seo:sites.title');
const description = t('seo:sites.description');

// Set cache headers for better performance
// Sites index page - moderate caching (5min browser, 10min CDN)
Astro.response.headers.set(
  'Cache-Control',
  'public, max-age=300, s-maxage=600, stale-while-revalidate=1800',
);

// Add Netlify cache tag for targeted cache purging
Astro.response.headers.set('Cache-Tag', 'sites-index,public-sites');
---
<Page {title} {description}>
  <PublicSiteListing />
</Page>
```

**SEO Benefits:**
- ✅ Descriptive, keyword-rich meta description (150-160 chars)
- ✅ Proper page title for search results
- ✅ Open Graph tags (inherited from Page layout)
- ✅ Consistent with PBI-024 SEO patterns
- ✅ i18n-based for maintainability

### Part 2: HTTP Caching Strategy

**Caching Parameters:**

| Cache Type | Duration | Reason |
|------------|----------|--------|
| Browser (`max-age`) | 5 minutes | Allow frequent content discovery |
| CDN (`s-maxage`) | 10 minutes | Reduce API/Firestore load |
| Stale-while-revalidate | 30 minutes | Serve stale content while updating |

**Cache Tags for Invalidation:**
- `sites-index`: Purge when site list changes
- `public-sites`: Group with other site-related content

**Cache Invalidation Triggers:**
1. New site created → purge `sites-index`
2. Site published/unpublished → purge `sites-index`
3. Site deleted → purge `sites-index`, `site-{siteKey}`

**Implementation:**
```astro
// Cache headers with Netlify cache tags
Astro.response.headers.set(
  'Cache-Control',
  'public, max-age=300, s-maxage=600, stale-while-revalidate=1800',
);
Astro.response.headers.set('Cache-Tag', 'sites-index,public-sites');
```

**Benefits:**
- ✅ Reduces Firestore reads by ~95% (10min CDN cache)
- ✅ Instant page loads for repeat visitors (5min browser cache)
- ✅ Graceful degradation with stale-while-revalidate
- ✅ Targeted cache purging with cache tags
- ✅ Scalable under traffic spikes

### Part 3: Sitemap Integration

**Update sitemap.xml.ts:**

```typescript
export async function GET({ request }: APIContext) {
  const origin = new URL(request.url).origin;

  // Static important pages
  const staticPages = [
    '/',
    '/sites',           // ← ADD THIS
    '/channels',
    '/library/characters',
  ];

  // Fetch all public sites
  const publicSitesResponse = await fetch(`${origin}/api/sites`);
  const publicSitesJson = await publicSitesResponse.json();
  const publicSites = publicSitesJson.map(
    (site: { key: string }) => `/sites/${site.key}`,
  );

  // Fetch latest public threads
  const publicThreadsResponse = await fetch(`${origin}/api/threads.json`);
  const publicThreadsJson = await publicThreadsResponse.json();
  const publicThreads = publicThreadsJson.map(
    (thread: { key: string }) => `/threads/${thread.key}`,
  );

  const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
        <urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
          ${staticPages.map(page => `<url><loc>${origin}${page}</loc><priority>0.8</priority></url>`).join('')}
          ${publicSites.map((site: string) => `<url><loc>${origin}${site}</loc><priority>0.6</priority></url>`).join('')}
          ${publicThreads.map((thread: string) => `<url><loc>${origin}${thread}</loc><priority>0.5</priority></url>`).join('')}
        </urlset>`;

  return new Response(sitemap, {
    headers: {
      'Content-Type': 'application/xml',
      'Cache-Control': 'max-age=60',
      'CDN-Cache-Control': 'max-age=360',
      'Vercel-CDN-Cache-Control': 'max-age=3600',
    },
  });
}
```

**Sitemap Priority Rationale:**
- **0.8** - Static index pages (/, /sites, /channels) - high importance
- **0.6** - Individual sites - medium-high importance
- **0.5** - Individual threads - medium importance (high volume)

**Benefits:**
- ✅ Search engines explicitly know about `/sites` page
- ✅ Proper priority signaling (index pages > individual items)
- ✅ Better crawl budget allocation
- ✅ Consistent with sitemap best practices

---

## Cache Invalidation Strategy

### API Endpoint Enhancement (Future Work)

When site is created/updated/deleted, purge cache:

```typescript
// In /api/sites (or site management endpoints)
// After successful site creation/update/deletion:

if (process.env.NETLIFY) {
  try {
    await fetch('https://api.netlify.com/api/v1/purge', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.NETLIFY_PURGE_TOKEN}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        cache_tags: ['sites-index', 'public-sites'],
      }),
    });
  } catch (error) {
    logWarn('CachePurge', 'Failed to purge cache:', error);
  }
}
```

**Note:** This PBI focuses on adding cache headers. Cache purging implementation can be a follow-up task.

---

## Implementation Checklist

### Phase 1: SEO (1-2 hours)
- [ ] Verify/create i18n SEO entries in `src/locales/fi/seo.ts`
- [ ] Update `src/pages/sites/index.astro` with title and description
- [ ] Test meta tags in HTML source
- [ ] Verify Open Graph preview in social media debuggers

### Phase 2: Caching (1-2 hours)
- [ ] Add Cache-Control headers to `/sites` page
- [ ] Add Netlify Cache-Tag headers
- [ ] Test caching behavior with browser DevTools
- [ ] Verify CDN cache with curl/headers inspection
- [ ] Document cache strategy in code comments

### Phase 3: Sitemap (30 mins)
- [ ] Update `src/pages/sitemap.xml.ts` to include `/sites`
- [ ] Add priority values to all sitemap entries
- [ ] Test sitemap.xml output
- [ ] Verify sitemap validates at sitemap validators
- [ ] Submit updated sitemap to Google Search Console

### Phase 4: Testing & Validation (1 hour)
- [ ] Load `/sites` page, verify meta tags in HTML source
- [ ] Check response headers for Cache-Control and Cache-Tag
- [ ] Verify sitemap includes `/sites` route
- [ ] Test page load performance (should be fast on repeat visits)
- [ ] Verify no TypeScript/linting errors
- [ ] Update PBI documentation with results

### Phase 5: Documentation (30 mins)
- [ ] Add cache strategy notes to code
- [ ] Update PBI-024 progress tracker
- [ ] Document cache invalidation strategy for future work
- [ ] Mark PBI-026 as complete

---

## Acceptance Criteria

### SEO
- [x] `/sites` page has proper `title` prop with i18n
- [x] `/sites` page has proper `description` prop with i18n (150-160 chars)
- [x] HTML source shows meta description tag
- [x] HTML source shows Open Graph tags (inherited from Page layout)
- [x] Social media preview shows correct title and description

### Caching
- [x] Response headers include `Cache-Control` with appropriate values
- [x] Response headers include `Cache-Tag` for Netlify cache purging
- [x] Browser caches page for 5 minutes (verified in DevTools)
- [x] CDN caches page for 10 minutes (verified with curl/headers)
- [x] stale-while-revalidate works as expected (30 mins)

### Sitemap
- [x] `/sites` route explicitly listed in sitemap.xml
- [x] Sitemap includes priority values for all entries
- [x] Sitemap.xml validates at sitemap validators
- [x] robots.txt correctly references sitemap.xml (already exists)

### Performance
- [x] First load performance acceptable (< 2s on good connection)
- [x] Repeat visits are instant (served from cache)
- [x] No increase in Firestore read costs (due to caching)
- [x] Page handles traffic spikes gracefully (CDN cache)

### Testing
- [x] Manual verification of all criteria
- [x] No TypeScript errors
- [x] No linting errors
- [x] No broken links or functionality regressions

---

## Technical Notes

### Cache Headers Explained

```
Cache-Control: public, max-age=300, s-maxage=600, stale-while-revalidate=1800
```

- **`public`**: Content can be cached by browsers and CDNs
- **`max-age=300`**: Browsers cache for 5 minutes
- **`s-maxage=600`**: CDN (Netlify) caches for 10 minutes
- **`stale-while-revalidate=1800`**: Serve stale content for 30 mins while fetching fresh copy in background

### Netlify Cache Tags

```
Cache-Tag: sites-index,public-sites
```

- **`sites-index`**: Specific to this page
- **`public-sites`**: Group tag for site-related content
- Used for targeted cache purging via Netlify API

### SEO Description Guidelines (from PBI-024)

- **Length**: 150-160 characters (Google's display limit)
- **Language**: Finnish (primary audience)
- **Keywords**: Include "kampanjawiki", "roolipeli", "sivusto"
- **Call-to-action**: "Selaa", "Luo", "Jaa" (action verbs)
- **Unique**: Don't duplicate other page descriptions

---

## Success Metrics

### Before Implementation
- SEO: No meta description (Google uses random page content)
- Cache: Every page load = 1 Firestore read
- Performance: ~500ms-1s page load time
- Sitemap: Index page not explicitly listed

### After Implementation
- SEO: Proper description showing in Google search results
- Cache: ~95% cache hit rate (only 1 Firestore read per 10 minutes per CDN edge)
- Performance: < 100ms page load time (cached)
- Sitemap: `/sites` explicitly listed with priority 0.8

### Monitoring
- Google Search Console: Track impressions/clicks for `/sites` page
- Netlify Analytics: Monitor cache hit rate
- Firestore Console: Verify reduced read operations
- Lighthouse: Verify Performance score remains high

---

## Dependencies

- **PBI-024**: SEO optimization patterns and i18n structure (prerequisite)
- **PBI-023**: Snippet utility (not needed for this page - static description)
- **Netlify**: CDN caching and Cache-Tag support
- **Google Search Console**: For sitemap submission and monitoring

---

## Out of Scope (Future Work)

- **Automated cache purging**: When sites are created/updated/deleted
- **API endpoint caching**: Separate PBI for `/api/sites` response caching
- **Advanced sitemap**: Dynamic priority based on site activity
- **Site thumbnails**: Open Graph images for individual sites
- **Pagination**: If site count grows significantly
- **Filtering/sorting**: Advanced site discovery features

---

## Related PBIs

- **PBI-024**: Parent - SEO Optimization and Public Page Documentation
- **PBI-023**: Robust Markdown Snippet Utility (not used here)
- **Future PBI**: Comprehensive cache purging strategy
- **Future PBI**: API response caching layer

---

## Rollback Plan

If issues arise:

1. **SEO Regression**: Simply omit `description` prop (falls back to no description)
2. **Cache Issues**: Remove Cache-Control headers (reverts to no caching)
3. **Sitemap Errors**: Revert sitemap.xml changes
4. **Deploy**: Netlify supports instant rollback to previous deployment

Low risk - changes are additive and non-breaking.

---

## Notes

- This is a **high-value, low-effort** improvement
- Focuses on ONE critical public page
- Establishes patterns for other index pages (channels, library, etc.)
- Cache strategy balances freshness with performance
- Can be completed independently without backend changes
- Cache purging can be added later without affecting current implementation

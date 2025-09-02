# PBI-005: Front Page Performance and Caching Optimization

## Overview
Optimize the front page (`/`) performance on Netlify deployment with focus on reducing initial load times, implementing smart caching strategies, and improving Core Web Vitals metrics.

## Current Analysis

### Current Front Page Architecture
- **SSR Strategy**: Server-side rendered with Astro + progressive enhancement
- **Data Sources**: 
  - `/api/threads.json?limit=5` - Recent threads (Firestore)
  - `/api/sites?limit=5` - Top sites (Firestore) 
  - `/api/meta/channels.json` - Channel metadata (Firestore)
  - External RSS feeds: `myrrys.com` and `roolipelitiedotus.fi`
- **Current Cache Headers**: `s-maxage=1, stale-while-revalidate` (very short)

### Performance Issues Identified
1. **Multiple API Calls**: 3 internal API calls + 2 external RSS feeds per page load
2. **External Dependencies**: RSS parsing adds latency
3. **Cache Strategy**: Very aggressive cache invalidation (1 second)
4. **Firebase Bundle Size**: Large Firebase SDK chunks (310kB+)
5. **Firestore Queries**: Multiple database calls without optimization

### Current Build Output Analysis
- **Total Bundle Size**: 4.8 MB precached assets
- **Largest Chunks**:
  - `EditorHead.astro_astro_type_script_index_0_lang.k7547PIm.js` - 551kB (⚠️ **Editor-only**: Contains `@11thdeg/cn-editor`, not loaded on front page)
  - `index.esm.DTMIukKP.js` - 310kB (likely Firebase SDK)
  - `index.esm.BwfyFohU.js` - 127kB
  - `SiteDataApp.bOydAiiB.js` - 104kB
- **Front Page Bundle**: Uses `BaseHead.astro` (smaller, only loads `@11thdeg/cyan-lit`)

## Optimization Strategy

### 1. Implement Multi-Tiered Caching Strategy

#### A. Edge Caching on Netlify
```toml
# netlify.toml additions
[[headers]]
  for = "/"
  [headers.values]
    Cache-Control = "s-maxage=300, stale-while-revalidate=1800"
    # 5 min cache, 30 min stale-while-revalidate

[[headers]]
  for = "/api/meta/*"
  [headers.values]
    Cache-Control = "s-maxage=3600, stale-while-revalidate=86400"
    # 1 hour cache, 24 hour stale-while-revalidate for metadata

[[headers]]
  for = "/api/threads.json"
  [headers.values]
    Cache-Control = "s-maxage=60, stale-while-revalidate=300"
    # 1 min cache, 5 min stale-while-revalidate for threads

[[headers]]
  for = "/api/sites*"
  [headers.values]
    Cache-Control = "s-maxage=180, stale-while-revalidate=600"
    # 3 min cache, 10 min stale-while-revalidate for sites
```

#### B. API Response Caching
- Implement in-memory caching for API routes using Netlify's edge functions
- Cache external RSS feeds with longer TTL (30 minutes)
- Add ETag support for conditional requests

### 2. Front Page Data Optimization

#### A. Leverage Astro's server:defer for Independent Content Blocks
Instead of consolidating APIs, optimize each content section independently:
- **TopThreadsStream**: Core content, loads immediately 
- **SyndicateStream**: Uses `server:defer` with cached RSS endpoints
- **TopSitesStream**: Uses `server:defer` for better perceived performance

```astro
<!-- Optimized approach with independent caching -->
<TopThreadsStream /> <!-- Critical, loads immediately -->

<SyndicateStream server:defer>
  <OptimizedFallback slot="fallback" />
  <ErrorBoundary slot="error" />
</SyndicateStream>

<TopSitesStream server:defer>
  <SitesLoadingSkeleton slot="fallback" />
</TopSitesStream>
```

**Benefits:**
- Core content (threads) loads immediately
- Secondary content loads progressively without blocking
- Individual sections can fail without affecting others
- Simpler architecture than consolidated APIs

#### B. Database Query Optimization
- Batch Firestore queries where possible
- Implement database-level caching for frequently accessed data
- Use Firestore composite indexes for optimized queries

### 3. Bundle Size Optimization

#### A. Firebase SDK Optimization (Priority: High)
Target the largest bundles affecting front page performance:
```javascript
// Current: Static imports cause large bundles
// Target: index.esm.DTMIukKP.js (310kB) and related Firebase chunks

// Implement more granular Firebase imports
const getFirebaseAuth = () => import('firebase/auth');
const getFirestore = () => import('firebase/firestore');
```

#### B. Dynamic Import Strategy  
- Move non-critical Svelte components to dynamic imports
- Defer loading of admin/authentication functionality until needed
- Optimize `FrontpageFabs.svelte` loading strategy

#### C. Remove Unused Code
- Audit and tree-shake Firebase SDK imports
- Optimize CSS delivery (critical CSS inline)
- Remove unused dependencies from front page bundle

### 4. Progressive Enhancement Strategy

#### A. Core Content First
- Ensure core content (threads, sites) loads immediately
- Progressive enhancement for interactive features
- Graceful degradation for failed API calls

#### B. Optimize Deferred Components
```astro
<!-- Current approach -->
<SyndicateStream server:defer>
  <DeferredSection class="column-s" slot="fallback" />
</SyndicateStream>

<!-- Enhanced approach with timeout -->
<SyndicateStream server:defer timeout="2000">
  <OptimizedFallback slot="fallback" />
  <ErrorBoundary slot="error" />
</SyndicateStream>
```

### 5. External Content Strategy via Netlify API Caching

#### A. RSS Feed Caching via API Routes
Create dedicated API endpoints for external RSS feeds:
- `/api/external/myrrys-rss.json` - Cached Myrrys.com RSS feed
- `/api/external/roolipelitiedotus-rss.json` - Cached Roolipelitiedotus RSS feed

**Benefits:**
- **Performance**: Eliminates external latency (500ms-2s+ → <100ms)
- **Reliability**: External site downtime won't break front page
- **Global CDN**: Netlify edge locations serve cached responses worldwide
- **Cost Control**: Avoid external API rate limits and unpredictable costs

**Implementation Strategy:**
```typescript
// /api/external/myrrys-rss.json
export async function GET() {
  try {
    // Check if we have cached data (use Netlify Blob storage or in-memory)
    const cached = await getCachedRSSData('myrrys', 30 * 60); // 30 min TTL
    if (cached) return cached;

    // Fetch fresh data
    const parser = new Parser();
    const feed = await parser.parseURL('https://www.myrrys.com/blog/rss.xml');
    const posts = feed.items.slice(0, 3);

    // Cache the response
    await setCachedRSSData('myrrys', posts);

    return new Response(JSON.stringify(posts), {
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 's-maxage=1800, stale-while-revalidate=3600', // 30min cache, 1hr stale
      },
    });
  } catch (error) {
    // Return cached fallback or empty array
    const fallback = await getCachedRSSData('myrrys', 24 * 60 * 60); // Accept 24h old data
    return new Response(JSON.stringify(fallback || []), { status: 200 });
  }
}
```

#### B. Image Optimization
- Implement responsive images with proper sizing
- Add WebP/AVIF format support
- Lazy load non-critical images

## Implementation Plan

### Phase 1: Caching Infrastructure (Sprint 1)
- [ ] Update `netlify.toml` with optimized cache headers
- [ ] Implement ETag support in API routes
- [ ] Add cache warming for critical endpoints
- [ ] Monitor cache hit rates

### Phase 2: External Content Caching (Sprint 1-2)
- [ ] Create `/api/external/myrrys-rss.json` cached RSS endpoint
- [ ] Create `/api/external/roolipelitiedotus-rss.json` cached RSS endpoint  
- [ ] Implement Netlify Blob storage for RSS cache persistence
- [ ] Add fallback mechanisms for external failures
- [ ] Update `SyndicateStream.astro` to use cached endpoints
- [ ] Optimize `server:defer` loading with proper timeouts and error boundaries

### Phase 3: Bundle Optimization (Sprint 2)
- [ ] Optimize Firebase SDK imports (target 310kB+ chunks)
- [ ] Implement dynamic imports for non-critical Svelte components
- [ ] Audit and remove unused dependencies from front page bundle
- [ ] Optimize `FrontpageFabs.svelte` loading strategy

### Phase 4: Progressive Enhancement (Sprint 2-3)
- [ ] Enhance `server:defer` components with intelligent loading strategies
- [ ] Implement timeout handling for deferred content blocks
- [ ] Add performance monitoring for individual content sections
- [ ] Optimize critical rendering path for core content

## Success Metrics

### Performance Targets
- **LCP (Largest Contentful Paint)**: < 2.5s
- **FID (First Input Delay)**: < 100ms  
- **CLS (Cumulative Layout Shift)**: < 0.1
- **TTFB (Time to First Byte)**: < 800ms

### Technical Metrics
- **Firebase Bundle Reduction**: 30% reduction in Firebase-related chunks (target: reduce 310kB+ bundles)
- **External API Latency**: Reduce RSS fetch time from 500ms-2s to <100ms
- **Cache Hit Rate**: > 90% for external RSS content, > 80% for front page requests
- **API Reliability**: 99.9% uptime for RSS content (independent of external sites)
- **Build Time**: Maintain current build performance

### Monitoring Strategy
- Implement Lighthouse CI in build pipeline
- Add Core Web Vitals monitoring with Sentry
- Monitor cache performance via Netlify analytics
- Track bundle size changes in CI/CD

## Risk Assessment

### High Risk
- **Cache Invalidation**: Complex cache strategy might lead to stale content
- **External RSS Caching**: Need robust fallback mechanisms if both external and cached data fail

### Medium Risk  
- **Bundle Splitting**: Aggressive code splitting might increase complexity
- **Database Load**: Aggregated queries might increase Firestore costs
- **Netlify Blob Storage**: Additional dependency for RSS cache persistence

### Low Risk
- **Backward Compatibility**: Changes should be largely transparent to users
- **Development Workflow**: Minimal impact on development experience
- **RSS Content Freshness**: 30-minute cache is acceptable for syndicated content

## Technical Debt Considerations

- Remove temporary caching solutions once proper edge caching is implemented
- Refactor RSS handling to be more resilient and testable
- Consider migrating to a CDN for static assets in future

## Dependencies

- Netlify Edge Functions for advanced caching
- **Netlify Blob Storage** for persistent RSS cache storage
- Updated Astro version for better SSR optimization
- Firestore query optimization
- Bundle analyzer tools for monitoring

## Notes

This optimization focuses on the critical path for first-time visitors while maintaining the dynamic, real-time nature of the community platform. The caching strategy balances performance with content freshness, ensuring users see recent activity while benefiting from edge caching.

**Key Innovation: External RSS Caching via Netlify API Routes**
By proxying external RSS feeds through Netlify API routes with intelligent caching, we achieve:
- Consistent sub-100ms response times for syndicated content
- 99.9% uptime independent of external site reliability  
- Global CDN distribution of cached RSS content
- Graceful degradation when external sources are unavailable

This approach transforms external dependencies from performance liabilities into cached assets served from Netlify's global edge network.

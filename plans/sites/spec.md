# Sites Application Specification

> Sub-application for managing sites, games, and campaigns.

## Overview

The Sites app is a sub-application of the main Pelilauta solution, providing wiki-like functionality for organizing game content, campaign documentation, and collaborative world-building.

## Sub-Specifications

| Component | Spec | Description |
|-----------|------|-------------|
| Site TOC | [site-toc/spec.md](site-toc/spec.md) | Table of contents ordering and management |

## Code Organization

| Path | Description |
|------|-------------|
| `@server/sites/**` | Server-side API and data handling |
| `@svelte/sites/**` | Client UI components |
| `@stores/sites/**` | Svelte stores for site state |

## Data Structure

```
sites/[siteKey]
├── pages/[pageKey]        # Page content
├── assets/[assetKey]      # Asset metadata
├── handouts/[handoutKey]  # Handout data
├── history/[pageKey]      # Page history diffs
└── characters/[charKey]   # (Optional) Character sheets
```

## Key Schemas

- `SiteSchema` - Main site document
- `SiteUpdateSchema` - Validation for partial updates
- `PageRefSchema` - Page reference in TOC (includes `order` for manual sorting)
- `CategoryRefSchema` - Category definitions

## API Pattern

Site updates use the SSR API-first pattern:

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/sites/[siteKey]` | GET | Fetch site data |
| `/api/sites/[siteKey]` | PATCH | Update site (atomic cache purge) |

**Client wrapper:** `updateSiteApi()` in `src/firebase/client/site/updateSiteApi.ts`

All mutations go through authenticated API endpoints with server-side validation and atomic cache purging.

---
name: "Release notes"
shortname: 'Releases'
noun: 'monsters'
---
## Version 18

### 18.0.x (ongoing)
- fix: Optimized font loading for better load-times.
- fix: Eliminated N+1 query problem on channels page by implementing aggregated API endpoint
- fix: Added E2E tests covering channels page functionality, performance, and error scenarios


#### 18.0.1 (01.09.2025)
- fix: font page caching and loading strategies updated for better UX and ADIT
- fix: Move Sentry initialization to client-side and guard it for SSR/dev; uses dynamic import to avoid edge/deno conflicts
- fix: Updated some FABs to use the 4.0+ design system classes
- fix: Add and update some English and Finnish locale strings related to characters, tools and page UI


### 18.0.0-beta.2 (29.8.2025)
- fix: Move thread creation to server-side to ensure authenticated, stable thread creation 
- fix: API tests are no longer part of the default test suite; improved test coverage and harnessing
- fix: Adding comments now works correctly


### 18.0.0-beta.1 (25.8.2025)
- BREAKING CHANGE: Builds against Netlify instead of Astro
- BREAKING CHANGE: Uses Cyan Design System 4, instead of 3
- BREAKING CHANGE: Uses Biome 2, instead of 1.x


See: https://github.com/villetakanen/pelilauta-16 for older releases.


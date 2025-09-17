---
name: "Release notes"
shortname: 'Releases'
noun: 'monsters'
---
## Version 18

### 18.4.0 (17.9.2025)
- feat(search): Added Algolia search for threads, accessible to logged-in users
- feat(search): Added search page and rudimentary search results listing
- fix(sites): Character keeper icon added
- fix(sites): Minor Character keeper layout polish
- fix(characters): StatBlock view now uses the new cn-stat-block web component
- fix: Importing the cn-d20-ability-score addon web-component in BaseHead to ensure it's available globally

### 18.3.0 (16.9.2025)
- feat(characters): Character keeper can be activated at site options
- feat(characters): Character keeper sheet can be set at keeper header
- feat(characters): Character keeper route and template added to sites
- feat(characters): Character keeper nanostores added to manage keeper state
- fix(characters): Character sheet api now requires auth
- fix(characters): Character page preloads happen without an API waterfall

### 18.2.0 (15.9.2025)
- feat(characters): Character sheet is no longer embedded in a Character, enabling switching between sheets
- feat(characters): Character editor now supports rendering of stat groups and stats, including the new stat types
- feat(characters): Sheet editor supports cr(u)d of stat groups.
- feat(characters): Sheet editor supports crud of stats to groups.
- feat(characters): Added new stat types: text (in addition to existing number, toggled, and d20_ability_score)
- feat(characters): Added wizard with step-by-step flow for new character metadata creation
- fix(characters): Character view now uses CDS listing content container - and aside for meta links
- fix(schema): Character Sheet schema stat provides value as a z.any() for better type flexibility
- fix: Moved thread deletion to server-side API endpoint, only accessible to thread owners and pelilauta admins
- fix: Added some small patches to CDS 4.0 beta bugs to local overrides @TODO: report the patches to CDS repo
- fix: Character listings on the library and sites/characters page match CDS 4.0 styles
- fix: Profile page uses CDS 4.0 containers and flex atomics
- fix: anchor FABs now have class `button fab` instead of `fab`, to match CDS 4.0 class patterns.
- fix: Settings tool no longer subscribes to firebase directly, instead it uses the nanostore profile data. Expected to fix Sentry:PELILAUTA-4K, caused by firebase client side error only visible in the said route.
- fix: Removed deprecated authz code from SettingsTool
- fix: Removed extraneous DELETE /api/session calls caused by a race condition in the auth store (PBI 014)
- fix: Cyan Design System 4.0.0 latest beta patches 
- fix: Libary updates for CVS issues and security patches
- fix: Library page auth redirect moved to server-side to prevent content flash for unauthenticated users (PBI 011)
- fix: Restored and simplified lefthook commit hooks and commitlint configuration for faster local checks (PBI 012)
- fix: Added reusable Sentry test button component with user feedback and rich context for admin debugging (PBI 013)

### 18.1.0 (9.9.2025)
- feat: Onboarding flow moved to server-side rendering for better performance and UX
- fix: Email login flow could hang to a state machine fail due to race condition. Simplified the flow and flow states to avert the issue.
- fix: User settings page uses SSR guard to hide the page from unauthenticated users (more of an aesthetic fix, as you can't have settings to access without being logged in)

### 18.0.8 (8.9.2025)
- fix: Page edit bypasses cache by adding `flowtime` query param to URL 
- fix: Cyan Design System BREAKING CHANGES: remove `Open sans` font usage, replace with `Lato` font universally.
- fix: Cyan Design System beta updates and fixes
- fix: Optimized font loading for better load-times.
- fix: Eliminated N+1 query problem on channels page by implementing aggregated API endpoint
- fix: Added E2E tests covering channels page functionality, performance, and error scenarios
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


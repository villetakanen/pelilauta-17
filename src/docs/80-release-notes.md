---
name: "Release notes"
shortname: 'Releases'
noun: 'monsters'
---
## Version 18

### 18.8.x (ongoing)
- fix: Front page RSS feed generation happens and is cached server-side for better performance and reliability
- fix(threads): Thread updates moved to server-side API endpoint for better consistency and auth handling
- fix: Moved CodeMirror to a local library component, removing the dependency to @11thdeg/cn-editor web component. CodeMirror is a large package intended for standalone use, and has various issues with shadow DOM and focus management if capsulated to a lit wrapper component. See PBI-029 for details.
- fix(sites): Public site pages are now included in the sitemap.xml for better SEO and discoverability. See PBI-028 for details.
- fix: Multiple updates to cn-editor web component to fix various focus issues and memory leaks
- fix(sites): Site meta data form ux and ui polish
- fix(sites): Site navigation options moved to options page from the settings page - this collates all navigation options in one place.
- fix(sites): Non-listed sites settings moved to a bespoke component, polished UI and UX
- fix(sites): Settings page now has SSR auth in place
- fix(sites): Nonlisted sites ask not to be indexed by search engines
- fix: Sites have proper SEO/social media meta tags and fallbacks if desctriptions etc. are missing
- fix: tags use cn-chip style from Cyan Design System 4.0
- fix: tag rendering in snippets and thread content now uses a DRY utility component
- fix: Profile page SEO improvements

### 18.8.0 (07.10.2025)
- feat: Support for tag synonyms
- feat: Front page featured tags
- fix: Text updates for SEO and clarity
- fix(threads): Minor visual polish to channel thread cards
- fix: Small polish to front page thread cards, for better intra-site links.
- fix: First part of PBI-25: SEO and Social media imprivements (index, channels, channel, thread)
- fix: Session snack bar now uses CDS 4.0 snackbar component correctly
- fix(threads): Admin tools uses the accordion component for better UX and visual consistency
- fix: Cyan Design System latest beta fixes and patches
- fix(threads): Channels/Forum index UX polish and fixes
- fix(threads): Channel admin tool now supports channel description editing
- fix(threads): Channel admin tool channel name changing ux cleanup

### 18.7.0 (01.10.2025)
- feat(threads): Search a channel for threads by title and content using Algolia. 
- feat(threads): Thread list infinite scroll instead of pagination
- fix: moved patch-overrides to cyan-design-system to main design system
- fix: latest cyan design system beta fixes and patches
- fix:(threads): New thread toolbar no longer shows too long select-boxes
- fix: Select and input styling fixes for better UX from cyan design system latest beta
- fix: Updated dependencies: Zod, Svelte, Astro etc.
- fix(threads): Admin channels creation dialog moved to a modal page for better UX

### 18.6.0 (26.9.2025)
- feat(threads): Admin channels tool topic management (add, reorder, delete) added
- feat(threads): PBI-20 - Moved channels admin to non-local admin tools suite
- feat: PBI-21 – Added NounSelect.svelte component for selecting Cyan Design System nouns (`/public/icons/*.svg`)
- fix(threads): Admin channels tool new topic creation dialog is again functional
- fix(sites): Handout list item layout fix for better rendering
- fix(sites): Handout list auth check at SSR to prevent flickering
- fix(sites): Keeper character card shows number stats with the same ui styles as in the character sheet
- fix(sites): Keeper shows character stats correctly
- fix(characters): Sheet loading via API, with proper caching headers
- fix: Cyan Design System updates, merging the patches below and correct fab-tray positioning on mobile screens
- fix: Settings navigation button reacts correclty to authState changes
- fix(characters): Character sheet d20 ability score stat uses base attribute for correct modifier calculation
- fix(characters): Checkbox styling override patch for better visual consistency
- fix(characters): Character sheets support layout settings for stat groups
- fix(characters): Character sheet stat blocks are rendered correctly for toggled, number, and d20_ability_score stat types.

### 18.5.0 (19.9.2025)
- feat(characters): Character sheet schema supports layout settings for stat groups

### 18.4.0 (17.9.2025)
- feat(search): Added Algolia search for threads, accessible to logged-in users
- feat(search): Added search page and rudimentary search results listing
- fix(sites): Character keeper  icon added
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


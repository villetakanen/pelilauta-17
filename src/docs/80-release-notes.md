---
name: "Release notes"
shortname: 'Releases'
noun: 'monsters'
---
## Version 17

### 17.13.x (ongoing)
- FIX: Profile tag extension conflicts with GFM rendering fixed by moving the createProfileTagExtension to pre-process. This allows the extension to be applied before the GFM rendering, preventing conflicts with email auto-linking.
- FIX: SideBar locale fix and small ux improvements.
- FIX: Better separation of site options.

### 17.13.0 (2025-08-04)
- FEAT: Support for Mekanismi (pmwiki) style custom sidebar pages for sites.
- FIX: Small text overridden to work
- FIX: Data upload functionality for site pages restored.
- FIX: SSR character data fetching at route level.

### 17.12.0 (2025-07-30)
- FEAT: Add site setting for enabling/disabling display of characters linked to the site.
- FEAT: Add site tray link to site characters, visible if the site setting to display characters is enabled.
- FEAT: Create an API route for `/api/sites/:siteId/characters`, which returns all characters linked to a specific site. Use cache of 30s, and stale-while-revalidate strategy.
- FEAT: Create a route for site characters, allowing users to view all characters linked to a specific site. 
- FEAT: A FAB for creating a new character is added to the site characters page.

### 17.11.0 (2025-07-29)
- FEAT: Character site linking uses Site name instead of the site database key.
- FEAT: Sites are cached locally in the same manner as user profiles, allowing offline access and better performance for site references.
- FIX: Development build no longer includes Sentry, as it was causing ghost issues originating from the development environment.
- FIX: Like button works even if the reactions object has not been initialized yet (due to an internal error, or network issues)

### 17.10.0 (2025-07-28)
- FEAT: Added ability to link characters to a Game (or a Site) in the library.
- FEAT: Ability to create, edit and delete Player Characters in the app. Edit limited to the markdown for the description. Other features disabled for now.
- FEAT: Added experimental support for Player Characters in the models and the database.
- FIX: Session state and token is now available for pages, in addition to authenticated API calls.
- FIX: Page creation e2e test added to the test suite, which creates a page and verifies that the page is created successfully.

### 17.9.0 (2025-05-25)
- FEAT: When a site has categories/topics, the category/topic can be set when creating a new page.
- FIX: Forum page now shows the latest thread and latest disccussion for a channel.
- FIX: Public profile atom creator correctly returns undefined when the profile is being loaded. (and an anonymous profile if the profile is not found)
- FIX: Handouts list spacing and Flexbox issues fixed.
- FIX: noShare prop is now passed to head component, asking robots not to index the page.
- FIX: Rudimentary offline support for the public site list, allowing users to view the list without an internet connection.
- FIX: Updated the basehead for better sharing, SEO and social media integration.
- FIX: Restored much of the service worker functionality, including the ability to cache images and api calls.

### 17.8.0 (2025-06-10)
- FEAT: Wiki page changes are now saved as diffs in the page history collection, allowing for better tracking of changes.
- FIX: Moved the wikilink logic to a marked extension to avoid corner-case conflicts with markdown rendering.
- FIX: Improved, experimental ux for the public site list. 
- FIX: Public site list styles use the Cyan design system flex-none where needed.
- FIX: ReactionButton sends Entry titles for the notification API for site and thread reactions.
- FIX: Reactions use the notification API to notify the reaction subscribers of the reaction.
- FIX: Moved notification logic to a API route, which is now used by replies to create notifications for the thread creator.
- FIX: When a reply is created, the reactions object gets the proper subscribers (reply creator) instead of cloning the parent thread subscribers.
- FIX: Eula dialog open race condition and nickname binding issues fixed.
- FIX: Dependency build updates to fix broken dev build artifacts.
- FIX: Account store cleanup improvements, removed deprecated $account alias as solid-js components are no longer used.
- FIX: Removed erroneous thread channel icon resolution from the server-side rendering (which expected a client-side nanostore to be initialized)
- FIX: Removed deprecated social stores
- FIX: Nanostore for locally cached public profiles exposes loading state, allowing the UI to show proper loading indicators.
- FIX: Nanostore initialization for subscription is now done with a derived store, which should prevent some of the issues with the subscription not being initialized correctly with onmount.
- FIX: Session state is now correctly initialized on logout (no more flickering of the eula dialog on logout).
- FIX: Older discussions were missing some mandatory fields - added a on-the-fly patch to regenerate the missing fields.
- FIX: Eula dialog was fetching the Firebase Auth directly from the SDK, without using the client init - which can cause a situation where the Firebase App is not initialized yet, and the call fails.
- FIX: Page history is now saved to a separate collection, to prevent it from taking up the page document size qupta.
- FIX: the top sites stream on the front page handles SSR API errors gracefully. This might prevent some of the issues with the front page. 

### 17.7.0 (2025-06-02)
- FEAT: Restored the page history route
- FIX: Cleaned up the EntrySchema for better CoPilot support and code readability
- FIX: Site layout updates
- FIX: New page creation snack works as expected
- FIX: Page schema now provides new-style pageFrom helper
- FIX: Removed flex-box cleanup related CSS errors from different views
- FIX: Removed extraneous html section/divs from the page and thread editors
- FIX: When loading a set of sites, we now dynamically import the DB and capture firestore errors gracefully.
- FIX: Editor component is only loaded when needed as it's a heavy component
- FIX: Page API route error handling improved to avoid Vercel function timeout crashes.
- FIX: Patched editor view cn-editor max-height in overrides
- FIX: Page history dates are now correctly coerced to dates
- FIX: Page saving state microtransactions added to the page editor
- FIX: Forum Fabs are now on svelte
- FIX: Delete thread confirmation moved to svelte
- FIX: Thread fork moved to svelte
- FIX: Multiple small tread creation and cross-posting fixes
- CHORE: Updated Cyan design system to 1.0.15, removed some deprecated overrides
- CHORE: added longer stale-while-revalidate cache to active user list
- CHORE: pulled cn-editor to 2.0.0 from the submodule, added requirements to the package.json

### 17.6.0 (2025-05-09)
- FEAT: Reply dialog now lets you add images to the reply
- CHORE: removed some deprecated solid-js components from the project

## 17.5.1 (2025-05-08)
- FIX: moved the login page to astro and svelte
- FIX: moved the session authentication info section (in settings) to svelte
- FIX: disabled server island for front page sitelist, as it was causing issues with the server-side rendering at Vercel side
- FIX: deprecated thread editor solid-js component, and added thread update branch to the svelte alternative (making the the svelte version able tho handle both thread creation and thread updates)
- FIX: Export as .md tool works if the pages have only markdown content (ie. no rendered html for some reason)


## 17.5.0 (2025-05-01)
- FEAT: Added an onboarding article to the Channels and Channel -pages.
- FIX: Firestore subscribing stores init uses clent/db init correctly (instead of direct getFirestore call , which might not work due to race conditions)
- FIX: Admin tools visibility uses Nanostores derived store for better DX and performance
- FIX: Reply dialog widht regression issue fixed with component level css
- FIX: Challen page looks forum-like
- FIX: Channel page thread shows unread status like the front-page
- FIX: Updated Cyan design system to 1.0.14
- FIX: Faster front-page-load-times
- FIX: Channels/Forums -page layout more forum-like, loads faster
- FIX: Card notify effect no longer runs on anonymous sessions
- FIX: Moved static thread reply count from solid-js to SSR Astro
- CHORE: Removed some deprecated solid-js components no longer in use

## 17.4.0 (2025-04-29)
- FEAT: Channel info shown in channel page
- FIX: Channel items use server island for better performance (note: the page component still loads channel info, which could likely be moved to another server island)
- FIX: Channel page info polish
- FIX: Channel page supports poster images
- FIX: Channels -page fabs now on svelte
- FIX: Added moderator only button to reshare a thread on the social media feeds.
- FIX: Reactions entry is created as expected to new threads.
- CHORE: Added Sentry for error tracking.
- CHORE: Updated Cyan design system to 1.0.13 with enhanced tray ux.

## 17.3.0 (2025-04-23)
- FEAT: Bluesky integration added to the SSR. This requires setting bsky credentials in the env file.
- FEAT: App admins can post as "pelilauta.social" on bluesky through the app admin tools.
- FEAT: New threads are automatically shared via the app's bluesky account.

## 17.2.0 (2025-04-23)
- FEAT: Site text content license selection added to the site settings
- FEAT: Site text content license info added to page footer
- FEAT: Site text content license metadata added to schemas
- FIX: removed 3 deprecated solid-js components
- FIX: creating pages for a site with auto-generated urls works again
- FIX: site toc regeneration moved over to svelte
- FIX: page delete confirmation moved over to svelte
- FIX: removed extra logging
- FIX: moved table of contents and page sorting tools to svelte
- FIX: Asset upload asset upload fab moved to svelte
- FIX: Asset metadata editor moved to svelte
- FIX: Asset metadata editor license selection works as expected
- FIX: Asset metadata visible to all users, editor only for the site owners
- FIX: Moved syndicated login to svelte
- FIX: WithAuth component sections have surface
- FIX: Thread stream (frontpage) read-more link points to the channels page as expected
- CHORE: updated Cyan design system to version 1.0.12
- CHORE: L&L Wiki added to the list of links in the footer

## 17.1.0 (2025-04-05)
- FEAT: Asset tag can be copied to clipboard from the asset lists
- FIX: Onboarding card no longer part of sites-stream to avoid unnecessary css-hacks.
- FIX: Thread creators comments can now be loved (in addition to the other responses).
- CHORE: Removed a lot of deprecated solid-js components from the project.

### 17.0.0 (2025-03-24)

- BREAKING: Thread reactions are now stored in the new Reactions data structure.
- FIX: Local notifications cache is cleared when notifications are loaded.
- FIX: Reactions do not send notification to self
- FIX: Can not like own entries
- FIX: Deprecated profile lovedThreads
- FIX: Deprecated reply lovers array
- CHORE: updated cyan design system to 1.0.7 for better support of speech bubbles
- FIX: removed all solid-js components related to discussions
- FIX: removing a reply decrements the reply count of the parent thread
- FIX: removing a reply deletes the corresponding reactions-entry

## Version 16

### 16.16.6 (2025-03-10)
- FIX: Handout editor save opens the handout page as expected.
- FIX: Handout editor oninput event now updates the handout content as expected.
- FIX: Handout list ordered by name.
- FIX: Export tool moved to a separate page, and converted to Svelte.
- FIX: Export tool supports again exporting all pages as a collated `.md` in addition to a `.zip` of the markdonwn -pages.
- FIX: added a new-style store for the subscription data. This will be used on the svelte-based components that need "notifications" on new updates (i.e. can be subscribed to)
- FIX: removed the old solid-js channels index page, as we already had a functional svelte version (but were sometimes linking to the old one)
- FIX: removed deprecated solid-js parts from library/sites page, and replaced them with svelte components where needed
- FIX: admin rail button moved to svelte
- FIX: removed deprecated SiteCard solid-js component from the project
- FIX: moved OnboardingCard to svelte
- FIX: small polish to app locales
- FIX: forum front page SSR
- FIX: moved cardsubsctiption to svelte

See: https://github.com/villetakanen/pelilauta-16/blob/v16.6.6/src/docs/80-release-notes.md for older releases.


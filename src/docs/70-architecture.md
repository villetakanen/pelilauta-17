---
name: 'Solution Architecture'
noun: 'veil-advance'
---

**(in english only)**

The Pelilauta is a web application that is built on top of the excellent Astro.build site generator.

The application consists of 2 bespoke apps: the discussions or "threads" app and the Game-wiki app. The threads app is a forum-like application that allows users to create threads and post messages. The Game-wiki app is a wiki-like application that allows users to create and edit game related wiki-sites.

## Principles

### Locally cached multi-page app

The Pelilauta is a multi-page application that is designed to be fast and responsive. The application is designed to be used on a mobile device and on a desktop computer. To enable this, we use reactive techniques (solid-js) to update the UI when the data changes, and local storage (nanostores) to cache the data.

Both apps have their own local storage and cache the data that is needed to render the UI. The data is fetched from the server when the app is loaded and when the user navigates to a new page. The data is then stored in the local storage and used to render the UI.

This approach allows the app to be fast and responsive, even on a slow network connection. The app should also work (at least somehow) offline, as the data is stored in the local storage.

**Do note: we are not doing full local-firs, so there is no merge-conflict resolution or anything like that.**

...

### Code structure
```
src/
  components/
    client/ (the solid-js, client side components)
      ThreadsApp/
        ... (UX of the threads app)
      SitesApp/
        ...
    server/ (the server side components)
      ...
    store/ (the store components)
      ThreadsApp/
        ... (state management of the threads app)
      SitesApp/
        ...
```


---
name: "Sites, games and Campaigns"
shortname: 'Sites'
noun: 'veil-advance'
---
The Sites app is a progenitor of Mekanismi.sange.fi wiki and is designed to support the creation of sites, games, and campaigns. It provides a flexible structure for organizing content and allows users to create and manage their own sites.

## Data structure

The Firestore data structure is following:
```
sites/[key]
+- pages/[pageKey] # Page data
+- assets/[assetKey] # Asset metedata
+- handouts/[handoutKey] # Handout data
+- history/[pageKey] # Page history diffs
```

### Key fields

| Field | Type | Description |
|-------|------|-------------|
| `updatedAt` | `timestamp` | The last time the site, or it's pages, assets, or handouts were updated (including created pages, assets and handouts)|
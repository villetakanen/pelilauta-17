# ADR-001: Static Character Sheet Definitions

**Status:** Proposed  
**Date:** 2026-01-14  
**Decision:** Deprecate admin character sheet editor; use static JSON for sheet definitions

## Context

The admin character sheet editor (`/admin/sheets`) provides a web interface for creating and modifying character sheet templates stored in Firestore. However:

1. **Infrequent changes:** Character sheet definitions change rarely (when new game systems are added)
2. **Overhead:** Maintaining the editor UI, store, and Firestore persistence adds complexity
3. **Version control:** Static JSON files benefit from git history, code review, and deployment guarantees
4. **Type safety:** TypeScript can validate static imports at build time

## Decision

1. **Deprecate** the admin character sheet editor
2. **Store** character sheet definitions as static JSON in `src/data/character-sheets/`
3. **Remove** Firestore `charsheets` collection dependency for sheet definitions
4. **Maintain** `CharacterSheetSchema` for validation of both static data and character instances

## Consequences

### Positive
- Simpler architecture (no admin UI, no Firestore writes for sheets)
- Better version control and auditability
- Type-safe imports with build-time validation
- Faster page loads (no Firestore fetch for sheet definitions)

### Negative
- Requires code deployment to add/modify sheets (acceptable given low frequency)
- Loss of runtime editing capability (acceptable - was admin-only)

## Migration Path

> **Note:** No Firestore data migration needed - the admin editor was experimental with no production data.

### Phase 1: Documentation (This ADR) ✅
- Document the architectural decision
- Update spec to mark editor as deprecated

### Phase 2: Cleanup
- Remove admin editor components
- Remove `sheetEditorStore.ts`
- Remove admin sheet pages
- Remove related API routes

### Phase 3: Static Data Setup
- Create `src/data/character-sheets/` directory
- Create TypeScript module to load and validate sheets
- Define initial sheet JSON files as needed

### Phase 4: Update Consumers
- Modify remaining API routes to serve from static data (if needed)
- Update client stores to use static data source
- Keep schema validation for character instances

## Files Affected

### To Deprecate/Remove
- `src/stores/admin/sheetEditorStore.ts`
- `src/components/svelte/admin/sheets/*.svelte` (all editor components)
- `src/pages/admin/sheets/` (all pages)
- `plans/admin/sheet-editor/spec.md` (mark deprecated)
- `plans/admin/sheet-editor/PBI-*.md` (close/archive)

### To Create
- `src/data/character-sheets/*.json` (static sheet definitions)
- `src/data/character-sheets/index.ts` (loader with validation)

### To Modify
- `src/pages/api/character-sheets/*.ts` (source from static data)
- `src/stores/characters/sheetsStore.ts` (simplify, possibly remove API dependency)
- `src/firebase/server/characters/getCharacterSheet.ts` (source from static data)

### To Keep (Unchanged)
- `src/schemas/CharacterSheetSchema.ts` (still needed for validation)
- Character creation/editing flows (unchanged consumers)

## Static Data Structure

```
src/data/character-sheets/
├── index.ts                    # Loader, exports sheets map
├── dnd5e.json                  # D&D 5e sheet definition
├── pathfinder2e.json           # Pathfinder 2e sheet definition
└── ... (other systems)
```

### Loader Pattern

```typescript
// src/data/character-sheets/index.ts
import { CharacterSheetSchema, type CharacterSheet } from '@schemas/CharacterSheetSchema';
import dnd5e from './dnd5e.json';

const rawSheets = { dnd5e, /* ... */ };

export const characterSheets: Map<string, CharacterSheet> = new Map(
  Object.entries(rawSheets).map(([key, data]) => [
    key,
    CharacterSheetSchema.parse(data)
  ])
);

export function getSheet(key: string): CharacterSheet | undefined {
  return characterSheets.get(key);
}

export function getAllSheets(): CharacterSheet[] {
  return Array.from(characterSheets.values());
}
```

## Spec Amendments Required

### `plans/admin/sheet-editor/spec.md`
Mark entire spec as deprecated with reference to this ADR.

### `plans/characters/spec.md` (if exists)
Update to reference static sheet loading instead of Firestore.

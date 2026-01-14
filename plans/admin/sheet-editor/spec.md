# Admin Character Sheet Editor Specification

<!-- DEPRECATED: 2026-01-14 - This feature is deprecated per ADR-001-static-character-sheets.md -->
<!-- Character sheet definitions will move to static JSON in src/data/character-sheets/ -->
<!-- See: docs/ADR-001-static-character-sheets.md for migration plan -->

> **DEPRECATION NOTICE:** This editor is deprecated. Character sheet definitions are moving to static JSON files for simpler architecture, better version control, and build-time type safety. See `docs/ADR-001-static-character-sheets.md`.

## 1. Overview
The **Admin Character Sheet Editor** provides a web interface for administrators to create and modify character sheet templates. These templates define the structure of stats that characters use.

**Location:** `/admin/sheets`  
**Access:** Admin-only (requires elevated permissions)
**Status:** DEPRECATED - Pending removal

## 2. Architecture

### 2.1 Store Layer

The editor uses a dedicated nanostore (`sheetEditorStore.ts`) that centralizes all state and transformations:

```
sheetEditorStore.ts
├── Atoms: sheet, dirty, saving
├── Derived: groupedStats, availableGroups  
├── Actions: addStat, removeStat, updateStat, changeStatType
├── Actions: addGroup, removeGroup, updateGroupLayout
└── Persistence: loadSheet(), saveSheet()
```

### 2.2 Components

| Component | Purpose |
|-----------|---------|
| `CharacterSheetList.svelte` | Lists all available sheets for selection |
| `SheetEditor.svelte` | Main editor container, triggers `loadSheet()` |
| `SheetInfoForm.svelte` | Edits sheet metadata (name, system, key) |
| `SheetStatGroups.svelte` | Manages stat group definitions and layouts |
| `SheetStats.svelte` | Manages individual stat definitions |
| `StatsSection.svelte` | Renders a collapsible section of stats |
| `NewGroupCard.svelte` | UI for adding new stat groups |

### 2.3 Data Flow

```
Components (presentation only)
       ↓ call actions
sheetEditorStore
       ↓ save()
updateCharacterSheet() → Firestore
```

Components subscribe to store atoms for reactive updates but delegate all mutations to store actions.

## 3. Stat Type Editor Support

When a new stat type is added to `CharacterStatSchema`, update `changeStatType()` in the store.

### 3.1 Current Support

| Stat Type | Supported | Additional Fields |
|-----------|-----------|-------------------|
| `number` | ✅ | – |
| `toggled` | ✅ | – |
| `derived` | ✅ | `formula` (text input) |
| `d20_ability_score` | ✅ | `hasProficiency` (toggle) |
| `choice` | ✅ | `options[]` (label/value pairs) |
| `text` | ❌ **Gap** | – (simple, but not in dropdown) |

### 3.2 Adding New Stat Types

To support a new stat type:

1. **Update `changeStatType()` in `sheetEditorStore.ts`**:
   ```typescript
   case 'newtype':
     updateStat(index, { type, /* type-specific defaults */ });
     break;
   ```

2. **Add to type dropdown in `SheetStats.svelte`**:
   ```svelte
   <option value="newtype">New Type</option>
   ```

3. **Add conditional fields** for type-specific configuration in the template.

## 4. State Management

- **Centralized store:** All sheet state lives in `sheetEditorStore.ts`
- **Dirty detection:** Automatic via nanostores effect on sheet changes
- **Derived state:** `groupedStats` and `availableGroups` computed from sheet
- **Persistence:** `loadSheet(key)` and `saveSheet()` handle Firestore I/O
- **UI-only state:** Collapse/expand state stays in components (not persisted)

## 5. Known Gaps

### 5.1 Text Stat
The `text` stat type exists in the schema but is not in the type dropdown.

## Changelog
- **2026-01-14**: DEPRECATED - Editor to be replaced with static JSON (see ADR-001)
- **2026-01-09**: Refactored to store-based architecture, choice stat now supported
- **2026-01-07**: Initial spec created documenting current state and gaps

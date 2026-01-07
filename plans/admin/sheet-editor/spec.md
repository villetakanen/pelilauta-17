# Admin Character Sheet Editor Specification

## 1. Overview
The **Admin Character Sheet Editor** provides a web interface for administrators to create and modify character sheet templates. These templates define the structure of stats that characters use.

**Location:** `/admin/sheets`  
**Access:** Admin-only (requires elevated permissions)

## 2. Architecture

### 2.1 Components

| Component | Purpose |
|-----------|---------|
| `CharacterSheetList.svelte` | Lists all available sheets for selection |
| `SheetEditor.svelte` | Main editor container |
| `SheetInfoForm.svelte` | Edits sheet metadata (name, system, key) |
| `SheetStatGroups.svelte` | Manages stat group definitions and layouts |
| `SheetStats.svelte` | Manages individual stat definitions |
| `StatsSection.svelte` | Renders a collapsible section of stats |

### 2.2 Data Flow

```
SheetEditor
  ├── SheetInfoForm → updates { name, system, key }
  ├── SheetStatGroups → updates { statGroups[] }
  └── SheetStats → updates { stats[] }
                 ↓
         characterSheetStore
                 ↓
         updateCharacterSheet() → Firestore
```

## 3. Stat Type Editor Support

When a new stat type is added to `CharacterStatSchema`, the admin editor must be updated to allow creating/editing that type.

### 3.1 Current Support

| Stat Type | Supported | Additional Fields |
|-----------|-----------|-------------------|
| `number` | ✅ | – |
| `toggled` | ✅ | – |
| `derived` | ✅ | `formula` (text input) |
| `d20_ability_score` | ✅ | `hasProficiency` (toggle) |
| `choice` | ❌ **Gap** | `options[]` (label/value pairs) |
| `text` | ❌ **Gap** | – (simple, but not in dropdown) |

### 3.2 Adding New Stat Types

To support a new stat type in the editor:

1. **Update `handleTypeChange()`** in `SheetStats.svelte`:
   ```typescript
   } else if (type === 'choice') {
     updateStat(statIndex, { type, options: [], value: '' });
   }
   ```

2. **Add to type dropdown** (lines ~197-201):
   ```svelte
   <option value="choice">Choice</option>
   ```

3. **Add conditional fields** for type-specific configuration:
   ```svelte
   {#if stat.type === 'choice'}
     <!-- Options editor UI -->
   {/if}
   ```

## 4. Known Gaps

### 4.1 PBI-061: Choice Stat UI
The `choice` stat type was added to the schema (PBI-061) but the admin editor does not yet support:
- Selecting `choice` from the type dropdown
- Editing the `options` array (label/value pairs)
- Using `ref` to import options from Firestore

**Recommended PBI:** Create a dedicated PBI for "Admin UI for Choice Stats"

### 4.2 Text Stat
The `text` stat type exists in the schema but is not in the type dropdown.

## 5. State Management

- **Local draft state:** Edits are held in component-local `$state()` until saved
- **Dirty detection:** Compares local state to store state via `JSON.stringify()`
- **Save action:** Calls `updateCharacterSheet()` which writes to Firestore

## Changelog
- **2026-01-07**: Initial spec created documenting current state and gaps

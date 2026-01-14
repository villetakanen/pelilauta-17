# Sheet Preview Tool Specification

## 1. Overview

The **Sheet Preview Tool** provides an admin interface to preview character sheet templates rendered with sample data. This allows designers to validate sheet layouts without creating actual characters.

**Location:** `/admin/sheets/preview`  
**Access:** Admin-only (requires elevated permissions)

## 2. Architecture

### 2.1 Package Structure

Sheet rendering components live in a dedicated package for reusability:

```
packages/
└── characters/
    ├── package.json
    ├── src/
    │   ├── index.ts              # Package exports
    │   ├── SheetRenderer.svelte  # Main renderer orchestrator
    │   ├── StatBlockGroup.svelte # Renders a group of blocks
    │   ├── StatBlock.svelte      # Renders a single block
    │   ├── stats/
    │   │   ├── NumberStat.svelte
    │   │   ├── TextStat.svelte
    │   │   ├── ToggledStat.svelte
    │   │   ├── ChoiceStat.svelte
    │   │   ├── D20AbilityStat.svelte
    │   │   └── DerivedStat.svelte
    │   └── types.ts              # Shared types/interfaces
    └── tsconfig.json
```

### 2.2 Design Rationale

**Why a separate package?**
- Sheet rendering is pure UI logic with no Firebase dependencies
- Components can be tested in isolation
- Enables future use cases (PDF export, embed widgets)
- Clear boundary between data layer (main app) and presentation (package)

**Why Svelte-only?**
- Character sheets are 100% logged-in-user functionality
- Progressive enhancement on character pages (client-side hydration)
- No SSR rendering requirements for sheets
- Svelte 5 runes provide optimal reactivity for stat updates

### 2.3 Data Flow

```
Static JSON (src/data/character-sheets/)
       ↓
Preview Page (loads sheet definition)
       ↓
SheetRenderer (receives sheet + sample values)
       ↓
StatBlockGroup[] → StatBlock[] → Stat components
```

## 3. Component API

### 3.1 SheetRenderer

The main entry point for rendering a character sheet.

```svelte
<script lang="ts">
interface Props {
  sheet: CharacterSheet;           // Sheet template definition
  values?: Record<string, unknown>; // Stat values (key → value)
  readonly?: boolean;              // Disable editing (default: true)
  onchange?: (key: string, value: unknown) => void; // Optional change handler
}
</script>
```

**Behavior:**
- Iterates `sheet.statBlockGroups` and renders each group
- Passes `values` down to stat components for display
- In preview mode, `readonly=true` and `onchange` is optional

### 3.2 StatBlockGroup

Renders a row of stat blocks with configurable layout.

```svelte
<script lang="ts">
interface Props {
  group: StatBlockGroup;           // Group definition with layout
  stats: CharacterStat[];          // Stats belonging to this group's blocks
  values: Record<string, unknown>;
  readonly: boolean;
  onchange?: (key: string, value: unknown) => void;
}
</script>
```

**Layout mapping:**
| `group.layout` | CSS Grid |
|----------------|----------|
| `cols-1` | Single column |
| `cols-2` | Two columns |
| `cols-3` | Three columns |

### 3.3 StatBlock

Renders a single stat block (card) containing stats.

```svelte
<script lang="ts">
interface Props {
  block: StatBlock;
  stats: CharacterStat[];          // Stats with block === this block's key
  values: Record<string, unknown>;
  readonly: boolean;
  onchange?: (key: string, value: unknown) => void;
}
</script>
```

### 3.4 Stat Components

Each stat type has a dedicated component:

| Component | Stat Type | Value Type |
|-----------|-----------|------------|
| `NumberStat.svelte` | `number` | `number` |
| `TextStat.svelte` | `text` | `string` |
| `ToggledStat.svelte` | `toggled` | `boolean` |
| `ChoiceStat.svelte` | `choice` | `string` |
| `D20AbilityStat.svelte` | `d20_ability_score` | `number` |
| `DerivedStat.svelte` | `derived` | `string` (formula display) |

**Common Props:**
```svelte
interface StatProps {
  stat: CharacterStat;             // Stat definition from sheet
  value: unknown;                  // Current value
  readonly: boolean;
  onchange?: (value: unknown) => void;
}
```

## 4. Preview Page

### 4.1 URL Structure

```
/admin/sheets/preview?sheet={sheetKey}
```

### 4.2 Page Components

```
PreviewPage.astro
└── SheetPreviewApp.svelte (client:only)
    ├── SheetSelector (dropdown to pick sheet)
    ├── SampleDataEditor (JSON editor for test values)
    └── SheetRenderer (from @pelilauta/characters)
```

### 4.3 Sample Data Generation

The preview tool generates sensible defaults for each stat type:

| Stat Type | Default Sample Value |
|-----------|---------------------|
| `number` | `stat.value` or `0` |
| `text` | `stat.value` or `"Sample text"` |
| `toggled` | `stat.value` or `false` |
| `choice` | First option's value or `""` |
| `d20_ability_score` | `stat.baseValue` or `10` |
| `derived` | Formula string (not evaluated) |

## 5. Integration with Main App

### 5.1 Package Installation

The package is a workspace member:

```json
// package.json (root)
{
  "workspaces": ["packages/*"]
}
```

```json
// packages/characters/package.json
{
  "name": "@pelilauta/characters",
  "version": "0.1.0",
  "type": "module",
  "main": "src/index.ts",
  "svelte": "src/index.ts",
  "peerDependencies": {
    "svelte": "^5.0.0"
  }
}
```

### 5.2 Usage in Main App

```svelte
<script lang="ts">
import { SheetRenderer } from '@pelilauta/characters';
import type { CharacterSheet } from '@schemas/CharacterSheetSchema';

const sheet: CharacterSheet = /* loaded from static data */;
const values = { strength: 16, wisdom: 12 };
</script>

<SheetRenderer {sheet} {values} readonly />
```

### 5.3 Migration Path

Once the package is implemented:

1. Move existing stat components from `src/components/svelte/characters/CharacterApp/` to package
2. Update `CharacterApp.svelte` to use `@pelilauta/characters` components
3. Remove duplicated components from main app

## 6. Static Sheet Data

Sheets are loaded from static JSON (per ADR-001):

```
src/data/character-sheets/
├── index.ts           # Loader with validation
├── dnd5e.json         # D&D 5e sheet
└── homebrew.json      # Generic homebrew sheet
```

The preview page imports sheets via the loader:

```typescript
import { getSheet, getAllSheets } from '@data/character-sheets';

const sheet = getSheet('dnd5e');
const allSheets = getAllSheets();
```

## 7. Definition of Done

- [ ] `packages/characters/` package created with Svelte 5 components
- [ ] `SheetRenderer` renders all stat types correctly
- [ ] Layout system (`cols-1`, `cols-2`, `cols-3`) works as specified
- [ ] Preview page at `/admin/sheets/preview` functional
- [ ] Sample data generation for all stat types
- [ ] Package exports work from main app
- [ ] Unit tests for stat components
- [ ] Existing `CharacterApp` migrated to use package components

## 8. Anti-Patterns

- **No Firebase imports** in the package - it's pure presentation
- **No global stores** in package components - state passed via props
- **No `<style>` tags** - use `@11thdeg/cyan-css` classes only
- **No async operations** in stat components - parent handles data loading

## 9. Future Considerations

- PDF export using the same components
- Embeddable sheet widgets for external sites
- Print stylesheet support
- Accessibility audit for screen readers

## Changelog
- **2026-01-14**: Initial spec created

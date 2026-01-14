# PBI-091: Sheet Editor Property Drawer

**Feature**: Isolate detailed configuration into a dedicated sidebar.
**Parent Spec**: [plans/admin/sheet-editor/spec.md](plans/admin/sheet-editor/spec.md)

## Goals
1.  **Declutter**: Remove inline inputs from the main canvas cards.
2.  **Focus**: Allow editing one item at a time with full detail (labels, keys, descriptions).
3.  **Automation**: Auto-generate keys from labels to reduce manual typing.

## Requirements

### 1. Store Updates (`sheetEditorStore.ts`)
- **Selection State**: Track `selectedItem` (`{ type: 'sheet'|'group'|'block'|'stat', id: string }`).
- **Actions**: `selectItem(type, id)`, `clearSelection()`.
- ** Computed**: `selectedData` returns the actual object from the sheet tree.

### 2. UI Components
- **Canvas Interaction**:
  - Clicking a Stat/Block/Group selects it.
  - Selected item gets a visual highlight (border/shadow).
- **Property Drawer (`PropertyDrawer.svelte`)**:
  - Sidebar component (fixed right or slide-over).
  - Renders forms based on selection type:
    - `StatProperties`: Key, Label, Description, Type-specifics.
    - `BlockProperties`: Key, Label.
    - `GroupProperties`: Key, Layout.
    - `SheetProperties`: Name, System (default when nothing selected).

### 3. Smart Inputs
- **Auto-Key**: When editing "Label", automatically update "Key" (slugified) *unless* the user has manually edited the key (detect "detached" state).

## Out of Scope
- Drag & Drop (Phase 2).
- Advanced Formula Editor / Choice List Builder (Phase 3) - for now just use text areas.

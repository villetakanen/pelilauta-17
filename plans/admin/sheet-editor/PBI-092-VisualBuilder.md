# PBI-092: Sheet Editor Visual Builder & Drag-Drop

**Feature**: True WYSIWYG layout editing with drag-and-drop reordering.
**Parent Spec**: [plans/admin/sheet-editor/spec.md](plans/admin/sheet-editor/spec.md)
**Prerequisites**: PBI-091 (Property Drawer)

## Goals
1.  **Visual Parity**: The editor layout should match the character sheet renderer.
2.  **Intuitive Organization**: Reorder items naturally without "Up/Down" buttons.

## Requirements

### 1. Visual Grid
- Render `StatBlockGroups` using the actual CSS grid classes used in the renderer.
- Ensure the canvas represents the effective layout (1, 2, or 3 columns).

### 2. Drag & Drop
- **Library**: Use `svelte-dnd-action`.
- **Scopes**:
  - Reorder **Blocks** within a Group.
  - Reorder **Stats** within a Block.
  - Move **Stats** *between* Blocks (cross-container drag).
- **Persistence**: Store updates order immediately on drop.

## Out of Scope
- Advanced Formula Editing.

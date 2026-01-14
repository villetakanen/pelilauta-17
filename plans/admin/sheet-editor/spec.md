# Admin Character Sheet Editor Specification

## 1. Overview
The **Admin Character Sheet Editor** provides a visual, interactive interface for administrators to create and modify character sheet templates. It prioritizes "What You See Is What You Get" (WYSIWYG) editing with a focus on usability and layout.

**Location:** `/admin/sheets`  
**Access:** Admin-only

## 2. UX Architecture

The editor is divided into three main interaction areas:

### 2.1 The Visual Builder (Main Canvas)
The central area renders the sheet structure as close to the final representation as possible.
- **Visual Grid**: Renders `StatBlockGroups` using the actual CSS grid layouts (`cols-1`, `cols-2`, `cols-3`).
- **Drag & Drop**: Blocks and Stats can be reordered visually using drag handles.
- **Selection**: Clicking a Block or Stat puts it in a "Selected" state (highlighted border), populating the Property Drawer.

### 2.2 The Property Drawer (Sidebar)
A dedicated side panel for configuring the currently selected item. This keeps the main canvas clean.
- **Contextual**: Changes content based on selection (Sheet, Group, Block, or Stat).
- **Auto-Save**: Changes in the drawer apply immediately to the store.

### 2.3 The Toolbar & Preview
- **Add Buttons**: "Add Group", "Add Block", "Add Stat" buttons are contextually available.
- **Preview Toggle**: Switch between "Edit Structure" (showing dashed borders, handles) and "Preview" (rendering valid dummy data).

## 3. Data Model & Store

The editor uses `sheetEditorStore.ts` for centralized state management.

### 3.1 Store Architecture
- **State**: `_sheet` (private), `dirty`, `saving`, `selection` (id of selected item).
- **Computed**: `sheet` (read-only), `selectedItem`.
- **Actions**: All mutations go through strictly typed actions.

### 3.2 Automation
- **Auto-Key**: When a user types a "Label" (e.g., "Hit Points"), the "Key" (`hit_points`) is auto-generated unless manually overridden.

## 4. Component Hierarchy

```
SheetEditor (Layout Container)
├── EditorToolbar (Undo/Redo, Preview Toggle)
├── VisualBuilder (Canvas)
│   ├── StatBlockGroupRenderer (Grid Layout)
│   │   └── StatBlockRenderer (Card)
│   │       └── StatItemRenderer (Row)
└── PropertyDrawer (Sidebar)
    ├── SheetProperties (Name, System)
    ├── GroupProperties (Layout, Key)
    ├── BlockProperties (Key, Label)
    └── StatProperties (Key, Type, Config)
        ├── ChoiceEditor (Options List)
        └── FormulaEditor (Derived Stats)
```

## 5. Stat Type Support

| Type | Config via Property Drawer |
|------|----------------------------|
| `number` | Min/Max (future), Default Value |
| `text` | Default Value, Multiline option |
| `toggled` | Default State |
| `choice` | **Dynamic Option List** (Add/Remove/Reorder Label-Value pairs) |
| `derived` | **Formula Input** with syntax hints |
| `d20_ability_score` | Base Value, Proficiency Toggle |

## 6. Glossary
- **Canvas**: The main editing area.
- **Drawer**: The configuration sidebar.
- **Block**: A visual card containing stats.
- **Group**: A layout container (1-3 columns) holding blocks.

## Changelog
- **2026-01-13**: Major spec overhaul. Introduced Visual Builder & Property Drawer architecture.
- **2026-01-09**: Refactored to store-based architecture.


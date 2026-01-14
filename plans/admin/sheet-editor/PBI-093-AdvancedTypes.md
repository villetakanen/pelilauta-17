# PBI-093: Sheet Editor Advanced Types

**Feature**: specialized UI for complex stat configurations.
**Parent Spec**: [plans/admin/sheet-editor/spec.md](plans/admin/sheet-editor/spec.md)
**Prerequisites**: PBI-091 (Property Drawer)

## Goals
1.  **Complete Config**: Enable full usage of `choice` and `derived` stats.
2.  **Validation**: Prevent invalid formulas or empty choice lists.

## Requirements

### 1. Choice Editor (in Property Drawer)
- **Interface**: List builder for `options`.
- **Actions**: Add option, Remove option, Reorder options.
- **Fields per Option**: Label, Value.

### 2. Formula Editor (in Property Drawer)
- **Interface**: Text area for formula stats.
- **Helpers**:
  - Syntax highlighting (nice to have).
  - "Insert Stat" dropdown to pick valid variables (e.g., `@strength`).
  - Validation warning if formula is malformed.

### 3. D20 Proficiency
- Toggle for `hasProficiency`.
- Input for `baseValue`.

## Out of Scope
- Runtime evaluation of formulas (that's the Renderer's job).

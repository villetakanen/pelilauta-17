# PBI-068: Admin UI for Choice Stats

**Epic:** [L&L Character Creation Support](../epics/lnl-character-creation.md)  
**Spec Reference:** [Admin Sheet Editor Spec](../../plans/admin/sheet-editor/spec.md)

## Directive
Add `choice` stat type support to the admin character sheet editor, allowing admins to create and edit choice stats with static options.

**Scope:**
- `src/components/svelte/admin/sheets/SheetStats.svelte` — Add choice to type dropdown, handle type change
- `src/components/svelte/admin/sheets/ChoiceOptionsEditor.svelte` — New component for editing options array

**Do NOT touch:**
- Character view components (`ChoiceStat.svelte`, `Stat.svelte`) — already complete
- Schema (`CharacterSheetSchema.ts`) — already has `choice` type

## Dependencies
- Blocked by: PBI-061 (schema + view components) ✅ Complete
- Must merge before: PBI-063 (L&L data seeding benefits from admin UI)

## Context
Read: `plans/admin/sheet-editor/spec.md`
- Section 3.2: Adding New Stat Types

Read: `plans/character-sheets/spec.md`
- Section 3.1: Choice Stat Architecture (options stored inline)

## Verification
- [ ] Type dropdown includes "Choice" option
- [ ] Selecting "Choice" initializes stat with `{ type: 'choice', options: [], value: '' }`
- [ ] Options editor allows adding/removing `{ label, value }` pairs
- [ ] Saving sheet persists choice stat with options to Firestore
- [ ] Manual test: Create sheet with choice stat via admin UI

## Refinement Protocol
If implementation requires changes to `plans/admin/sheet-editor/spec.md`, update Section 3 (Stat Type Editor Support) in the same PR.

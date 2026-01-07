# PBI-061: Add Choice Stat Type to Character Sheet Engine

**Epic:** [L&L Character Creation Support](../epics/lnl-character-creation.md)  
**Spec Reference:** [Character Sheet System Spec](../../plans/character-sheets/spec.md)

## Directive
Extend `CharacterStatSchema` with a new `choice` type and implement `ChoiceStat.svelte` to render dropdown selections in character sheets.

**Scope:**
- `src/schemas/CharacterSheetSchema.ts` — Add `ChoiceStatSchema`
- `src/components/svelte/characters/CharacterApp/ChoiceStat.svelte` — New component
- `src/components/svelte/characters/CharacterApp/Stat.svelte` — Add choice branch
- `src/schemas/CharacterSheetSchema.test.ts` — New test file
- `e2e/character-sheets.spec.ts` — New or extend E2E tests

**Do NOT touch:**
- Existing stat type implementations
- Admin sheet editor (PBI-063 handles data seeding)

## Dependencies
- Blocked by: None
- Must merge before: PBI-063 (L&L data seeding uses `choice` stats)

## Context
Read: `plans/character-sheets/spec.md`
- Section 3: Supported Stat Types (extend table)
- Section 6: Known Gaps (this PBI addresses gap #1)

Read: `docs/epics/lnl-character-creation.md`
- Section 4.1.A: SelectStat requirements (now `choice`)

## Verification
- [ ] Schema: `ChoiceStatSchema` parses with static `options` array
- [ ] Schema: `ChoiceStatSchema` parses with `ref` path string
- [ ] Schema: Rejects when neither `options` nor `ref` provided
- [ ] UI: `Stat.svelte` renders `<ChoiceStat>` for `type === 'choice'`
- [ ] UI: Dropdown shows options from static array
- [ ] UI: Read-only display when `canEdit === false`
- [ ] Unit tests: All schema validation cases pass (`pnpm test`)
- [ ] E2E: Character with choice stat displays dropdown (`pnpm exec playwright test`)

## Refinement Protocol
If implementation requires changes to `plans/character-sheets/spec.md`, update Section 3 (Supported Stat Types) in the same PR with a changelog entry.


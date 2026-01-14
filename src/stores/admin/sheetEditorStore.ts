/**
 * Sheet Editor Store
 *
 * Centralized state management for the admin character sheet editor.
 * All sheet mutations go through this store's action functions.
 *
 * The sheet is exposed as a read-only computed to ensure all mutations
 * go through the store's actions, which properly handle the dirty flag.
 *
 * @see plans/admin/sheet-editor/spec.md
 */
import { toFirestoreEntry } from '@utils/client/toFirestoreEntry';
import { atom, computed, type WritableAtom } from 'nanostores';
import {
  CHARACTER_SHEETS_COLLECTION_NAME,
  type CharacterSheet,
  CharacterSheetSchema,
  type CharacterStat,
  CharacterStatSchema,
  migrateCharacterSheet,
  type StatBlock,
  type StatBlockGroup,
} from 'src/schemas/CharacterSheetSchema';
import { logDebug, logError } from 'src/utils/logHelpers';

// ---------------------------------------------------------------------------
// Internal State (private)
// ---------------------------------------------------------------------------

/**
 * Internal writable atom for the sheet. Not exported to prevent direct mutations.
 */
const _sheet: WritableAtom<CharacterSheet | null> = atom(null);

// ---------------------------------------------------------------------------
// Public Atoms & Derived State
// ---------------------------------------------------------------------------

/**
 * The current sheet being edited (read-only).
 * Use store actions to modify the sheet.
 */
export const sheet = computed(_sheet, ($s) => $s);

/**
 * True when there are unsaved changes.
 */
export const dirty: WritableAtom<boolean> = atom(false);

/**
 * True while a save operation is in progress.
 */
export const saving: WritableAtom<boolean> = atom(false);

// ---------------------------------------------------------------------------
// Selection State
// ---------------------------------------------------------------------------

export type SelectionType = 'sheet' | 'group' | 'block' | 'stat';

export interface Selection {
  type: SelectionType;
  id: string; // The "key" of the selected item
}

/**
 * The current selection.
 */
export const selection: WritableAtom<Selection | null> = atom(null);

/**
 * The actual data object for the currently selected item.
 */
export const selectedItem = computed([_sheet, selection], ($sheet, $sel) => {
  if (!$sheet || !$sel) return null;

  switch ($sel.type) {
    case 'sheet':
      return $sheet;
    case 'group':
      return $sheet.statBlockGroups?.find((g) => g.key === $sel.id) ?? null;
    case 'block':
      for (const group of $sheet.statBlockGroups ?? []) {
        const block = group.blocks.find((b) => b.key === $sel.id);
        if (block) return block;
      }
      return null;
    case 'stat':
      return $sheet.stats?.find((s) => s.key === $sel.id) ?? null;
    default:
      return null;
  }
});

/**
 * List of all block keys from the current sheet.
 */
export const availableBlocks = computed(_sheet, ($sheet) => {
  const blocks: string[] = [];
  for (const group of $sheet?.statBlockGroups ?? []) {
    for (const block of group.blocks) {
      blocks.push(block.key);
    }
  }
  return blocks;
});

/**
 * Stats organized by block, plus any unlisted stats.
 */
export const groupedStats = computed(_sheet, ($sheet) => {
  const grouped: Record<string, CharacterStat[]> = {};
  const unlisted: CharacterStat[] = [];
  const stats = $sheet?.stats ?? [];

  // Compute block keys inline for proper reactivity
  const blocks: string[] = [];
  for (const group of $sheet?.statBlockGroups ?? []) {
    for (const block of group.blocks) {
      blocks.push(block.key);
    }
  }

  // Initialize empty arrays for each block
  for (const blockKey of blocks) {
    grouped[blockKey] = [];
  }

  // Sort stats into blocks
  for (const stat of stats) {
    if (stat.block && blocks.includes(stat.block)) {
      grouped[stat.block].push(stat);
    } else {
      unlisted.push(stat);
    }
  }

  return { grouped, unlisted };
});

// ---------------------------------------------------------------------------
// Internal Helpers
// ---------------------------------------------------------------------------

/**
 * Update the sheet with partial updates. Sets dirty flag.
 */
function updateSheet(updates: Partial<CharacterSheet>): void {
  const current = _sheet.get();
  if (!current) return;

  const updated = CharacterSheetSchema.parse({ ...current, ...updates });
  _sheet.set(updated);
  dirty.set(true);
}

// ---------------------------------------------------------------------------
// Persistence
// ---------------------------------------------------------------------------

/**
 * Load a sheet from Firestore by key.
 */
export async function loadSheet(key: string): Promise<void> {
  const { doc, getDoc } = await import('firebase/firestore');
  const { db } = await import('@firebase/client');

  const docRef = doc(db, CHARACTER_SHEETS_COLLECTION_NAME, key);
  const snapshot = await getDoc(docRef);

  if (snapshot.exists()) {
    const data = snapshot.data();
    const loadedSheet = migrateCharacterSheet({ ...data, key });
    _sheet.set(loadedSheet);
    dirty.set(false);
    logDebug('sheetEditorStore', 'Loaded sheet:', key);
  } else {
    throw new Error(`Character sheet not found: ${key}`);
  }
}

/**
 * Save the current sheet to Firestore.
 */
export async function saveSheet(): Promise<void> {
  const currentSheet = _sheet.get();
  if (!currentSheet?.key) {
    throw new Error('No sheet to save or sheet missing key');
  }

  saving.set(true);
  try {
    const { doc, setDoc } = await import('firebase/firestore');
    const { db } = await import('@firebase/client');

    const docRef = doc(db, CHARACTER_SHEETS_COLLECTION_NAME, currentSheet.key);
    await setDoc(docRef, toFirestoreEntry(currentSheet));

    dirty.set(false);
    logDebug('sheetEditorStore', 'Saved sheet:', currentSheet.key);
  } catch (error) {
    logError('sheetEditorStore', 'Failed to save sheet:', error);
    throw error;
  } finally {
    saving.set(false);
  }
}

// ---------------------------------------------------------------------------
// Selection Actions
// ---------------------------------------------------------------------------

export function selectItem(type: SelectionType, id: string): void {
  selection.set({ type, id });
}

export function clearSelection(): void {
  selection.set(null);
}

// ---------------------------------------------------------------------------
// Sheet Info Actions
// ---------------------------------------------------------------------------

/**
 * Update sheet info (name, system).
 */
export function updateSheetInfo(
  updates: Partial<Pick<CharacterSheet, 'name' | 'system'>>,
): void {
  updateSheet(updates);
}

// ---------------------------------------------------------------------------
// Stat Actions
// ---------------------------------------------------------------------------

/**
 * Add a new stat to a block with default values.
 */
export function addStat(blockKey: string): void {
  const current = _sheet.get();
  if (!current) return;

  // Generate a unique placeholder key
  const existingKeys = new Set(current.stats?.map((s) => s.key) ?? []);
  let placeholderKey = 'new_stat';
  let counter = 1;
  while (existingKeys.has(placeholderKey)) {
    placeholderKey = `new_stat_${counter++}`;
  }

  const newStat: CharacterStat = {
    type: 'number',
    key: placeholderKey,
    value: 0,
    block: blockKey,
  };

  updateSheet({ stats: [...(current.stats ?? []), newStat] });
}

/**
 * Update a stat at the given index with partial updates.
 */
export function updateStat(
  index: number,
  updates: Partial<CharacterStat>,
): void {
  const current = _sheet.get();
  if (!current?.stats) return;

  const stats = [...current.stats];
  const stat = stats[index];
  if (!stat) return;

  stats[index] = CharacterStatSchema.parse({ ...stat, ...updates });
  updateSheet({ stats });
}

/**
 * Remove a stat at the given index.
 */
export function removeStat(index: number): void {
  const current = _sheet.get();
  if (!current?.stats) return;

  const stats = [...current.stats];
  stats.splice(index, 1);
  updateSheet({ stats });
}

/**
 * Change a stat's type and initialize type-specific defaults.
 */
export function changeStatType(
  index: number,
  type: 'number' | 'toggled' | 'derived' | 'd20_ability_score' | 'choice',
): void {
  switch (type) {
    case 'number':
      updateStat(index, { type, value: 0 });
      break;
    case 'toggled':
      updateStat(index, { type, value: false });
      break;
    case 'derived':
      updateStat(index, { type, formula: '' });
      break;
    case 'd20_ability_score':
      updateStat(index, {
        type,
        baseValue: 10,
        value: 0,
        hasProficiency: false,
      });
      break;
    case 'choice':
      updateStat(index, { type, options: [], value: '' });
      break;
  }
}

// ---------------------------------------------------------------------------
// Block Group Actions
// ---------------------------------------------------------------------------

/**
 * Add a new stat block group.
 */
export function addBlockGroup(
  key: string,
  layout: StatBlockGroup['layout'] = 'cols-1',
): void {
  const current = _sheet.get();
  if (!current) return;

  // Don't add duplicate groups
  if (current.statBlockGroups?.some((g) => g.key === key)) return;

  const newGroup: StatBlockGroup = { key, layout, blocks: [] };
  updateSheet({
    statBlockGroups: [...(current.statBlockGroups ?? []), newGroup],
  });
}

/**
 * Remove a stat block group (only if empty).
 */
export function removeBlockGroup(groupKey: string): void {
  const current = _sheet.get();
  if (!current?.statBlockGroups) return;

  const group = current.statBlockGroups.find((g) => g.key === groupKey);
  if (!group || group.blocks.length > 0) return;

  const statBlockGroups = current.statBlockGroups.filter(
    (g) => g.key !== groupKey,
  );
  updateSheet({ statBlockGroups });
}

/**
 * Update a block group's layout.
 */
export function updateBlockGroupLayout(
  groupKey: string,
  layout: StatBlockGroup['layout'],
): void {
  const current = _sheet.get();
  if (!current?.statBlockGroups) return;

  const statBlockGroups = current.statBlockGroups.map((g) =>
    g.key === groupKey ? { ...g, layout } : g,
  );
  updateSheet({ statBlockGroups });
}

/**
 * Update a block group's key (name).
 */
export function updateBlockGroupKey(oldKey: string, newKey: string): void {
  const current = _sheet.get();
  if (!current?.statBlockGroups) return;

  const statBlockGroups = current.statBlockGroups.map((g) =>
    g.key === oldKey ? { ...g, key: newKey } : g,
  );
  updateSheet({ statBlockGroups });
}

/**
 * Move a block group up in the list.
 */
export function moveBlockGroupUp(groupKey: string): void {
  const current = _sheet.get();
  if (!current?.statBlockGroups) return;

  const index = current.statBlockGroups.findIndex((g) => g.key === groupKey);
  if (index <= 0) return;

  const statBlockGroups = [...current.statBlockGroups];
  [statBlockGroups[index - 1], statBlockGroups[index]] = [
    statBlockGroups[index],
    statBlockGroups[index - 1],
  ];
  updateSheet({ statBlockGroups });
}

/**
 * Move a block group down in the list.
 */
export function moveBlockGroupDown(groupKey: string): void {
  const current = _sheet.get();
  if (!current?.statBlockGroups) return;

  const index = current.statBlockGroups.findIndex((g) => g.key === groupKey);
  if (index < 0 || index >= current.statBlockGroups.length - 1) return;

  const statBlockGroups = [...current.statBlockGroups];
  [statBlockGroups[index], statBlockGroups[index + 1]] = [
    statBlockGroups[index + 1],
    statBlockGroups[index],
  ];
  updateSheet({ statBlockGroups });
}

// ---------------------------------------------------------------------------
// Block Actions (within a group)
// ---------------------------------------------------------------------------

/**
 * Add a new block to a group.
 */
export function addBlock(groupKey: string, blockKey: string): void {
  const current = _sheet.get();
  if (!current?.statBlockGroups) return;

  const statBlockGroups = current.statBlockGroups.map((g) => {
    if (g.key !== groupKey) return g;
    // Don't add duplicate blocks
    if (g.blocks.some((b) => b.key === blockKey)) return g;
    return { ...g, blocks: [...g.blocks, { key: blockKey }] };
  });
  updateSheet({ statBlockGroups });
}

/**
 * Remove a block from a group (only if it has no stats).
 */
export function removeBlock(groupKey: string, blockKey: string): void {
  const current = _sheet.get();
  if (!current?.statBlockGroups) return;

  // Check if block has stats
  const hasStats = current.stats?.some((s) => s.block === blockKey);
  if (hasStats) return;

  const statBlockGroups = current.statBlockGroups.map((g) => {
    if (g.key !== groupKey) return g;
    return { ...g, blocks: g.blocks.filter((b) => b.key !== blockKey) };
  });
  updateSheet({ statBlockGroups });
}

/**
 * Update a block's key (name).
 */
export function updateBlockKey(
  groupKey: string,
  oldBlockKey: string,
  newBlockKey: string,
): void {
  const current = _sheet.get();
  if (!current?.statBlockGroups) return;

  // Update the block key
  const statBlockGroups = current.statBlockGroups.map((g) => {
    if (g.key !== groupKey) return g;
    return {
      ...g,
      blocks: g.blocks.map((b) =>
        b.key === oldBlockKey ? { ...b, key: newBlockKey } : b,
      ),
    };
  });

  // Also update any stats referencing this block
  const stats = current.stats?.map((s) =>
    s.block === oldBlockKey ? { ...s, block: newBlockKey } : s,
  );

  updateSheet({ statBlockGroups, stats });
}

/**
 * Update a block's properties (excluding key).
 */
export function updateBlock(
  groupKey: string,
  blockKey: string,
  updates: Partial<Omit<StatBlock, 'key'>>,
): void {
  const current = _sheet.get();
  if (!current?.statBlockGroups) return;

  const statBlockGroups = current.statBlockGroups.map((g) => {
    if (g.key !== groupKey) return g;
    return {
      ...g,
      blocks: g.blocks.map((b) =>
        b.key === blockKey ? { ...b, ...updates } : b,
      ),
    };
  });

  updateSheet({ statBlockGroups });
}

/**
 * Check if a block has any stats.
 */
export function blockHasStats(blockKey: string): boolean {
  const current = _sheet.get();
  return current?.stats?.some((s) => s.block === blockKey) ?? false;
}

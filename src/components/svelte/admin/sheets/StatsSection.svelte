<script lang="ts">
import { CharacterSheetSchema } from '@schemas/CharacterSheetSchema';
import { characterSheet as sheet } from '@stores/characters/characterSheetStore';

interface Props {
  group: string;
}
const { group }: Props = $props();

const stats = $derived.by(() => {
  return $sheet?.stats.filter((s) => s.group === group) || [];
});
</script>

<section class="stat-grid">
  {#each stats as stat}

      <input 
        type="text"
        value="{stat.key}"
        oninput={(e) => {
          const updatedSheet = { ...$sheet };
          if (!updatedSheet.stats) return;
          const statToUpdate = updatedSheet.stats.find((s) => s.key === stat.key);
          if (statToUpdate) {
            statToUpdate.key = (e.target as HTMLInputElement).value;
            sheet.set(CharacterSheetSchema.parse(updatedSheet));
          }
        }}
      />
      <select
        onchange={(e) => {
          const updatedSheet = { ...$sheet };
          if (!updatedSheet.stats) return;
          const statToUpdate = updatedSheet.stats.find((s) => s.key === stat.key);
          if (statToUpdate) {
            statToUpdate.type = (e.target as HTMLSelectElement).value as 'number' | 'text';
            statToUpdate.value = statToUpdate.type === 'number' ? 0 : '';
            sheet.set(CharacterSheetSchema.parse(updatedSheet));
          }
        }}
      >
        <option value="number" selected={stat.type === 'number'}>123</option>
        <option value="text" selected={stat.type === 'text'}>ABC</option>
      </select>
      <button class="text" aria-label="delete">
        <cn-icon noun="delete"></cn-icon>
      </button>
{/each}
</section>

<style>
.stat-grid {
  display: grid;
  grid-template-columns: 1fr auto auto;
  gap: 0.5rem;
  align-items: center;
  margin-bottom: 0.5rem;
}
</style>
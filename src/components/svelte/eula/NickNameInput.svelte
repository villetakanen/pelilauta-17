<script lang="ts">
import { t } from '@utils/i18n';

interface NickNameInputProps {
  nick: string;
  onNickChange: (nick: string, exists: boolean) => void;
}
const { nick, onNickChange }: NickNameInputProps = $props();
let exists = $state(false);
let currentNick = $state(nick);

// Keep currentNick in sync with prop changes
$effect(() => {
  currentNick = nick;
});

async function onInput(event: Event) {
  const target = event.target as HTMLInputElement;
  const newNick = target.value;
  currentNick = newNick;
  onNickChange(newNick, exists);
}

async function onBlur(event: Event) {
  const target = event.target as HTMLInputElement;
  const nickValue = target.value;

  if (!nickValue) {
    exists = false;
    onNickChange(nickValue, false);
    return;
  }

  // Check for duplicates on blur
  const hasDuplicate = await checkForDuplicate(nickValue);
  exists = hasDuplicate;
  onNickChange(nickValue, hasDuplicate);
}

async function checkForDuplicate(nickname: string): Promise<boolean> {
  if (!nickname) return false;

  try {
    const { doc, getDoc, getFirestore } = await import('firebase/firestore');
    const profileDoc = await getDoc(doc(getFirestore(), 'profiles', nickname));
    return profileDoc.exists();
  } catch (error) {
    console.error('Error checking nickname:', error);
    return false;
  }
}
</script>

<div>
  <label>
    {t('entries:profile.nick')}
    <input
      type="text"
      value={currentNick}
      oninput={onInput}
      onblur={onBlur}
      data-error={exists}
    />
  </label>
  {#if exists} 
    <p class="alert p-0 m-0">{t('login:eula.nickTaken')}</p>
  {/if}
</div>
<script lang="ts">
import { updateProfile } from '@firebase/client/profile/updateProfile';
import { uploadAvatar } from '@firebase/client/profile/uploadAvatar';
import type { Profile } from '@schemas/ProfileSchema';
import { logout, uid } from '@stores/session';
import { resizeImage } from '@utils/client/resizeImage';
import { t } from '@utils/i18n';

type Props = {
  profile: Profile;
};

const { profile }: Props = $props();
let avatarURL = $state(profile.avatarURL);
let avatarFile = $state<File | null>(null);
let bio = $state(profile.bio);

const changes = $derived.by(() => {
  if (avatarFile) return true;
  if (bio !== profile.bio) return true;
  return false;
});

async function onFileChange(event: Event) {
  const file = (event.target as HTMLInputElement).files?.[0];
  if (!file) return;

  if (!file.type.startsWith('image/')) throw new Error('Invalid file type');
  const resizedFile = await resizeImage(file);

  const reader = new FileReader();
  reader.onload = () => {
    if (typeof reader.result === 'string') {
      avatarURL = reader.result;
    }
  };
  reader.readAsDataURL(resizedFile);

  document.getElementById('avatar-popover')?.removeAttribute('open');

  avatarFile = resizedFile;
}

async function handleSubmit(event: Event) {
  event.preventDefault();
  if (!changes) return;

  if (avatarFile) {
    // Updated the Avatar - lets upload it
    await uploadAvatar(avatarFile);
    avatarFile = null;
  }

  if (bio !== profile.bio) {
    // Updated the Bio - lets update it
    await updateProfile({ bio }, $uid);
  }
}
function setBio(event: Event) {
  bio = (event.target as HTMLTextAreaElement).value;
}
async function logoutAction() {
  await logout();
  window.location.href = '/logout';
}
</script>

<article>
  <h3>{t('settings:profile.title')}</h3>

  <h4 class="downscaled mb-0">
    {t('entries:profile.uid')}
  </h4>
  <p class="mt-0">{ $uid }</p>

  <h4 class="downscaled mb-0">
    {t('entries:profile.username')}
  </h4>
  <p class="mt-0">{ profile.username }</p>

  <h4 class="downscaled mb-0">
    {t('settings:profile.edit.title')}
  </h4>

  <form onsubmit={handleSubmit} class="flex flex-col">
  <label for="avatar-file-input">{t('entries:profile.avatar')}
  <input type="file" accept="image/*" style="display: none;" id="avatar-file-input"
    onchange={onFileChange}
    
  />
  <cn-avatar-button
    role="button"
    tabindex="0"
    src={avatarURL}
    onkeydown={(e:KeyboardEvent) => e.key === 'Enter' && document.getElementById('avatar-file-input')?.click()}
    onclick={() => document.getElementById('avatar-file-input')?.click()}
  ></cn-avatar-button>
  </label>

  <label>
    {t('entries:profile.bio')}
    <textarea
      oninput={setBio}
      placeholder={t('entries:profile.bio')}
    >{profile.bio}</textarea>
  </label>

    <div class="toolbar justify-end">
      <button type="submit" disabled={!changes}>
        {t('actions:save')}
      </button>
    </div>


    <p class="downscaled text-low">
      {t('settings:profile.info')}
    </p>
  </form>

</article>
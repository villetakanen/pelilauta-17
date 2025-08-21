<script lang="ts">
import type { Profile } from '@schemas/ProfileSchema';

type Props = {
  profile: Profile;
};

const { profile }: Props = $props();
</script>

<article class="column-s flex" style="flex-direction: column; align-items: center;">

  <cn-avatar
    src={profile.avatarURL} 
    alt={profile.nick}
    ></cn-avatar>
    
  <p class="m-0 text-center">
    <strong>{ profile.nick }</strong><br>
    <span class="text-small">{ profile.username }</span>
  </p>
  <p class="small">
    { profile.bio }
  </p>
</article>
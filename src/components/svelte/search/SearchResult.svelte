<script lang="ts">
import { t } from '@utils/i18n';
import MarkdownContent from '../app/MarkdownContent.svelte';
import ProfileLink from '../app/ProfileLink.svelte';

interface Props {
  result: {
    title: string;
    markdownContent: string;
    type: string;
    author: string;
    path: string;
  };
}
const { result }: Props = $props();
const url = `/threads/${result.path.split('/').pop()}`;
</script>

<div class="search-result mb-2 border-t">
  <h3 class="text-h5 m-0">{result.title}</h3>
  <p><ProfileLink uid={result.author} /></p>
  <div><MarkdownContent content={(result.markdownContent || '').substring(0, 100)} />...</div>
  <a href={url} class="read-more">{t("actions:more")}</a>
</div>
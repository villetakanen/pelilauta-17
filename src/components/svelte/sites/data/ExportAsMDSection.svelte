<script lang="ts">
import { createSiteExport } from '@firebase/client/site/createSiteExport';
import { exportSiteAsMd } from '@firebase/client/site/exportSiteAsMd';
import { site } from '@stores/site';
import { t } from '@utils/i18n';
import { saveAs } from 'file-saver';

async function exportSite() {
  if (!$site) return;
  const zipFile = createSiteExport($site, window.location.origin);
  const blob = await zipFile;
  saveAs(blob, `${$site.key}.zip`);
}

async function exportSiteAsDoc() {
  if (!$site) return;
  const md = await exportSiteAsMd($site, window.location.origin);
  const blob = new Blob([md], { type: 'text/plain;charset=utf-8' });
  saveAs(blob, `${$site.key}.md`);
}
</script>

<section class="elevation-1 p-2 column-s">
  <h2>{t('site:data.export.title')}</h2>
  <h3>{t('site:data.export.asMarkdown')}</h3>
    
  <button class="text" onclick={exportSite} type="button">
    <cn-icon noun="arrow-down"></cn-icon>
    <span>{t('actions:export.asZippedFolder')}</span>
  </button>

  <p class="downscaled text-low">{t('site:toc.importExport.description')}</p>

  <button class="text" onclick={exportSiteAsDoc} type="button">
    <cn-icon noun="arrow-down"></cn-icon>
    <span>{t('site:data.actions.asMarkdonwDocument')}</span>
  </button>

  <p class="downscaled text-low">{t('site:data.export.asMarkdownDocument')}</p>
</section>

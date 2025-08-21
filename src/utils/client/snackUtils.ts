import type { SnackbarMessage } from '@11thdeg/cyan-next';
import { type LocaleSubstitutions, t } from '@utils/i18n';

function _toMessage(
  snack: string | SnackbarMessage,
  subs?: LocaleSubstitutions,
): SnackbarMessage {
  return typeof snack === 'string' ? { message: t(snack, subs) } : snack;
}

export function pushSessionSnack(
  snack: string | SnackbarMessage,
  subs?: LocaleSubstitutions,
) {
  const message = _toMessage(snack, subs);
  window.sessionStorage.setItem('snack', JSON.stringify(message));
  //logDebug('Session snack pushed', message);
}

export function pushSnack(snack: string | SnackbarMessage) {
  const message = _toMessage(snack);
  document.dispatchEvent(
    new CustomEvent('cn-snackbar-add', {
      bubbles: true,
      detail: message,
    }),
  );
  //logDebug('Snack pushed', message);
}

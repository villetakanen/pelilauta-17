export function toDisplayString(date: Date | number | undefined): string {
  if (!date) return 'N/A';
  return new Date(date).toISOString().substring(0, 10);
}
export function toTimeString(date: Date | number | undefined): string {
  if (!date) return 'N/A';
  // Take the iso format date and time, and add a space in between
  const isoString = new Date(date).toISOString();
  return `${isoString.substring(0, 10)} ${isoString.substring(11, 19)}`;
}

/**
 * Takes in a string of markdown content and extracts tags (#tag) from it.
 * @param content
 */
export function extractTags(content: string): string[] {
  const tags = content.match(/#[a-zA-Z0-9äöüÄÖÜ]+/g);
  // we want to only 1 tag per tag
  const raw = tags ? [...new Set(tags)] : [];
  return raw.map((tag) => tag.replace('#', ''));
}

/**
 * @deprecated Use createRichSnippet() or createPlainSnippet() from snippetHelpers.ts instead
 *
 * Creates a [120] character long snippet from a markdown content.
 *
 * Changes all topics to bold, and removes all other markdown.
 *
 * Adds an ellipsis at the end if the snippet is cut off.
 *
 * @see {@link ../snippetHelpers.ts} for the new implementation
 */
export function createSnippet(content: string, lenght = 120): string {
  if (typeof console !== 'undefined' && console.warn) {
    console.warn(
      'createSnippet() is deprecated. Use createPlainSnippet() or createRichSnippet() from src/utils/snippetHelpers.ts instead.',
    );
  }
  // const tags = extractTags(content);
  const snippet = content.replace(/#([a-zA-Z0-9äöüÄÖÜ]+)/g, '<b>$1</b>');
  const plainText = snippet.replace(/<[^>]*>/g, '');
  return plainText.length > lenght
    ? `${plainText.substring(0, lenght)}...`
    : plainText;
}

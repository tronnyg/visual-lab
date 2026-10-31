/** Characters browsers ignore inside a URL scheme ("java\nscript:" still runs), so they are removed before the scheme is checked. */
const ignorable = /[\u0000-\u0020]/g;
const scheme = /^([a-z][a-z0-9+.-]*):/i;

/**
 * React-level guard for link components: relative paths, anchors and web, mail and phone links pass. Any other scheme
 * (javascript:, data:, vbscript:, file:, ...) is refused, so generated or user-supplied text can never become a script link.
 */
export function isSafeHref(href: string): boolean {
  const m = scheme.exec(href.replace(ignorable, ""));
  return !m || /^(https?|mailto|tel)$/i.test(m[1]);
}

/**
 * OpenUI-level guard, matching Markdown's rule: links may only go to the web, a mail or phone app, or an anchor on the page.
 * Relative paths are refused there because they would resolve against the Visual Lab host and navigate away from the board.
 */
export function isBoardHref(href: string): boolean {
  return /^(https?:|mailto:|tel:|#)/i.test(href.replace(ignorable, "")) && isSafeHref(href);
}

/** Absolute web links leave the board, so OpenUI adapters open them in a new tab. */
export function isExternalHref(href: string): boolean {
  return /^https?:/i.test(href.replace(ignorable, ""));
}

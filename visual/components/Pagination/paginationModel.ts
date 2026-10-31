/** One slot in the page window: a page number, or a gap that stands for the pages left out on that side. */
export type PageItem = number | "start-ellipsis" | "end-ellipsis";

/** A whole number of at least `min`; anything else (NaN, Infinity, fractions, undefined) falls back or is rounded down. */
export function wholeNumber(value: unknown, fallback: number, min = 0): number {
  return typeof value === "number" && Number.isFinite(value) ? Math.max(min, Math.floor(value)) : fallback;
}

/** The page shown as current: always a whole page from 1 to `totalPages` (0 when there are no pages). */
export function clampPage(page: unknown, totalPages: number): number {
  if (totalPages < 1) return 0;
  return Math.min(totalPages, wholeNumber(page, 1, 1));
}

const range = (start: number, end: number): number[] => Array.from({length: Math.max(0, end - start + 1)}, (_, i) => start + i);

/**
 * The page buttons to show: `boundaryCount` pages at each end, `siblingCount` pages on each side of the current page, and an ellipsis
 * for a gap of two or more pages. When the gap is exactly one page that page is shown instead of an ellipsis, and the window keeps the
 * same number of slots as the current page moves, so the control does not change width while paging.
 * Pure and deterministic: it never produces more than 2 * boundaryCount + 2 * siblingCount + 3 slots, however many pages there are.
 */
export function getPageItems({page, totalPages, siblingCount = 1, boundaryCount = 1}: {page: number; totalPages: number; siblingCount?: number; boundaryCount?: number}): PageItem[] {
  const total = wholeNumber(totalPages, 0);
  const sibling = wholeNumber(siblingCount, 1);
  const boundary = wholeNumber(boundaryCount, 1);
  if (total < 1) return [];
  const current = clampPage(page, total);

  // Few enough pages that every one fits in the window.
  if (total <= 2 * boundary + 2 * sibling + 3) return range(1, total);

  const startPages = range(1, boundary);
  const endPages = range(total - boundary + 1, total);
  const siblingsStart = Math.max(Math.min(current - sibling, total - boundary - sibling * 2 - 1), boundary + 2);
  const siblingsEnd = Math.min(Math.max(current + sibling, boundary + sibling * 2 + 2), total - boundary - 1);

  return [
    ...startPages,
    siblingsStart > boundary + 2 ? "start-ellipsis" as const : boundary + 1 < total - boundary ? boundary + 1 : [],
    ...range(siblingsStart, siblingsEnd),
    siblingsEnd < total - boundary - 1 ? "end-ellipsis" as const : total - boundary > boundary ? total - boundary : [],
    ...endPages,
  ].flat();
}

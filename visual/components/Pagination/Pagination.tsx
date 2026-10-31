import type {ComponentPropsWithoutRef, Ref} from "react";
import {useControllableState} from "../../shared/useControllableState";
import {clampPage, getPageItems, wholeNumber} from "./paginationModel";

export const paginationVariants = ["default", "compact"] as const;
export type PaginationVariant = (typeof paginationVariants)[number];

interface PaginationOwnProps {
  /** Current page, from 1. Makes the component controlled. */
  page?: number;
  /** Initial page when uncontrolled. Defaults to 1. */
  defaultPage?: number;
  /** How many pages there are. Fractions are rounded down; fewer than 1 renders nothing. */
  totalPages: number;
  /** Called with the new page when the user picks one (not on first render, and not when `page` changes from outside). */
  onPageChange?: (page: number) => void;
  /** Pages shown on each side of the current page. Defaults to 1. */
  siblingCount?: number;
  /** Pages always shown at the start and end. Defaults to 1. */
  boundaryCount?: number;
  /** `default` shows numbered pages; `compact` shows only previous, "Page X of Y" and next. */
  variant?: PaginationVariant;
  /** Disables every control. */
  disabled?: boolean;
  /** Accessible name of the navigation landmark. Defaults to `Pagination`. */
  "aria-label"?: string;
  ref?: Ref<HTMLElement>;
}

export type PaginationProps = PaginationOwnProps & Omit<ComponentPropsWithoutRef<"nav">, keyof PaginationOwnProps | "children">;

/**
 * Page navigation for a paged collection. It only tracks and reports the current page: it never owns, slices or fetches the data,
 * so the parent decides what each page shows. Invalid values are handled safely (the page is clamped, counts are rounded), and the
 * number of buttons stays small however many pages there are.
 */
export function Pagination({page, defaultPage, totalPages, onPageChange, siblingCount, boundaryCount, variant, disabled, className, ref, "aria-label": ariaLabel, ...rest}: PaginationProps) {
  const total = wholeNumber(totalPages, 0);
  const [requested, setPage] = useControllableState<number>({value: page, defaultValue: defaultPage ?? 1, onChange: onPageChange});
  if (total < 1) return null;
  const current = clampPage(requested, total);
  const compact = variant === "compact";
  const go = (next: number) => { if (!disabled && next >= 1 && next <= total && next !== current) setPage(next); };
  const items = compact ? [] : getPageItems({page: current, totalPages: total, siblingCount, boundaryCount});
  return (
    <nav {...rest} ref={ref} aria-label={ariaLabel ?? "Pagination"} className={className ? `vl-pagination ${className}` : "vl-pagination"} data-variant={compact ? "compact" : "default"}>
      <ul className="vl-pagination__list">
        <li>
          <button type="button" className="vl-pagination__control" aria-label="Previous page" disabled={disabled || current <= 1} onClick={() => go(current - 1)}>
            <span className="vl-pagination__arrow" data-direction="previous" aria-hidden="true" />
          </button>
        </li>
        {compact && <li className="vl-pagination__status">Page {current} of {total}</li>}
        {items.map((item, index) => typeof item === "number" ? (
          <li key={item}>
            <button type="button" className="vl-pagination__control vl-pagination__page" aria-label={`Page ${item}`} aria-current={item === current ? "page" : undefined} disabled={disabled} onClick={() => go(item)}>
              {item}
            </button>
          </li>
        ) : (
          <li key={`${item}-${index}`} className="vl-pagination__ellipsis" aria-hidden="true">…</li>
        ))}
        <li>
          <button type="button" className="vl-pagination__control" aria-label="Next page" disabled={disabled || current >= total} onClick={() => go(current + 1)}>
            <span className="vl-pagination__arrow" data-direction="next" aria-hidden="true" />
          </button>
        </li>
      </ul>
    </nav>
  );
}

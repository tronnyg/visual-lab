import type {ComponentPropsWithoutRef, Ref} from "react";
import {isSafeHref} from "../../shared/links";

export interface BreadcrumbItem {
  /** Text of the crumb. */
  label: string;
  /** Link address. Without one (or with an unsafe one such as `javascript:`) the crumb is plain text, not a link. */
  href?: string;
  /** Marks the crumb for the current page. Without any marked crumb the last one is current. */
  current?: boolean;
  /** Open the link in a new tab (adds `rel="noopener noreferrer"`). For links that leave the app. */
  external?: boolean;
}

interface BreadcrumbsOwnProps {
  /** The path from the top of the hierarchy to the current page, in order. */
  items: readonly BreadcrumbItem[];
  /** Decorative text between crumbs, hidden from assistive technology. Defaults to `/`. An empty string shows none. */
  separator?: string;
  /** Accessible name of the navigation landmark. Defaults to `Breadcrumb`. */
  "aria-label"?: string;
  ref?: Ref<HTMLElement>;
}

export type BreadcrumbsProps = BreadcrumbsOwnProps & Omit<ComponentPropsWithoutRef<"nav">, keyof BreadcrumbsOwnProps | "children">;

/** The current crumb is the first one marked `current`, otherwise the last. */
function currentIndex(items: readonly BreadcrumbItem[]): number {
  const marked = items.findIndex(item => item.current);
  return marked >= 0 ? marked : items.length - 1;
}

/**
 * A breadcrumb trail on plain `<a href>` links: a labelled `<nav>` holding an ordered list, with `aria-current="page"` on the current
 * crumb. It does no routing; the browser follows the links. Long labels wrap rather than truncate, so no text is lost.
 */
export function Breadcrumbs({items, separator, className, ref, "aria-label": ariaLabel, ...rest}: BreadcrumbsProps) {
  if (items.length === 0) return null;
  const current = currentIndex(items);
  const divider = separator ?? "/";
  return (
    <nav {...rest} ref={ref} aria-label={ariaLabel ?? "Breadcrumb"} className={className ? `vl-breadcrumbs ${className}` : "vl-breadcrumbs"}>
      <ol className="vl-breadcrumbs__list">
        {items.map((item, index) => {
          const isCurrent = index === current;
          const href = item.href && isSafeHref(item.href) ? item.href : undefined;
          return (
            <li key={index} className="vl-breadcrumbs__item">
              {href ? (
                <a className="vl-breadcrumbs__link" href={href} aria-current={isCurrent ? "page" : undefined} {...(item.external ? {target: "_blank", rel: "noopener noreferrer"} : {})}>{item.label}</a>
              ) : (
                <span className="vl-breadcrumbs__text" aria-current={isCurrent ? "page" : undefined}>{item.label}</span>
              )}
              {index < items.length - 1 && divider && <span className="vl-breadcrumbs__separator" aria-hidden="true">{divider}</span>}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}

import type {ComponentPropsWithoutRef, Ref} from "react";
import {isSafeHref} from "../../shared/links";

export const navigationOrientations = ["horizontal", "vertical"] as const;
export type NavigationOrientation = (typeof navigationOrientations)[number];

export interface NavigationItem {
  /** Unique within the menu. Matched against `activeId`. */
  id: string;
  /** Text of the destination. */
  label: string;
  /** Link address. Without one (or with an unsafe one such as `javascript:`) the item is plain text, not a link. */
  href?: string;
  /** The item cannot be followed: it is shown dimmed as plain text and is not focusable. */
  disabled?: boolean;
  /** Open the link in a new tab (adds `rel="noopener noreferrer"`). For links that leave the app. */
  external?: boolean;
}

interface NavigationMenuOwnProps {
  /** The destinations, in order. Submenus are not supported in v1: the list is flat. */
  items: readonly NavigationItem[];
  /** The id of the destination for the current page. It gets `aria-current="page"` and the active style. */
  activeId?: string;
  /** `horizontal` lays the destinations in a wrapping row; `vertical` stacks them. Defaults to `horizontal`. */
  orientation?: NavigationOrientation;
  /** Accessible name of the navigation landmark. Give each menu on a page a different one. Defaults to `Navigation`. */
  "aria-label"?: string;
  ref?: Ref<HTMLElement>;
}

export type NavigationMenuProps = NavigationMenuOwnProps & Omit<ComponentPropsWithoutRef<"nav">, keyof NavigationMenuOwnProps | "children">;

/**
 * A list of navigation links in a labelled `<nav>`. It uses ordinary website-navigation semantics (links in a list, `aria-current`),
 * not the ARIA `menu` roles, which are for application menus: Tab moves between links and Enter follows one. It does no routing; the
 * browser follows the links. Submenus and dropdowns are not part of v1 (they need the overlay and focus management planned with Dialog).
 */
export function NavigationMenu({items, activeId, orientation, className, ref, "aria-label": ariaLabel, ...rest}: NavigationMenuProps) {
  if (items.length === 0) return null;
  // Only the first match is current, so a duplicated id cannot mark two destinations.
  const activeIndex = activeId === undefined ? -1 : items.findIndex(item => item.id === activeId);
  return (
    <nav {...rest} ref={ref} aria-label={ariaLabel ?? "Navigation"} className={className ? `vl-navigation-menu ${className}` : "vl-navigation-menu"} data-orientation={orientation === "vertical" ? "vertical" : "horizontal"}>
      <ul className="vl-navigation-menu__list">
        {items.map((item, index) => {
          const current = index === activeIndex ? "page" : undefined;
          const href = !item.disabled && item.href && isSafeHref(item.href) ? item.href : undefined;
          return (
            <li key={`${item.id}-${index}`} className="vl-navigation-menu__item">
              {href ? (
                <a className="vl-navigation-menu__link" href={href} aria-current={current} {...(item.external ? {target: "_blank", rel: "noopener noreferrer"} : {})}>{item.label}</a>
              ) : (
                <span className="vl-navigation-menu__link" aria-current={current} aria-disabled={item.disabled ? true : undefined}>{item.label}</span>
              )}
            </li>
          );
        })}
      </ul>
    </nav>
  );
}

import type {ComponentPropsWithoutRef, ReactNode, Ref} from "react";

export const listVariants = ["unordered", "ordered"] as const;
export const listDensities = ["default", "compact"] as const;

export type ListVariant = (typeof listVariants)[number];
export type ListDensity = (typeof listDensities)[number];

export interface ListItem {
  content: ReactNode;
  /** A nested list shown under this item, in the same variant and density as its parent. */
  items?: readonly ListItem[];
}

interface ListOwnProps {
  items: readonly ListItem[];
  /** `ordered` renders an `ol` with numbers, `unordered` a `ul` with bullets. Defaults to `unordered`. */
  variant?: ListVariant;
  /** First number of an ordered list. Ignored by unordered lists. Defaults to 1. */
  start?: number;
  /** Space between items. Defaults to `default`. */
  density?: ListDensity;
  ref?: Ref<HTMLOListElement | HTMLUListElement>;
}

export type ListProps = ListOwnProps & Omit<ComponentPropsWithoutRef<"ul">, keyof ListOwnProps | "children">;

/** A semantic list on native `ul`/`ol` and `li` elements, so assistive technology announces the item count and position.
 *  An empty `items` array renders nothing. */
export function List({items, variant = "unordered", start, density = "default", className, ref, ...rest}: ListProps) {
  if (!items.length) return null;
  const ordered = variant === "ordered";
  const Tag = ordered ? "ol" : "ul";
  const startAt = ordered && Number.isInteger(start) ? start : undefined;
  return (
    <Tag
      {...rest}
      ref={ref as Ref<never>}
      className={className ? `vl-list ${className}` : "vl-list"}
      data-variant={variant}
      data-density={density}
      start={startAt}
    >
      {items.map((item, i) => (
        <li key={i}>
          {item.content}
          {item.items?.length ? <List items={item.items} variant={variant} density={density} /> : null}
        </li>
      ))}
    </Tag>
  );
}

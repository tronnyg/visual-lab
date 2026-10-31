import type {ComponentPropsWithoutRef, ReactNode, Ref} from "react";

export const keyValueLayouts = ["inline", "stacked"] as const;

export type KeyValueLayout = (typeof keyValueLayouts)[number];

export interface KeyValueItem {
  label: string;
  /** Any content. `null`, `undefined`, `false` and an empty string show a dash. */
  value: ReactNode;
}

interface KeyValueOwnProps {
  items: readonly KeyValueItem[];
  /** `inline` puts each label beside its value, `stacked` puts it above. Inline pairs stack automatically in a narrow container. Defaults to `inline`. */
  layout?: KeyValueLayout;
  /** Draw a line between pairs. */
  dividers?: boolean;
  /** Shown in place of the pairs when `items` is empty. Defaults to "No details". */
  emptyMessage?: string;
  ref?: Ref<HTMLDivElement>;
}

export type KeyValueProps = KeyValueOwnProps & Omit<ComponentPropsWithoutRef<"div">, keyof KeyValueOwnProps | "children">;

const isBlank = (value: ReactNode) => value == null || value === false || value === "";

/** Label/value pairs for facts and metadata, on a native description list (`dl`, `dt`, `dd`). Read-only. */
export function KeyValue({items, layout = "inline", dividers = false, emptyMessage = "No details", className, ...rest}: KeyValueProps) {
  return (
    <div
      {...rest}
      className={className ? `vl-keyvalue ${className}` : "vl-keyvalue"}
      data-layout={layout}
      data-dividers={dividers || undefined}
    >
      {items.length ? (
        <dl className="vl-keyvalue__list">
          {items.map((item, i) => (
            <div key={i} className="vl-keyvalue__pair">
              <dt className="vl-keyvalue__label">{item.label}</dt>
              <dd className="vl-keyvalue__value">
                {isBlank(item.value)
                  ? <><span aria-hidden="true">—</span><span className="vl-keyvalue__sr">No value</span></>
                  : item.value}
              </dd>
            </div>
          ))}
        </dl>
      ) : <p className="vl-keyvalue__empty">{emptyMessage}</p>}
    </div>
  );
}

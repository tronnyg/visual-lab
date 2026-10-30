import type {ComponentPropsWithoutRef, Ref} from "react";

export const gridColumns = [1, 2, 3, 4] as const;
// Spacing steps map to the --ui-space-* tokens, the same scale Stack and Card use.
export const gridSpacings = ["none", "xs", "sm", "md", "lg"] as const;
export const gridAligns = ["start", "center", "end", "stretch"] as const;
export const gridJustifies = ["start", "center", "end", "stretch"] as const;
// Narrowest a column may get before the grid drops to fewer columns.
export const gridMinColumnWidths = ["none", "sm", "md", "lg"] as const;
export const gridWidths = ["auto", "full", "sm", "md", "lg"] as const;

export type GridColumns = (typeof gridColumns)[number];
export type GridSpacing = (typeof gridSpacings)[number];
export type GridAlign = (typeof gridAligns)[number];
export type GridJustify = (typeof gridJustifies)[number];
export type GridMinColumnWidth = (typeof gridMinColumnWidths)[number];
export type GridWidth = (typeof gridWidths)[number];

interface GridOwnProps {
  /** Most columns the grid will use: 1, 2, 3 or 4. Fewer are used when the container is too narrow. Defaults to `2`. */
  columns?: GridColumns;
  /** Space between rows and columns. Defaults to `md`. */
  gap?: GridSpacing;
  /** Space between rows. Overrides `gap` for rows. */
  rowGap?: GridSpacing;
  /** Space between columns. Overrides `gap` for columns. */
  columnGap?: GridSpacing;
  /** Vertical alignment of each item within its row. Defaults to `stretch`. */
  align?: GridAlign;
  /** Horizontal alignment of each item within its column. Defaults to `stretch`. */
  justify?: GridJustify;
  /** Narrowest a column may get before the grid uses fewer columns: `none` always keeps `columns`, `sm`, `md` and `lg` collapse in narrow containers. Defaults to `sm`. */
  minColumnWidth?: GridMinColumnWidth;
  /** `auto` sizes to the parent's layout, `full` fills the parent's width, `sm`/`md`/`lg` fill it up to a maximum width. Defaults to `auto`. */
  width?: GridWidth;
  ref?: Ref<HTMLDivElement>;
}

export type GridProps = GridOwnProps & Omit<ComponentPropsWithoutRef<"div">, keyof GridOwnProps>;

/** Layout only: places its children in columns and rows with CSS Grid and draws nothing itself. */
export function Grid({columns, gap, rowGap, columnGap, align, justify, minColumnWidth, width, className, children, ...rest}: GridProps) {
  return (
    <div
      {...rest}
      className={className ? `vl-grid ${className}` : "vl-grid"}
      data-columns={columns ?? 2}
      data-gap={gap ?? "md"}
      data-row-gap={rowGap}
      data-column-gap={columnGap}
      data-align={align}
      data-justify={justify}
      data-min={minColumnWidth ?? "sm"}
      data-width={width}
    >
      {children}
    </div>
  );
}

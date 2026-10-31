import {useId, type ComponentPropsWithoutRef, type Ref} from "react";

export const tableAligns = ["start", "center", "end"] as const;
export const tableDensities = ["default", "compact"] as const;

export type TableAlign = (typeof tableAligns)[number];
export type TableDensity = (typeof tableDensities)[number];
export type TableCell = string | number | null;
export type TableRow = Record<string, TableCell>;

export interface TableColumn {
  /** Key of the row value shown in this column. */
  key: string;
  /** Column header text. */
  header: string;
  /** Text alignment of the header and its cells. Defaults to `start`; use `end` for numbers. */
  align?: TableAlign;
}

interface TableOwnProps {
  columns: readonly TableColumn[];
  /** One object per row, keyed by column `key`. A missing or `null` value renders as an empty cell. */
  rows: readonly TableRow[];
  /** Visible title for the table. It also names the scrollable region. */
  caption?: string;
  /** Row padding. Defaults to `default`. */
  density?: TableDensity;
  /** Shade every second row. */
  striped?: boolean;
  /** Shown in place of the rows when `rows` is empty. Defaults to "No data". */
  emptyMessage?: string;
  ref?: Ref<HTMLDivElement>;
}

export type TableProps = TableOwnProps & Omit<ComponentPropsWithoutRef<"div">, keyof TableOwnProps | "children">;

/** A read-only table of structured data on native table elements. It does not sort, filter, page or select.
 *  The wide table scrolls sideways inside its own focusable region, so it never widens the page. */
export function Table({columns, rows, caption, density = "default", striped = false, emptyMessage = "No data", className, ...rest}: TableProps) {
  const captionId = useId();
  const title = caption?.trim();
  return (
    <div
      {...rest}
      className={className ? `vl-table ${className}` : "vl-table"}
      data-density={density}
      data-striped={striped || undefined}
      role="region"
      tabIndex={0}
      {...(title ? {"aria-labelledby": captionId} : {"aria-label": "Table"})}
    >
      <table className="vl-table__table">
        {title ? <caption id={captionId} className="vl-table__caption">{title}</caption> : null}
        {columns.length ? (
          <thead>
            <tr>
              {columns.map((column, i) => <th key={i} scope="col" data-align={column.align ?? "start"}>{column.header}</th>)}
            </tr>
          </thead>
        ) : null}
        <tbody>
          {rows.length ? rows.map((row, r) => (
            <tr key={r}>
              {columns.map((column, c) => {
                const value = row[column.key];
                return (
                  <td key={c} data-align={column.align ?? "start"}>
                    {value == null || value === ""
                      ? <><span aria-hidden="true">—</span><span className="vl-table__sr">No value</span></>
                      : String(value)}
                  </td>
                );
              })}
            </tr>
          )) : (
            <tr>
              <td className="vl-table__empty" colSpan={Math.max(columns.length, 1)}>{emptyMessage}</td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}

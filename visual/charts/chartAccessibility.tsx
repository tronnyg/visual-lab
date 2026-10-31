import {NO_VALUE} from "./chartFormatting";

export interface ChartTableProps {
  caption: string;
  /** Column headings. The first column is the row header. */
  columns: readonly string[];
  /** Cell text. `null` means the source had no value, and is announced as "No value" rather than 0. */
  rows: readonly (readonly (string | null)[])[];
}

/** The chart's data on native table elements, visually hidden but present in the accessibility tree.
 *  Never hide it with display:none, visibility:hidden or aria-hidden. */
export function ChartDataTable({caption, columns, rows}: ChartTableProps) {
  return (
    // The wrapper does the hiding and clips the table, so a wide table cannot widen the chart or create a scrollbar.
    <div className="vl-chart__sr">
    <table>
      <caption>{caption}</caption>
      <thead>
        <tr>{columns.map((column, c) => <th key={c} scope="col">{column}</th>)}</tr>
      </thead>
      <tbody>
        {rows.map((row, r) => (
          <tr key={r}>
            {row.map((cell, c) => c === 0
              ? <th key={c} scope="row">{cell ?? NO_VALUE}</th>
              : <td key={c}>{cell ?? NO_VALUE}</td>)}
          </tr>
        ))}
      </tbody>
    </table>
    </div>
  );
}

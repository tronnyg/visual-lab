import type {CSSProperties} from "react";
import type {LegendShape} from "./ChartFrame";

export interface TooltipRow {
  label: string;
  value: string;
  color: string;
  shape?: LegendShape;
}

export interface ChartTooltipContentProps {
  title?: string;
  rows: readonly TooltipRow[];
}

/** The tooltip body. Recharts positions it and announces it; this only draws the content. */
export function ChartTooltipContent({title, rows}: ChartTooltipContentProps) {
  return (
    <div className="vl-chart-tooltip">
      {title ? <div className="vl-chart-tooltip__title">{title}</div> : null}
      {rows.map((row, i) => (
        <div key={i} className="vl-chart-tooltip__row">
          <span className="vl-chart__swatch" data-shape={row.shape ?? "square"} style={{"--vl-swatch": row.color} as CSSProperties} />
          <span className="vl-chart-tooltip__label">{row.label}</span>
          <span className="vl-chart-tooltip__value">{row.value}</span>
        </div>
      ))}
    </div>
  );
}

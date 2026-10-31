import {useId, useMemo, type ComponentPropsWithoutRef, type Ref} from "react";
import {Area, AreaChart, Bar, BarChart, CartesianGrid, Line, LineChart, ReferenceLine, Scatter, ScatterChart, Tooltip, XAxis, YAxis, type TooltipContentProps} from "recharts";
import {chartColor} from "../../charts/chartColors";
import {createValueFormatter, formatAxisNumber, NO_VALUE, truncateLabel, type ValueFormat} from "../../charts/chartFormatting";
import {ChartFrame, legendShapes, type LegendItem} from "../../charts/ChartFrame";
import {ChartTooltipContent, type TooltipRow} from "../../charts/ChartTooltip";
import {buildChartModel, chartTypes, type ChartModel, type ChartRow, type ChartSeries, type ChartType, type ChartValue} from "./chartModel";

export {chartTypes};
export type {ChartRow, ChartSeries, ChartType, ChartValue, ValueFormat};
export {valueFormatStyles} from "../../charts/chartFormatting";

const DEFAULT_HEIGHT = 300;
const AXIS_LABEL_MAX = 16;
const MARGIN = {top: 8, right: 16, bottom: 4, left: 4};
const typeNames: Record<ChartType, string> = {bar: "Bar", line: "Line", area: "Area", scatter: "Scatter"};

interface ChartOwnProps {
  /** `bar` compares categories, `line` shows a trend, `area` emphasizes magnitude along an ordered axis, `scatter` shows the relationship between two numeric variables. */
  type: ChartType;
  /** One object per X position. Each series reads its numbers from a field of these objects; a `null` or missing value is a gap, never 0. */
  data: readonly ChartRow[];
  /** Field that holds the X values. Bar: always categories (numbers keep their labels). Line and Area: all text is a categorical axis, all numbers a numeric axis, a mix is invalid. Scatter: numbers only. */
  xKey: string;
  /** The numeric fields to plot. At least one. */
  series: readonly ChartSeries[];
  /** Visible title. It also names the chart for assistive technology; without it a name is generated from the series. */
  title?: string;
  /** Visible supporting text under the title. */
  description?: string;
  /** Height of the plot in pixels. Defaults to 300. The width always fills the container. */
  height?: number;
  xAxisLabel?: string;
  yAxisLabel?: string;
  /** Show the legend. Defaults to true when there is more than one series. */
  showLegend?: boolean;
  /** Show values on hover and keyboard focus. Defaults to true. */
  showTooltip?: boolean;
  /** Show the grid lines. Defaults to true. */
  showGrid?: boolean;
  /** Line and Area only: mark every data point. A point with no neighbours is always marked, so a single value stays visible. */
  showPoints?: boolean;
  /** Bar only: draw horizontal bars with the categories on the vertical axis. */
  horizontal?: boolean;
  /** How values are displayed in ticks, tooltips and the data table. It never changes the plotted values. */
  valueFormat?: ValueFormat;
  ref?: Ref<HTMLElement>;
}

export type ChartProps = ChartOwnProps & Omit<ComponentPropsWithoutRef<"figure">, keyof ChartOwnProps | "children">;

function joinLabels(labels: string[]) {
  return labels.length > 1 ? `${labels.slice(0, -1).join(", ")} and ${labels[labels.length - 1]}` : labels[0] ?? "data";
}

function chartName(props: Pick<ChartOwnProps, "type" | "series" | "xKey" | "xAxisLabel" | "title">) {
  const title = props.title?.trim();
  if (title) return title;
  const labels = Array.isArray(props.series) ? props.series.map(s => s?.label?.trim() || s?.dataKey).filter(Boolean) : [];
  return `${typeNames[props.type] ?? "Chart"} chart of ${joinLabels(labels)} ${props.type === "scatter" ? "against" : "by"} ${props.xAxisLabel?.trim() || props.xKey}`;
}

/** Cartesian charts (bar, line, area, scatter) on Recharts, with a hidden data table for assistive technology.
 *  The component validates its data and shows an empty or invalid-data message instead of a misleading drawing. */
export function Chart({
  type, data, xKey, series, title, description, height, xAxisLabel, yAxisLabel,
  showLegend, showTooltip = true, showGrid = true, showPoints = false, horizontal = false, valueFormat, ...rest
}: ChartProps) {
  const model = useMemo(() => buildChartModel({type, data, xKey, series}), [type, data, xKey, series]);
  const format = useMemo(() => createValueFormatter(valueFormat), [valueFormat]);
  const name = chartName({type, series, xKey, xAxisLabel, title});
  const plotHeight = typeof height === "number" && Number.isFinite(height) && height > 0 ? height : DEFAULT_HEIGHT;
  const xTitle = xAxisLabel?.trim() || xKey;
  const legend: LegendItem[] = model.series.map((s, i) => ({label: s.label, color: chartColor(i), shape: type === "scatter" ? legendShapes[i % legendShapes.length] : type === "line" ? "line" : "square"}));
  const table = model.state ? undefined : {
    caption: `Data for ${name}`,
    columns: [xTitle, ...model.series.map(s => s.label)],
    rows: model.rows.map(row => [row.label, ...row.values.map(v => (v === null ? null : format(v)))]),
  };
  return (
    <ChartFrame
      {...rest}
      data-type={type}
      name={name}
      title={title}
      description={description}
      height={plotHeight}
      state={model.state}
      legend={(showLegend ?? model.series.length > 1) ? legend : undefined}
      table={table}
    >
      {model.state ? null : <CartesianPlot {...{type, model, name, xTitle, yAxisLabel, xAxisLabel, showTooltip, showGrid, showPoints, horizontal, format}} />}
    </ChartFrame>
  );
}

interface PlotProps {
  type: ChartType;
  model: ChartModel;
  name: string;
  xTitle: string;
  xAxisLabel?: string;
  yAxisLabel?: string;
  showTooltip: boolean;
  showGrid: boolean;
  showPoints: boolean;
  horizontal: boolean;
  format: (value: number) => string;
}

type Datum = Record<string, string | number | null>;

const isIsolated = (values: Datum[], key: string, i: number) =>
  values[i][key] != null && values[i - 1]?.[key] == null && values[i + 1]?.[key] == null;

function CartesianPlot({type, model, name, xTitle, xAxisLabel, yAxisLabel, showTooltip, showGrid, showPoints, horizontal, format}: PlotProps) {
  const gradientId = `vl-chart-fill-${useId().replace(/[^a-zA-Z0-9_-]/g, "")}`;
  const {series, xKind} = model;
  const isHorizontal = type === "bar" && horizontal;
  const hasNegative = model.rows.some(row => row.values.some(v => v !== null && v < 0));

  const data: Datum[] = model.plotRows.map(row => ({x: row.x, xLabel: row.label, ...Object.fromEntries(series.map((s, i) => [s.key, row.values[i]]))}));

  const common = {
    responsive: true,
    style: {width: "100%", height: "100%"},
    margin: MARGIN,
    "aria-label": name,
    "aria-roledescription": "interactive chart",
  } as const;

  const grid = showGrid ? <CartesianGrid stroke="var(--ui-border)" strokeOpacity={0.8} vertical={isHorizontal || type === "scatter" || xKind === "number"} horizontal={!isHorizontal} /> : null;
  const zero = hasNegative && type !== "scatter" ? <ReferenceLine {...(isHorizontal ? {x: 0} : {y: 0})} stroke="var(--ui-text-muted)" strokeOpacity={0.5} /> : null;

  // The value axis includes zero for bars and areas, whose lengths and fills encode magnitude.
  const valueDomain: [number | "auto" | ((min: number) => number), "auto"] = type === "bar" || type === "area" ? [(min: number) => Math.min(0, min), "auto"] : ["auto", "auto"];
  const categoryTick = {tickFormatter: (v: string | number) => truncateLabel(String(v), AXIS_LABEL_MAX)};
  const numberAxis = {type: "number" as const, domain: ["auto", "auto"] as ["auto", "auto"], tickFormatter: (v: number) => formatAxisNumber(v)};

  const xLabelProp = xAxisLabel?.trim() ? {value: xAxisLabel.trim(), position: "insideBottom" as const, offset: -2} : undefined;
  const yLabelProp = yAxisLabel?.trim() ? {value: yAxisLabel.trim(), angle: -90, position: "insideLeft" as const, style: {textAnchor: "middle" as const}} : undefined;
  const bottomAxisHeight = xLabelProp ? 44 : 28;

  const xAxis = isHorizontal ? (
    <XAxis type="number" domain={valueDomain} tickFormatter={format} niceTicks="snap125" tickLine={false} axisLine={false} tickMargin={6} height={bottomAxisHeight} label={xLabelProp ? {...xLabelProp, value: yAxisLabel?.trim() ?? ""} : undefined} />
  ) : xKind === "number" ? (
    <XAxis dataKey="x" {...numberAxis} tickLine={false} axisLine={{stroke: "var(--ui-border)"}} tickMargin={8} height={bottomAxisHeight} label={xLabelProp} />
  ) : (
    <XAxis dataKey="x" type="category" {...categoryTick} {...(type === "bar" ? {} : {padding: {left: 20, right: 20}})} tickLine={false} axisLine={{stroke: "var(--ui-border)"}} tickMargin={8} minTickGap={12} height={bottomAxisHeight} label={xLabelProp} />
  );
  const yAxis = isHorizontal ? (
    <YAxis dataKey="x" type="category" {...categoryTick} tickLine={false} axisLine={{stroke: "var(--ui-border)"}} tickMargin={6} width="auto" interval={0} label={xLabelProp ? {...yLabelProp, value: xAxisLabel?.trim() ?? ""} : undefined} />
  ) : type === "scatter" ? (
    <YAxis dataKey="y" type="number" domain={valueDomain} tickFormatter={format} niceTicks="snap125" tickLine={false} axisLine={false} tickMargin={6} width="auto" label={yLabelProp} />
  ) : (
    <YAxis type="number" domain={valueDomain} tickFormatter={format} niceTicks="snap125" tickLine={false} axisLine={false} tickMargin={6} width="auto" label={yLabelProp} />
  );

  const tooltip = showTooltip ? (
    <Tooltip
      isAnimationActive={false}
      cursor={type === "bar" ? {fill: "var(--ui-surface-muted)", opacity: 0.8} : type === "scatter" ? {stroke: "var(--ui-border)", strokeDasharray: "3 3"} : {stroke: "var(--ui-text-muted)", strokeOpacity: 0.5}}
      wrapperStyle={{zIndex: 10, outline: "none"}}
      content={(props: TooltipContentProps) => {
        const datum = props.payload?.[0]?.payload as Datum | undefined;
        if (!props.active || !datum) return null;
        if (type === "scatter") {
          const i = Number(datum.series);
          const rows: TooltipRow[] = [
            {label: xTitle, value: String(datum.xLabel), color: chartColor(i), shape: legendShapes[i % legendShapes.length]},
            {label: yAxisLabel?.trim() || "Value", value: format(datum.y as number), color: chartColor(i), shape: legendShapes[i % legendShapes.length]},
          ];
          return <ChartTooltipContent title={series[i]?.label} rows={rows} />;
        }
        const rows: TooltipRow[] = series.map((s, i) => {
          const v = datum[s.key];
          return {label: s.label, value: typeof v === "number" ? format(v) : NO_VALUE, color: chartColor(i), shape: type === "line" ? "line" : "square"};
        });
        return <ChartTooltipContent title={String(datum.xLabel)} rows={rows} />;
      }}
    />
  ) : null;

  if (type === "bar") {
    return (
      <BarChart {...common} data={data} layout={isHorizontal ? "vertical" : "horizontal"} barCategoryGap="22%" barGap={4}>
        {grid}{xAxis}{yAxis}{zero}{tooltip}
        {series.map((s, i) => (
          <Bar key={s.key} dataKey={s.key} name={s.label} fill={chartColor(i)} radius={isHorizontal ? [0, 3, 3, 0] : [3, 3, 0, 0]} maxBarSize={40} isAnimationActive={false} />
        ))}
      </BarChart>
    );
  }

  if (type === "scatter") {
    return (
      <ScatterChart {...common}>
        {grid}{xAxis}{yAxis}{tooltip}
        {series.map((s, i) => (
          <Scatter
            key={s.key}
            name={s.label}
            data={data.flatMap(d => (d[s.key] == null ? [] : [{x: d.x, xLabel: d.xLabel, y: d[s.key], series: i}]))}
            fill={chartColor(i)}
            fillOpacity={0.8}
            stroke="var(--ui-surface)"
            shape={legendShapes[i % legendShapes.length]}
            isAnimationActive={false}
          />
        ))}
      </ScatterChart>
    );
  }

  const dotFor = (s: (typeof series)[number], i: number) => showPoints
    ? {r: 3, strokeWidth: 2, stroke: chartColor(i), fill: "var(--ui-surface)"}
    : (props: {cx?: number; cy?: number; index?: number}) => (
        props.index != null && props.cx != null && props.cy != null && isIsolated(data, s.key, props.index)
          ? <circle cx={props.cx} cy={props.cy} r={3.5} fill={chartColor(i)} />
          : <g />
      );
  const activeDot = (i: number) => ({r: 5, strokeWidth: 2, stroke: "var(--ui-surface)", fill: chartColor(i)});

  if (type === "line") {
    return (
      <LineChart {...common} data={data}>
        {grid}{xAxis}{yAxis}{zero}{tooltip}
        {series.map((s, i) => (
          <Line key={s.key} dataKey={s.key} name={s.label} type="linear" stroke={chartColor(i)} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" connectNulls={false} dot={dotFor(s, i)} activeDot={activeDot(i)} isAnimationActive={false} />
        ))}
      </LineChart>
    );
  }

  return (
    <AreaChart {...common} data={data}>
      <defs>
        {series.map((s, i) => (
          <linearGradient key={s.key} id={`${gradientId}-${i}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={chartColor(i)} stopOpacity={0.3} />
            <stop offset="100%" stopColor={chartColor(i)} stopOpacity={0.05} />
          </linearGradient>
        ))}
      </defs>
      {grid}{xAxis}{yAxis}{zero}{tooltip}
      {series.map((s, i) => (
        <Area key={s.key} dataKey={s.key} name={s.label} type="linear" baseValue={0} stroke={chartColor(i)} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" fill={`url(#${gradientId}-${i})`} connectNulls={false} dot={dotFor(s, i)} activeDot={activeDot(i)} isAnimationActive={false} />
      ))}
    </AreaChart>
  );
}

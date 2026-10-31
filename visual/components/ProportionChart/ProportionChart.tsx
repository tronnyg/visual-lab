import {useMemo, type ComponentPropsWithoutRef, type Ref} from "react";
import {Pie, PieChart, Tooltip, type PieLabelRenderProps, type TooltipContentProps} from "recharts";
import {chartColor} from "../../charts/chartColors";
import {createValueFormatter, formatShare, type ValueFormat} from "../../charts/chartFormatting";
import {ChartFrame, type LegendItem} from "../../charts/ChartFrame";
import {ChartTooltipContent} from "../../charts/ChartTooltip";
import {buildProportionModel, proportionChartTypes, type ProportionChartType, type ProportionPart, type ProportionRow, type ProportionValue} from "./proportionModel";

export {proportionChartTypes};
export type {ProportionChartType, ProportionRow, ProportionValue, ValueFormat};
export {valueFormatStyles} from "../../charts/chartFormatting";

const DEFAULT_HEIGHT = 300;
/** Slices below this share get no on-chart label: it would collide with its neighbours. They stay in the legend, tooltip and table. */
const MIN_LABEL_SHARE = 0.04;

interface ProportionChartOwnProps {
  /** `pie` (default) or `donut`: the same data, drawn with a hole in the middle. */
  type?: ProportionChartType;
  /** One object per category. Each value is that category's amount, not a percentage. */
  data: readonly ProportionRow[];
  /** Field that holds the category names. */
  nameKey: string;
  /** Field that holds the values: finite and not negative. Shares are calculated from their total. */
  valueKey: string;
  /** Visible title. It also names the chart for assistive technology; without it a name is generated. */
  title?: string;
  /** Visible supporting text under the title. */
  description?: string;
  /** Height of the plot in pixels. Defaults to 300. The width always fills the container. */
  height?: number;
  /** Show the legend with each category's share. Defaults to true. */
  showLegend?: boolean;
  /** Show values on hover and keyboard focus. Defaults to true. */
  showTooltip?: boolean;
  /** Label each slice on the chart with its share. Defaults to false. */
  showLabels?: boolean;
  /** How raw values are displayed in the tooltip and data table. Shares are always shown as percentages. */
  valueFormat?: ValueFormat;
  ref?: Ref<HTMLElement>;
}

export type ProportionChartProps = ProportionChartOwnProps & Omit<ComponentPropsWithoutRef<"figure">, keyof ProportionChartOwnProps | "children">;

/** Part-to-whole charts (pie and donut) on Recharts, with a hidden data table for assistive technology.
 *  Zero-value categories have no slice but stay in the table; negative or non-numeric values make the chart invalid. */
export function ProportionChart({
  type = "pie", data, nameKey, valueKey, title, description, height,
  showLegend = true, showTooltip = true, showLabels = false, valueFormat, ...rest
}: ProportionChartProps) {
  const model = useMemo(() => buildProportionModel({data, nameKey, valueKey}), [data, nameKey, valueKey]);
  const format = useMemo(() => createValueFormatter(valueFormat), [valueFormat]);
  const name = title?.trim() || `${type === "donut" ? "Donut" : "Pie"} chart of ${valueKey} by ${nameKey}`;
  const plotHeight = typeof height === "number" && Number.isFinite(height) && height > 0 ? height : DEFAULT_HEIGHT;
  const legend: LegendItem[] = model.slices.map((slice, i) => ({label: slice.name, color: chartColor(i), shape: "square", detail: formatShare(slice.share)}));
  const table = model.state ? undefined : {
    caption: `Data for ${name}`,
    columns: [nameKey, valueKey, "Share of total"],
    rows: model.parts.map(part => [part.name, format(part.value), formatShare(part.share)]),
  };
  const labelWithName = !showLegend;
  return (
    <ChartFrame
      {...rest}
      data-type={type}
      name={name}
      title={title}
      description={description}
      height={plotHeight}
      state={model.state}
      legend={showLegend ? legend : undefined}
      table={table}
    >
      {model.state ? null : (
        <PieChart responsive style={{width: "100%", height: "100%"}} margin={{top: 8, right: 8, bottom: 8, left: 8}} aria-label={name} aria-roledescription="interactive chart">
          <Pie
            data={model.slices.map((slice, i) => ({...slice, fill: chartColor(i), index: i}))}
            dataKey="value"
            nameKey="name"
            startAngle={90}
            endAngle={-270}
            innerRadius={type === "donut" ? "55%" : 0}
            outerRadius={showLabels ? "68%" : "84%"}
            paddingAngle={model.slices.length > 1 ? 2 : 0}
            stroke="var(--ui-surface)"
            strokeWidth={2}
            minAngle={0}
            isAnimationActive={false}
            label={showLabels ? (props: PieLabelRenderProps) => {
              const part = (props as unknown as {payload?: ProportionPart}).payload;
              // A label for a tiny slice would collide with its neighbours, so it is left out together with its leader line.
              if (!part || part.share < MIN_LABEL_SHARE) return <g />;
              const angle = (-(props.midAngle ?? 0) * Math.PI) / 180;
              const text = labelWithName ? `${part.name} ${formatShare(part.share)}` : formatShare(part.share);
              return (
                <g>
                  <line x1={props.cx + props.outerRadius * Math.cos(angle)} y1={props.cy + props.outerRadius * Math.sin(angle)} x2={props.x} y2={props.y} stroke="var(--ui-border)" />
                  <text x={props.x + (props.textAnchor === "end" ? -4 : 4)} y={props.y} textAnchor={props.textAnchor} dominantBaseline="central" className="recharts-text recharts-pie-label-text">{text}</text>
                </g>
              );
            } : false}
            labelLine={false}
          />
          {showTooltip ? (
            <Tooltip
              isAnimationActive={false}
              wrapperStyle={{zIndex: 10, outline: "none"}}
              content={(props: TooltipContentProps) => {
                const part = props.payload?.[0]?.payload as (ProportionPart & {index: number}) | undefined;
                if (!props.active || !part) return null;
                return (
                  <ChartTooltipContent
                    title={part.name}
                    rows={[
                      {label: "Value", value: format(part.value), color: chartColor(part.index), shape: "square"},
                      {label: "Share", value: formatShare(part.share), color: chartColor(part.index), shape: "square"},
                    ]}
                  />
                );
              }}
            />
          ) : null}
        </PieChart>
      )}
    </ChartFrame>
  );
}

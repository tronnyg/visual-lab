import {defineComponent} from "@openuidev/react-lang";
import {z} from "zod/v4";
import {Chart, chartTypes, valueFormatStyles, type ChartRow, type ChartSeries, type ValueFormat} from "./Chart";

// Positional order matters in OpenUI Lang: the four required arguments first (type, data, xKey, series), then the text and display options.
// Data is a plain array of records and series a plain array of {dataKey, label} objects, so the model writes data, not a tree of components.
// showTooltip and showGrid are not exposed: their defaults are right for a board, and fewer arguments keep the signature easy to write.
const seriesSchema = z.object({
  dataKey: z.string().describe("Row field holding this series' numbers, e.g. \"sales\""),
  label: z.string().optional().describe("Name shown in the legend and tooltip. Defaults to the dataKey"),
});

const valueFormatSchema = z.object({
  style: z.enum(valueFormatStyles).optional().describe("number (default), currency or percent. percent shows 0.25 as 25%"),
  currency: z.string().optional().describe("ISO currency code for the currency style, e.g. \"USD\". Default USD"),
  maximumFractionDigits: z.number().optional().describe("Most digits after the decimal point, 0 to 20"),
});

const chartProps = z.object({
  type: z.enum(chartTypes).describe("bar, line, area or scatter"),
  data: z.array(z.record(z.string(), z.union([z.string(), z.number(), z.null()]))).describe("One object per X position: {month: \"Jan\", sales: 120, expenses: 80}. Series values are numbers; null leaves a gap"),
  xKey: z.string().describe("Field holding the X values, e.g. \"month\". Text for categories, numbers for a numeric axis (required for scatter)"),
  series: z.array(seriesSchema).describe("The fields to plot: [{dataKey: \"sales\", label: \"Sales\"}]. At least one"),
  title: z.string().optional().describe("Visible title that also names the chart for assistive technology"),
  description: z.string().optional().describe("Short visible text under the title"),
  xAxisLabel: z.string().optional().describe("Title of the X axis, e.g. \"Month\""),
  yAxisLabel: z.string().optional().describe("Title of the Y axis, e.g. \"Revenue (USD)\""),
  valueFormat: valueFormatSchema.optional().describe("How numbers are displayed: {style: \"currency\", currency: \"USD\"} or {style: \"percent\"}. Display only: it never changes the plotted values"),
  showLegend: z.boolean().optional().describe("Show the legend. Default true when there is more than one series"),
  showPoints: z.boolean().optional().describe("line and area only: mark every data point. Default false"),
  horizontal: z.boolean().optional().describe("bar only: draw horizontal bars, useful for long category names. Default false"),
  height: z.number().optional().describe("Plot height in pixels. Default 300"),
});

export const chartDefinition = defineComponent({
  name: "Chart",
  description: "A bar, line, area or scatter chart of records: Chart(type, data, xKey, series, title, description, xAxisLabel, yAxisLabel, valueFormat, showLegend, showPoints, horizontal, height), e.g. Chart(\"line\", [{month: \"Jan\", sales: 120}, {month: \"Feb\", sales: 160}], \"month\", [{dataKey: \"sales\", label: \"Sales\"}], \"Monthly sales\"). Pick the type by the question: bar compares categories, line shows a trend over an ordered axis, area emphasizes magnitude over an ordered axis, scatter shows the relationship between two numeric variables (xKey must then be numeric). Series are not stacked. null Y values are gaps, never 0. Data that cannot be drawn faithfully (mixed text and numbers on a line's X axis, non-numeric values, repeated categories) shows an error message instead. Use Table when precise values matter more than the shape.",
  props: chartProps,
  component: ({props}) => {
    // Skipped optional arguments (null, or an unresolved expression) must not reach the component, where defaults only apply to undefined.
    const {type, data, xKey, series, valueFormat, ...rest} = Object.fromEntries(Object.entries(props).filter(([, v]) => v != null)) as Partial<typeof props>;
    const format: ValueFormat | undefined = valueFormat ? (Object.fromEntries(Object.entries(valueFormat).filter(([, v]) => v != null)) as ValueFormat) : undefined;
    const seriesList: ChartSeries[] = (series ?? []).map(s => ({dataKey: s.dataKey, ...(s.label != null ? {label: s.label} : {})}));
    return <Chart type={type ?? "bar"} data={(data ?? []) as ChartRow[]} xKey={xKey ?? ""} series={seriesList} valueFormat={format} {...rest} />;
  },
});

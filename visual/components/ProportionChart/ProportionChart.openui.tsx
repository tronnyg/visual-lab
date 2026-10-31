import {defineComponent} from "@openuidev/react-lang";
import {z} from "zod/v4";
import {ProportionChart, proportionChartTypes, valueFormatStyles, type ProportionRow, type ValueFormat} from "./ProportionChart";

// Positional order matters in OpenUI Lang: type, data, nameKey and valueKey first, then the text and display options.
// Data is a plain array of records, so the model writes data, not a tree of components. showTooltip is not exposed: the default is right for a board.
const valueFormatSchema = z.object({
  style: z.enum(valueFormatStyles).optional().describe("number (default), currency or percent. percent shows 0.25 as 25%"),
  currency: z.string().optional().describe("ISO currency code for the currency style, e.g. \"USD\". Default USD"),
  maximumFractionDigits: z.number().optional().describe("Most digits after the decimal point, 0 to 20"),
});

const proportionChartProps = z.object({
  type: z.enum(proportionChartTypes).describe("pie or donut (a pie with a hole). Both show the same data"),
  data: z.array(z.record(z.string(), z.union([z.string(), z.number(), z.null()]))).describe("One object per category: {category: \"Desktop\", value: 55}. Values are amounts, not percentages: shares are calculated from their total. They must not be negative"),
  nameKey: z.string().describe("Field holding the category names, e.g. \"category\""),
  valueKey: z.string().describe("Field holding the numeric values, e.g. \"value\""),
  title: z.string().optional().describe("Visible title that also names the chart for assistive technology"),
  description: z.string().optional().describe("Short visible text under the title"),
  valueFormat: valueFormatSchema.optional().describe("How raw values are displayed in the tooltip and table: {style: \"currency\", currency: \"USD\"}. Shares are always percentages. Display only"),
  showLegend: z.boolean().optional().describe("Show the legend with each category's share. Default true"),
  showLabels: z.boolean().optional().describe("Label each slice with its share. Default false"),
  height: z.number().optional().describe("Plot height in pixels. Default 300"),
});

export const proportionChartDefinition = defineComponent({
  name: "ProportionChart",
  description: "A pie or donut chart of parts of a whole: ProportionChart(type, data, nameKey, valueKey, title, description, valueFormat, showLegend, showLabels, height), e.g. ProportionChart(\"donut\", [{category: \"Desktop\", value: 55}, {category: \"Mobile\", value: 35}, {category: \"Tablet\", value: 10}], \"category\", \"value\", \"Traffic by device\"). Use it only when the categories are meaningful parts of one whole and there are few of them (about 2 to 6). Values are amounts, not percentages, and must not be negative; each share is calculated from the total. A zero value has no slice, and all-zero or negative data shows a message instead. For many categories or precise comparisons use Chart with type bar, and Table when exact values matter.",
  props: proportionChartProps,
  component: ({props}) => {
    // Skipped optional arguments (null, or an unresolved expression) must not reach the component, where defaults only apply to undefined.
    const {type, data, nameKey, valueKey, valueFormat, ...rest} = Object.fromEntries(Object.entries(props).filter(([, v]) => v != null)) as Partial<typeof props>;
    const format: ValueFormat | undefined = valueFormat ? (Object.fromEntries(Object.entries(valueFormat).filter(([, v]) => v != null)) as ValueFormat) : undefined;
    return <ProportionChart type={type} data={(data ?? []) as ProportionRow[]} nameKey={nameKey ?? ""} valueKey={valueKey ?? ""} valueFormat={format} {...rest} />;
  },
});

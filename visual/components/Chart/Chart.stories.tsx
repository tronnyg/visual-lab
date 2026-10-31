import type {Meta, StoryObj} from "@storybook/react-vite";
import {expect, fireEvent, userEvent, waitFor, within} from "storybook/test";
import {Chart, chartTypes, type ChartRow, type ChartSeries} from "./Chart";

const monthly: ChartRow[] = [
  {month: "Jan", sales: 120, expenses: 80},
  {month: "Feb", sales: 160, expenses: 95},
  {month: "Mar", sales: 140, expenses: 110},
  {month: "Apr", sales: 185, expenses: 120},
];
const both: ChartSeries[] = [{dataKey: "sales", label: "Sales"}, {dataKey: "expenses", label: "Expenses"}];
const salesOnly: ChartSeries[] = [{dataKey: "sales", label: "Sales"}];

const meta = {
  title: "Components/Chart",
  component: Chart,
  decorators: [Story => <div style={{width: 560, maxWidth: "100%"}}><Story /></div>],
  args: {type: "bar", data: monthly, xKey: "month", series: salesOnly, title: "Monthly sales"},
  argTypes: {
    type: {control: "select", options: chartTypes},
    title: {control: "text"},
    description: {control: "text"},
    xKey: {control: "text"},
    height: {control: "number"},
    xAxisLabel: {control: "text"},
    yAxisLabel: {control: "text"},
    showLegend: {control: "boolean"},
    showTooltip: {control: "boolean"},
    showGrid: {control: "boolean"},
    showPoints: {control: "boolean"},
    horizontal: {control: "boolean"},
    data: {control: "object"},
    series: {control: "object"},
    valueFormat: {control: "object"},
    ref: {control: false},
    className: {control: false},
    style: {control: false},
  },
} satisfies Meta<typeof Chart>;

export default meta;
type Story = StoryObj<typeof meta>;

// The drawn chart is an interactive SVG named like the figure; the data lives in a hidden but accessible table.
const plot = (canvas: ReturnType<typeof within>, name: string) => canvas.findByRole("application", {name});
const tableOf = (canvas: ReturnType<typeof within>, name: string) => canvas.getByRole("table", {name: `Data for ${name}`});
const cells = (row: HTMLElement) => [...(row as HTMLTableRowElement).cells].map(c => c.textContent);
// Axis tick labels appear one layout pass after the SVG itself.
const ticks = async (root: Element, axis: "xAxis" | "yAxis") => {
  const selector = `.recharts-cartesian-axis-tick-value[orientation="${axis === "xAxis" ? "bottom" : "left"}"]`;
  await waitFor(() => expect(root.querySelectorAll(selector).length).toBeGreaterThan(0));
  return [...root.querySelectorAll(selector)].map(t => t.textContent ?? "");
};
const matrix = (table: HTMLElement) => within(table).getAllByRole("row").map(r => cells(r));

export const BasicBar: Story = {
  play: async ({canvasElement}) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByRole("figure", {name: "Monthly sales"})).toBeVisible();
    const svg = await plot(canvas, "Monthly sales");
    await expect(svg.querySelectorAll(".recharts-bar-rectangle")).toHaveLength(4);
    await expect(canvas.getByText("Monthly sales")).toBeVisible();
    // One series: no legend.
    await expect(canvasElement.querySelector(".vl-chart__legend")).toBeNull();
  },
};

export const GroupedBar: Story = {
  args: {series: both, title: "Sales and expenses"},
  play: async ({canvasElement}) => {
    const canvas = within(canvasElement);
    const svg = await plot(canvas, "Sales and expenses");
    await expect(svg.querySelectorAll(".recharts-bar-rectangle")).toHaveLength(8);
    // More than one series shows the legend by default.
    const legend = canvasElement.querySelector(".vl-chart__legend")!;
    await expect(legend.textContent).toBe("SalesExpenses");
  },
};

export const HorizontalBar: Story = {
  args: {
    horizontal: true,
    title: "Tickets by team",
    data: [{team: "Support", tickets: 142}, {team: "Billing", tickets: 96}, {team: "Platform", tickets: 64}],
    xKey: "team",
    series: [{dataKey: "tickets", label: "Tickets"}],
  },
  play: async ({canvasElement}) => {
    const canvas = within(canvasElement);
    const svg = await plot(canvas, "Tickets by team");
    const bars = [...svg.querySelectorAll(".recharts-bar-rectangle path")].map(p => p.getBoundingClientRect());
    await expect(bars).toHaveLength(3);
    // Bars grow sideways: the largest value is the widest bar, and the bars are stacked top to bottom.
    await expect(bars[0].width).toBeGreaterThan(bars[1].width);
    await expect(bars[1].width).toBeGreaterThan(bars[2].width);
    await expect(bars[1].top).toBeGreaterThan(bars[0].top);
  },
};

export const LineChart: Story = {
  args: {type: "line", title: "Sales trend"},
  play: async ({canvasElement}) => {
    const svg = await plot(within(canvasElement), "Sales trend");
    await expect(svg.querySelectorAll(".recharts-line-curve")).toHaveLength(1);
    // Straight segments: the path has no curve commands.
    await expect(svg.querySelector(".recharts-line-curve")!.getAttribute("d")).not.toMatch(/[CQSAT]/);
  },
};

export const MultiSeriesLine: Story = {
  args: {type: "line", series: both, title: "Monthly performance", xAxisLabel: "Month", yAxisLabel: "Amount", showPoints: true},
  play: async ({canvasElement}) => {
    const canvas = within(canvasElement);
    const svg = await plot(canvas, "Monthly performance");
    await expect(svg.querySelectorAll(".recharts-line-curve")).toHaveLength(2);
    await expect(svg.querySelectorAll(".recharts-line-dot")).toHaveLength(8);
    await waitFor(() => expect(within(svg as unknown as HTMLElement).getByText("Month")).toBeInTheDocument());
    await expect(within(svg as unknown as HTMLElement).getByText("Amount")).toBeInTheDocument();
  },
};

export const AreaChart: Story = {
  args: {type: "area", series: both, title: "Area of sales and expenses"},
  play: async ({canvasElement}) => {
    const svg = await plot(within(canvasElement), "Area of sales and expenses");
    await expect(svg.querySelectorAll(".recharts-area-area")).toHaveLength(2);
    await expect(svg.querySelectorAll(".recharts-area-curve")).toHaveLength(2);
  },
};

const study: ChartRow[] = [
  {hours: 1, score: 52, retest: 48}, {hours: 2, score: 58, retest: 60}, {hours: 3.5, score: 67, retest: 61},
  {hours: 4, score: 64, retest: 70}, {hours: 6, score: 81, retest: 77}, {hours: 7.5, score: 88, retest: 86},
];

export const Scatter: Story = {
  args: {
    type: "scatter", data: study, xKey: "hours", title: "Study time and scores", xAxisLabel: "Hours studied", yAxisLabel: "Score",
    series: [{dataKey: "score", label: "First sitting"}, {dataKey: "retest", label: "Retest"}],
  },
  play: async ({canvasElement}) => {
    const canvas = within(canvasElement);
    const svg = await plot(canvas, "Study time and scores");
    // Points only: no connecting lines, and each series has its own marker shape as well as its own colour.
    await expect(svg.querySelectorAll(".recharts-scatter-symbol")).toHaveLength(12);
    await expect(svg.querySelector(".recharts-scatter-line")).toBeNull();
    await expect(canvasElement.querySelector(".vl-chart__legend")!.textContent).toBe("First sittingRetest");
    const shapes = [...canvasElement.querySelectorAll(".vl-chart__legend .vl-chart__swatch")].map(s => s.getAttribute("data-shape"));
    await expect(new Set(shapes).size).toBe(2);
  },
};

// X is a number, so the spacing between points is proportional to the difference in X, not equal per row.
export const NumericXAxisSpacing: Story = {
  args: {
    type: "line", title: "Uneven samples", showPoints: true, xKey: "t",
    data: [{t: 0, v: 10}, {t: 1, v: 14}, {t: 2, v: 12}, {t: 10, v: 20}],
    series: [{dataKey: "v", label: "Reading"}],
  },
  play: async ({canvasElement}) => {
    const svg = await plot(within(canvasElement), "Uneven samples");
    const xs = [...svg.querySelectorAll(".recharts-line-dot")].map(d => Number(d.getAttribute("cx")));
    await expect(xs).toHaveLength(4);
    const unit = xs[1] - xs[0];
    await expect(Math.abs((xs[2] - xs[1]) - unit)).toBeLessThan(1);
    await expect(Math.abs((xs[3] - xs[2]) - 8 * unit)).toBeLessThan(2);
  },
};

// The same four rows with text X values use equal spacing instead.
export const CategoricalXAxisSpacing: Story = {
  args: {
    type: "line", title: "Even samples", showPoints: true, xKey: "t",
    data: [{t: "a", v: 10}, {t: "b", v: 14}, {t: "c", v: 12}, {t: "d", v: 20}],
    series: [{dataKey: "v", label: "Reading"}],
  },
  play: async ({canvasElement}) => {
    const svg = await plot(within(canvasElement), "Even samples");
    const xs = [...svg.querySelectorAll(".recharts-line-dot")].map(d => Number(d.getAttribute("cx")));
    await expect(Math.abs((xs[3] - xs[2]) - (xs[1] - xs[0]))).toBeLessThan(1);
  },
};

const gaps: ChartRow[] = [{month: "Jan", sales: 120}, {month: "Feb", sales: null}, {month: "Mar", sales: 140}, {month: "Apr", sales: 185}];

// A null is a gap in the line and "No value" in the table; it is never drawn or read out as 0.
export const MissingYValues: Story = {
  args: {type: "line", data: gaps, title: "Sales with a gap"},
  play: async ({canvasElement}) => {
    const canvas = within(canvasElement);
    const svg = await plot(canvas, "Sales with a gap");
    await expect(svg.querySelector(".recharts-line-curve")!.getAttribute("d")!.match(/M/g)).toHaveLength(2);
    const rows = matrix(tableOf(canvas, "Sales with a gap"));
    await expect(rows[2]).toEqual(["Feb", "No value"]);
  },
};

export const MissingYValuesArea: Story = {
  args: {type: "area", data: gaps, title: "Area with a gap"},
  play: async ({canvasElement}) => {
    const svg = await plot(within(canvasElement), "Area with a gap");
    await expect(svg.querySelector(".recharts-area-curve")!.getAttribute("d")!.match(/M/g)).toHaveLength(2);
  },
};

const swings: ChartRow[] = [{q: "Q1", profit: 40}, {q: "Q2", profit: -25}, {q: "Q3", profit: 15}, {q: "Q4", profit: -60}];

// The value axis reaches below zero, and bars below the baseline point down.
export const NegativeValues: Story = {
  args: {data: swings, xKey: "q", series: [{dataKey: "profit", label: "Profit"}], title: "Profit by quarter"},
  play: async ({canvasElement}) => {
    const canvas = within(canvasElement);
    const svg = await plot(canvas, "Profit by quarter");
    await expect((await ticks(svg, "yAxis")).some(t => t.startsWith("-"))).toBe(true);
    const zeroY = svg.querySelector(".recharts-reference-line line")!.getBoundingClientRect().top;
    const bars = [...svg.querySelectorAll(".recharts-bar-rectangle path")].map(p => p.getBoundingClientRect());
    await expect(bars[0].bottom).toBeLessThanOrEqual(zeroY + 1);
    await expect(bars[1].top).toBeGreaterThanOrEqual(zeroY - 1);
    await expect(matrix(tableOf(canvas, "Profit by quarter"))[2]).toEqual(["Q2", "-25"]);
  },
};

export const NegativeValuesArea: Story = {
  args: {type: "area", data: swings, xKey: "q", series: [{dataKey: "profit", label: "Profit"}], title: "Profit area"},
  play: async ({canvasElement}) => {
    const svg = await plot(within(canvasElement), "Profit area");
    const zeroY = svg.querySelector(".recharts-reference-line line")!.getBoundingClientRect().top;
    const fill = svg.querySelector(".recharts-area-area")!.getBoundingClientRect();
    // The fill reaches both above and below the zero line, because the baseline is zero.
    await expect(fill.top).toBeLessThan(zeroY);
    await expect(fill.bottom).toBeGreaterThan(zeroY);
  },
};

export const EmptyData: Story = {
  args: {data: [], title: "Sales"},
  play: async ({canvasElement}) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByRole("status")).toHaveTextContent("No data to display.");
    await expect(canvas.getByRole("figure", {name: "Sales"})).toBeVisible();
    await expect(canvasElement.querySelector("svg")).toBeNull();
    await expect(canvas.queryByRole("table")).toBeNull();
  },
};

export const AllValuesMissing: Story = {
  args: {data: [{month: "Jan", sales: null}, {month: "Feb", sales: null}], title: "Sales"},
  play: async ({canvasElement}) => {
    await expect(within(canvasElement).getByRole("status")).toHaveTextContent("There are no values to plot.");
  },
};

export const EmptySeries: Story = {
  args: {series: [], title: "Sales"},
  play: async ({canvasElement}) => {
    await expect(within(canvasElement).getByRole("alert")).toHaveTextContent("Add at least one series to plot.");
  },
};

// Anything that would change the meaning of the chart is reported, never repaired.
export const InvalidMixedXAxis: Story = {
  args: {type: "line", title: "Mixed", data: [{x: "a", v: 1}, {x: 2, v: 3}], xKey: "x", series: [{dataKey: "v"}]},
  play: async ({canvasElement}) => {
    const alert = within(canvasElement).getByRole("alert");
    await expect(alert).toHaveTextContent("can’t be drawn");
    await expect(alert).toHaveTextContent("mix text and numbers");
    await expect(canvasElement.querySelector("svg")).toBeNull();
  },
};

export const InvalidScatterX: Story = {
  args: {type: "scatter", title: "Scatter", data: [{x: "a", y: 1}, {x: 2, y: 3}], xKey: "x", series: [{dataKey: "y"}]},
  play: async ({canvasElement}) => {
    await expect(within(canvasElement).getByRole("alert")).toHaveTextContent("Scatter needs a number for every X value");
  },
};

export const InvalidValues: Story = {
  args: {
    title: "Bad values",
    data: [{m: "Jan", v: "12"}, {m: "Feb", v: Number.NaN}, {m: "Mar", v: Infinity}],
    xKey: "m",
    series: [{dataKey: "v"}],
  },
  play: async ({canvasElement}) => {
    const alert = within(canvasElement).getByRole("alert");
    await expect(alert).toHaveTextContent("“12” is not a finite number");
    await expect(alert).toHaveTextContent("NaN is not a finite number");
  },
};

export const InvalidMissingFields: Story = {
  args: {title: "Typos", data: monthly, xKey: "mnth", series: [{dataKey: "sale"}]},
  play: async ({canvasElement}) => {
    await expect(within(canvasElement).getByRole("alert")).toHaveTextContent("Row 1 has no “mnth” value");
  },
};

export const InvalidDuplicateCategories: Story = {
  args: {title: "Repeats", data: [{m: "Jan", v: 1}, {m: "Jan", v: 2}], xKey: "m", series: [{dataKey: "v"}]},
  play: async ({canvasElement}) => {
    await expect(within(canvasElement).getByRole("alert")).toHaveTextContent("“Jan” appears more than once");
  },
};

export const SeriesMissingFromEveryRow: Story = {
  args: {title: "Typos", data: monthly, xKey: "month", series: [{dataKey: "sales"}, {dataKey: "salez"}]},
  play: async ({canvasElement}) => {
    await expect(within(canvasElement).getByRole("alert")).toHaveTextContent("“salez” does not appear in any row");
  },
};

// Numeric identifiers on a bar chart stay categories: 2020 is a label, not a position.
export const BarNumericLabels: Story = {
  args: {title: "Sales by year", data: [{year: 2020, v: 5}, {year: 2021, v: 9}, {year: 2022, v: 7}], xKey: "year", series: [{dataKey: "v", label: "Sales"}]},
  play: async ({canvasElement}) => {
    const canvas = within(canvasElement);
    const svg = await plot(canvas, "Sales by year");
    await expect(await ticks(svg, "xAxis")).toEqual(["2020", "2021", "2022"]);
    await expect(matrix(tableOf(canvas, "Sales by year")).map(r => r[0])).toEqual(["year", "2020", "2021", "2022"]);
  },
};

export const DuplicateXInScatter: Story = {
  args: {type: "scatter", title: "Repeated X", data: [{x: 1, y: 2}, {x: 1, y: 5}, {x: 3, y: 4}], xKey: "x", series: [{dataKey: "y", label: "Y"}]},
  play: async ({canvasElement}) => {
    const svg = await plot(within(canvasElement), "Repeated X");
    await expect(svg.querySelectorAll(".recharts-scatter-symbol")).toHaveLength(3);
  },
};

export const SinglePoint: Story = {
  args: {type: "line", title: "One reading", data: [{m: "Jan", v: 42}], xKey: "m", series: [{dataKey: "v", label: "Reading"}]},
  play: async ({canvasElement}) => {
    const svg = await plot(within(canvasElement), "One reading");
    // A line of one point has no segment, so the point itself is drawn.
    await expect(svg.querySelectorAll("circle")).not.toHaveLength(0);
  },
};

const longLabels: ChartRow[] = [
  {team: "Customer onboarding and activation", value: 12},
  {team: "Platform reliability engineering", value: 18},
  {team: "Revenue operations and billing", value: 9},
  {team: "Unbroken_identifier_with_no_spaces_at_all", value: 15},
];

export const LongLabels: Story = {
  args: {title: "Long category names", data: longLabels, xKey: "team", series: [{dataKey: "value", label: "Items"}]},
  play: async ({canvasElement}) => {
    const canvas = within(canvasElement);
    await plot(canvas, "Long category names");
    await expect((await ticks(canvasElement, "xAxis")).every(t => t.length <= 16)).toBe(true);
    // The full names are never lost: they are in the table.
    await expect(canvas.getByRole("rowheader", {name: "Unbroken_identifier_with_no_spaces_at_all"})).toBeInTheDocument();
    await expect(canvasElement.scrollWidth).toBeLessThanOrEqual(canvasElement.clientWidth);
  },
};

export const LongLabelsHorizontal: Story = {
  args: {...LongLabels.args, horizontal: true, title: "Long names, horizontal"},
  play: async ({canvasElement}) => {
    const svg = await plot(within(canvasElement), "Long names, horizontal");
    await expect(svg.querySelectorAll(".recharts-bar-rectangle")).toHaveLength(4);
    await expect(svg.getBoundingClientRect().width).toBeLessThanOrEqual(560);
  },
};

// A narrow container: the chart shrinks to fit, nothing scrolls sideways, and the legend wraps.
export const NarrowContainer: Story = {
  decorators: [Story => <div style={{width: 240}}><Story /></div>],
  args: {series: both, type: "line", title: "Sales and expenses in a narrow space", xAxisLabel: "Month", yAxisLabel: "Amount", height: 240},
  play: async ({canvasElement}) => {
    const svg = await plot(within(canvasElement), "Sales and expenses in a narrow space");
    await expect(svg.getBoundingClientRect().width).toBeLessThanOrEqual(240);
    await expect(document.documentElement.scrollWidth).toBeLessThanOrEqual(document.documentElement.clientWidth);
    await expect(canvasElement.querySelector(".vl-chart")!.scrollWidth).toBeLessThanOrEqual(240);
  },
};

const revenue: ChartRow[] = [{month: "Jan", revenue: 1200.5}, {month: "Feb", revenue: 1850}, {month: "Mar", revenue: 920.25}];

export const CurrencyFormat: Story = {
  args: {title: "Revenue", data: revenue, series: [{dataKey: "revenue", label: "Revenue"}], valueFormat: {style: "currency", currency: "USD"}},
  play: async ({canvasElement}) => {
    const canvas = within(canvasElement);
    const svg = await plot(canvas, "Revenue");
    await expect(matrix(tableOf(canvas, "Revenue")).slice(1)).toEqual([["Jan", "$1,200.50"], ["Feb", "$1,850.00"], ["Mar", "$920.25"]]);
    await expect((await ticks(svg, "yAxis")).every(t => t.startsWith("$"))).toBe(true);
  },
};

// 0.25 is shown as 25%; the plotted value stays 0.25.
export const PercentFormat: Story = {
  args: {
    title: "Completion", type: "area", xKey: "week", series: [{dataKey: "done", label: "Done"}],
    data: [{week: "W1", done: 0.1}, {week: "W2", done: 0.25}, {week: "W3", done: 0.5}],
    valueFormat: {style: "percent"},
  },
  play: async ({canvasElement}) => {
    await expect(matrix(tableOf(within(canvasElement), "Completion")).slice(1)).toEqual([["W1", "10%"], ["W2", "25%"], ["W3", "50%"]]);
  },
};

export const FractionDigits: Story = {
  args: {title: "Precise", data: [{m: "a", v: 1.23456}], xKey: "m", series: [{dataKey: "v", label: "V"}], valueFormat: {maximumFractionDigits: 1}},
  play: async ({canvasElement}) => {
    await expect(matrix(tableOf(within(canvasElement), "Precise"))[1]).toEqual(["a", "1.2"]);
  },
};

// A bad format must not crash the chart: it falls back to plain numbers.
export const InvalidFormatFallsBack: Story = {
  args: {title: "Bad format", data: revenue, series: [{dataKey: "revenue", label: "Revenue"}], valueFormat: {style: "currency", currency: "not-a-currency", maximumFractionDigits: 500}},
  play: async ({canvasElement}) => {
    const canvas = within(canvasElement);
    await plot(canvas, "Bad format");
    await expect(matrix(tableOf(canvas, "Bad format"))[1]).toEqual(["Jan", "1,200.5"]);
  },
};

// Hover shows the values for the pointed-at category, formatted like the axis and the table.
export const TooltipOnHover: Story = {
  args: {series: both, title: "Hover me", valueFormat: {style: "currency", currency: "USD", maximumFractionDigits: 0}},
  play: async ({canvasElement}) => {
    const canvas = within(canvasElement);
    const svg = await plot(canvas, "Hover me");
    await expect(canvasElement.querySelector(".vl-chart-tooltip")).toBeNull();
    const bar = svg.querySelectorAll(".recharts-bar-rectangle path")[1].getBoundingClientRect();
    const target = canvasElement.querySelector(".recharts-wrapper")!;
    await fireEvent.mouseMove(target, {clientX: bar.left + bar.width / 2, clientY: bar.top + bar.height / 2});
    await waitFor(() => expect(canvasElement.querySelector(".vl-chart-tooltip")).not.toBeNull());
    const tooltip = canvasElement.querySelector<HTMLElement>(".vl-chart-tooltip")!;
    await expect(tooltip).toHaveTextContent("Feb");
    await expect(tooltip).toHaveTextContent("Sales$160");
    await expect(tooltip).toHaveTextContent("Expenses$95");
    // The tooltip never captures the pointer, so it cannot block clicks on the board beneath it.
    await expect(getComputedStyle(tooltip.closest<HTMLElement>(".recharts-tooltip-wrapper")!).pointerEvents).toBe("none");
  },
};

// The chart is one tab stop; the arrow keys move between categories and show the same tooltip.
export const KeyboardInspection: Story = {
  args: {series: both, title: "Keyboard", type: "line"},
  play: async ({canvasElement}) => {
    const canvas = within(canvasElement);
    const svg = await plot(canvas, "Keyboard");
    await userEvent.tab();
    await expect(svg).toHaveFocus();
    await userEvent.keyboard("{ArrowRight}");
    await waitFor(() => expect(canvasElement.querySelector(".vl-chart-tooltip")).not.toBeNull());
    await expect(canvasElement.querySelector(".vl-chart-tooltip")).toHaveTextContent("Sales");
    await userEvent.keyboard("{ArrowRight}");
    await expect(canvasElement.querySelector(".vl-chart-tooltip")).toHaveTextContent(/Feb|Mar/);
  },
};

export const TooltipDisabled: Story = {
  args: {showTooltip: false, title: "No tooltip"},
  play: async ({canvasElement}) => {
    const svg = await plot(within(canvasElement), "No tooltip");
    const bar = svg.querySelector(".recharts-bar-rectangle path")!.getBoundingClientRect();
    await fireEvent.mouseMove(canvasElement.querySelector(".recharts-wrapper")!, {clientX: bar.left + 2, clientY: bar.top + 2});
    await expect(canvasElement.querySelector(".vl-chart-tooltip")).toBeNull();
  },
};

export const AccessibleDataTable: Story = {
  args: {type: "line", series: both, data: [...monthly.slice(0, 2), {month: "Mar", sales: null, expenses: 110}], title: "Monthly performance", description: "Sales and expenses, January to March.", xAxisLabel: "Month"},
  play: async ({canvasElement}) => {
    const canvas = within(canvasElement);
    const figure = canvas.getByRole("figure", {name: "Monthly performance"});
    await expect(figure).toHaveAccessibleDescription("Sales and expenses, January to March.");
    const table = tableOf(canvas, "Monthly performance");
    // Present in the accessibility tree: not display:none, visibility:hidden or aria-hidden.
    await expect(table.closest("[aria-hidden='true']")).toBeNull();
    await expect(getComputedStyle(table).display).not.toBe("none");
    await expect(getComputedStyle(table).visibility).toBe("visible");
    const headers = within(table).getAllByRole("columnheader");
    await expect(headers.map(h => h.textContent)).toEqual(["Month", "Sales", "Expenses"]);
    await expect(headers.every(h => h.getAttribute("scope") === "col")).toBe(true);
    await expect(matrix(table).slice(1)).toEqual([["Jan", "120", "80"], ["Feb", "160", "95"], ["Mar", "No value", "110"]]);
    await expect(within(table).getAllByRole("rowheader").map(h => h.textContent)).toEqual(["Jan", "Feb", "Mar"]);
    // It is hidden from sight only.
    const box = table.parentElement!.getBoundingClientRect();
    await expect(box.width).toBeLessThanOrEqual(1);
    await expect(box.height).toBeLessThanOrEqual(1);
  },
};

export const GeneratedName: Story = {
  args: {title: undefined, type: "line", series: both, xAxisLabel: "Month"},
  play: async ({canvasElement}) => {
    await expect(within(canvasElement).getByRole("figure", {name: "Line chart of Sales and Expenses by Month"})).toBeVisible();
  },
};

export const WithoutGridOrTitle: Story = {
  args: {title: undefined, showGrid: false, series: salesOnly},
  play: async ({canvasElement}) => {
    await expect(canvasElement.querySelector(".recharts-cartesian-grid")).toBeNull();
    await expect(within(canvasElement).getByRole("figure", {name: "Bar chart of Sales by month"})).toBeVisible();
  },
};

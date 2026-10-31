import type {Meta, StoryObj} from "@storybook/react-vite";
import {expect, userEvent, waitFor, within} from "storybook/test";
import {ProportionChart, proportionChartTypes, type ProportionRow} from "./ProportionChart";

const traffic: ProportionRow[] = [
  {category: "Desktop", value: 55},
  {category: "Mobile", value: 35},
  {category: "Tablet", value: 10},
];

const meta = {
  title: "Components/ProportionChart",
  component: ProportionChart,
  decorators: [Story => <div style={{width: 480, maxWidth: "100%"}}><Story /></div>],
  args: {type: "pie", data: traffic, nameKey: "category", valueKey: "value", title: "Traffic by device"},
  argTypes: {
    type: {control: "select", options: proportionChartTypes},
    title: {control: "text"},
    description: {control: "text"},
    nameKey: {control: "text"},
    valueKey: {control: "text"},
    height: {control: "number"},
    showLegend: {control: "boolean"},
    showTooltip: {control: "boolean"},
    showLabels: {control: "boolean"},
    data: {control: "object"},
    valueFormat: {control: "object"},
    ref: {control: false},
    className: {control: false},
    style: {control: false},
  },
} satisfies Meta<typeof ProportionChart>;

export default meta;
type Story = StoryObj<typeof meta>;

const plot = (canvas: ReturnType<typeof within>, name: string) => canvas.findByRole("application", {name});
const tableOf = (canvas: ReturnType<typeof within>, name: string) => canvas.getByRole("table", {name: `Data for ${name}`});
const cells = (row: HTMLElement) => [...(row as HTMLTableRowElement).cells].map(c => c.textContent);
const matrix = (table: HTMLElement) => within(table).getAllByRole("row").map(r => cells(r));
const sectors = (root: Element) => root.querySelectorAll(".recharts-sector");
const legendText = (root: Element) => [...root.querySelectorAll(".vl-chart__legend-item")].map(i => i.textContent);

export const Pie: Story = {
  play: async ({canvasElement}) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByRole("figure", {name: "Traffic by device"})).toBeVisible();
    const svg = await plot(canvas, "Traffic by device");
    await waitFor(() => expect(sectors(svg)).toHaveLength(3));
    // A pie fills the middle: no hole.
    await expect(svg.querySelector(".recharts-sector")!.getAttribute("d")).not.toMatch(/A\s*0[ ,]/);
  },
};

export const Donut: Story = {
  args: {type: "donut"},
  play: async ({canvasElement}) => {
    const canvas = within(canvasElement);
    const svg = await plot(canvas, "Traffic by device");
    await waitFor(() => expect(sectors(svg)).toHaveLength(3));
    // The centre stays empty: no text or shape is drawn inside the hole.
    const box = svg.querySelector(".recharts-pie")!.getBoundingClientRect();
    const hit = document.elementFromPoint(box.left + box.width / 2, box.top + box.height / 2);
    await expect(hit?.closest(".recharts-sector")).toBeNull();
    await expect(svg.querySelectorAll("text")).toHaveLength(0);
  },
};

export const LegendWithShares: Story = {
  play: async ({canvasElement}) => {
    await plot(within(canvasElement), "Traffic by device");
    // The legend shows each category and its calculated share of the total (55 of 100, and so on).
    await expect(legendText(canvasElement)).toEqual(["Desktop55%", "Mobile35%", "Tablet10%"]);
  },
};

export const WithoutLegend: Story = {
  args: {showLegend: false},
  play: async ({canvasElement}) => {
    await plot(within(canvasElement), "Traffic by device");
    await expect(canvasElement.querySelector(".vl-chart__legend")).toBeNull();
  },
};

// Shares come from the actual total, not from reading the values as percentages.
export const SharesFromTheTotal: Story = {
  args: {title: "Visits", data: [{category: "A", value: 30}, {category: "B", value: 10}], showLegend: true},
  play: async ({canvasElement}) => {
    await plot(within(canvasElement), "Visits");
    await expect(legendText(canvasElement)).toEqual(["A75%", "B25%"]);
  },
};

export const Labels: Story = {
  args: {showLabels: true, title: "Labelled", data: [...traffic, {category: "Other", value: 1}]},
  play: async ({canvasElement}) => {
    const svg = await plot(within(canvasElement), "Labelled");
    await waitFor(() => expect(svg.querySelectorAll(".recharts-pie-label-text").length).toBeGreaterThan(0));
    const labels = [...svg.querySelectorAll(".recharts-pie-label-text")].map(l => l.textContent);
    // Large slices are labelled with their share; the 1% slice is too small to label without collisions.
    await expect(labels.filter(Boolean)).toEqual(["54.5%", "34.7%", "9.9%"]);
  },
};

export const LabelsWithoutLegend: Story = {
  args: {showLabels: true, showLegend: false, title: "Names on the chart"},
  play: async ({canvasElement}) => {
    const svg = await plot(within(canvasElement), "Names on the chart");
    await waitFor(() => expect(svg.querySelectorAll(".recharts-pie-label-text").length).toBe(3));
    await expect([...svg.querySelectorAll(".recharts-pie-label-text")].map(l => l.textContent)).toEqual(["Desktop 55%", "Mobile 35%", "Tablet 10%"]);
  },
};

// A zero value has no slice, but it is still in the data table.
export const ZeroValueCategories: Story = {
  args: {title: "Storage", type: "donut", data: [{category: "Media", value: 118}, {category: "Other", value: 0}, {category: "Backups", value: 64}]},
  play: async ({canvasElement}) => {
    const canvas = within(canvasElement);
    const svg = await plot(canvas, "Storage");
    await waitFor(() => expect(sectors(svg)).toHaveLength(2));
    await expect(legendText(canvasElement)).toEqual(["Media64.8%", "Backups35.2%"]);
    await expect(matrix(tableOf(canvas, "Storage")).slice(1)).toEqual([["Media", "118", "64.8%"], ["Other", "0", "0%"], ["Backups", "64", "35.2%"]]);
  },
};

export const SingleCategory: Story = {
  args: {title: "Everything", data: [{category: "All", value: 7}]},
  play: async ({canvasElement}) => {
    const svg = await plot(within(canvasElement), "Everything");
    await waitFor(() => expect(sectors(svg)).toHaveLength(1));
    await expect(legendText(canvasElement)).toEqual(["All100%"]);
  },
};

export const AllZero: Story = {
  args: {title: "Nothing yet", data: [{category: "A", value: 0}, {category: "B", value: 0}]},
  play: async ({canvasElement}) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByRole("status")).toHaveTextContent("Every value is zero");
    await expect(canvasElement.querySelector("svg")).toBeNull();
    await expect(canvas.queryByRole("table")).toBeNull();
  },
};

export const NegativeValueRejected: Story = {
  args: {title: "Profit", data: [{category: "A", value: 40}, {category: "B", value: -10}]},
  play: async ({canvasElement}) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByRole("alert")).toHaveTextContent("Row 2: -10 is negative");
    await expect(canvasElement.querySelector("svg")).toBeNull();
    await expect(canvas.getByRole("figure", {name: "Profit"})).toBeVisible();
  },
};

export const InvalidValues: Story = {
  args: {title: "Bad", data: [{category: "A", value: "40"}, {category: "B", value: null}, {category: "C", value: Number.NaN}, {category: "D"}]},
  play: async ({canvasElement}) => {
    const alert = within(canvasElement).getByRole("alert");
    await expect(alert).toHaveTextContent("“40” is not a finite number");
    await expect(alert).toHaveTextContent("Row 2 has no “value” value");
  },
};

export const InvalidNames: Story = {
  args: {title: "Names", data: [{category: "A", value: 1}, {category: "A", value: 2}, {value: 3}]},
  play: async ({canvasElement}) => {
    const alert = within(canvasElement).getByRole("alert");
    await expect(alert).toHaveTextContent("“A” appears more than once");
    await expect(alert).toHaveTextContent("Row 3 has no “category” name");
  },
};

export const InvalidKeys: Story = {
  args: {title: "Typos", nameKey: "categry", valueKey: "valu"},
  play: async ({canvasElement}) => {
    await expect(within(canvasElement).getByRole("alert")).toHaveTextContent("Row 1 has no “categry” name");
  },
};

export const EmptyData: Story = {
  args: {data: [], title: "Traffic"},
  play: async ({canvasElement}) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByRole("status")).toHaveTextContent("No data to display.");
    await expect(canvas.getByRole("figure", {name: "Traffic"})).toBeVisible();
    await expect(canvasElement.querySelector("svg")).toBeNull();
  },
};

const longNames: ProportionRow[] = [
  {category: "Customer onboarding and activation programme", value: 40},
  {category: "Unbroken_identifier_with_no_spaces_at_all_in_it", value: 35},
  {category: "Platform reliability engineering", value: 25},
];

export const LongCategoryNames: Story = {
  args: {title: "Long names", data: longNames, type: "donut", showLabels: true},
  play: async ({canvasElement}) => {
    const canvas = within(canvasElement);
    await plot(canvas, "Long names");
    // Legend entries wrap inside the chart; nothing makes the page scroll sideways.
    await expect(canvasElement.querySelectorAll(".vl-chart__legend-item")).toHaveLength(3);
    await expect(canvasElement.querySelector(".vl-chart")!.scrollWidth).toBeLessThanOrEqual(canvasElement.querySelector(".vl-chart")!.clientWidth);
    await expect(canvas.getByRole("rowheader", {name: "Unbroken_identifier_with_no_spaces_at_all_in_it"})).toBeInTheDocument();
  },
};

export const NarrowContainer: Story = {
  decorators: [Story => <div style={{width: 220}}><Story /></div>],
  args: {title: "Narrow", data: longNames, showLabels: true, height: 240},
  play: async ({canvasElement}) => {
    const svg = await plot(within(canvasElement), "Narrow");
    await expect(svg.getBoundingClientRect().width).toBeLessThanOrEqual(220);
    await expect(document.documentElement.scrollWidth).toBeLessThanOrEqual(document.documentElement.clientWidth);
    await expect(canvasElement.querySelector(".vl-chart")!.scrollWidth).toBeLessThanOrEqual(220);
  },
};

const budget: ProportionRow[] = [{item: "Engineering", amount: 120000}, {item: "Marketing", amount: 45000}, {item: "Operations", amount: 35000}];

// Raw values use the format; shares are always percentages of the total.
export const CurrencyFormat: Story = {
  args: {title: "Budget", data: budget, nameKey: "item", valueKey: "amount", valueFormat: {style: "currency", currency: "USD", maximumFractionDigits: 0}},
  play: async ({canvasElement}) => {
    const canvas = within(canvasElement);
    await plot(canvas, "Budget");
    await expect(matrix(tableOf(canvas, "Budget")).slice(1)).toEqual([
      ["Engineering", "$120,000", "60%"], ["Marketing", "$45,000", "22.5%"], ["Operations", "$35,000", "17.5%"],
    ]);
  },
};

// A value of 0.25 shown as a percentage is a raw value, distinct from the 25% share it also happens to be here.
export const PercentFormatIsNotTheShare: Story = {
  args: {title: "Rates", data: [{k: "A", v: 0.2}, {k: "B", v: 0.6}], nameKey: "k", valueKey: "v", valueFormat: {style: "percent"}},
  play: async ({canvasElement}) => {
    const canvas = within(canvasElement);
    await plot(canvas, "Rates");
    await expect(matrix(tableOf(canvas, "Rates")).slice(1)).toEqual([["A", "20%", "25%"], ["B", "60%", "75%"]]);
  },
};

export const InvalidFormatFallsBack: Story = {
  args: {title: "Bad format", data: budget, nameKey: "item", valueKey: "amount", valueFormat: {style: "currency", currency: "nope", maximumFractionDigits: 99}},
  play: async ({canvasElement}) => {
    const canvas = within(canvasElement);
    await plot(canvas, "Bad format");
    await expect(matrix(tableOf(canvas, "Bad format"))[1]).toEqual(["Engineering", "120,000", "60%"]);
  },
};

export const TooltipOnHover: Story = {
  args: {title: "Hover me", valueFormat: {style: "number"}},
  play: async ({canvasElement}) => {
    const canvas = within(canvasElement);
    const svg = await plot(canvas, "Hover me");
    await waitFor(() => expect(sectors(svg)).toHaveLength(3));
    await expect(canvasElement.querySelector(".vl-chart-tooltip")).toBeNull();
    await userEvent.hover(sectors(svg)[1]);
    await waitFor(() => expect(canvasElement.querySelector(".vl-chart-tooltip")).not.toBeNull());
    const tooltip = canvasElement.querySelector<HTMLElement>(".vl-chart-tooltip")!;
    await expect(tooltip).toHaveTextContent("Mobile");
    await expect(tooltip).toHaveTextContent("Value35");
    await expect(tooltip).toHaveTextContent("Share35%");
    await expect(getComputedStyle(tooltip.closest<HTMLElement>(".recharts-tooltip-wrapper")!).pointerEvents).toBe("none");
  },
};

export const TooltipDisabled: Story = {
  args: {showTooltip: false, title: "No tooltip"},
  play: async ({canvasElement}) => {
    const svg = await plot(within(canvasElement), "No tooltip");
    await waitFor(() => expect(sectors(svg)).toHaveLength(3));
    await userEvent.hover(sectors(svg)[0]);
    await expect(canvasElement.querySelector(".vl-chart-tooltip")).toBeNull();
  },
};

export const AccessibleDataTable: Story = {
  args: {title: "Traffic by device", description: "Share of sessions by device type.", type: "donut"},
  play: async ({canvasElement}) => {
    const canvas = within(canvasElement);
    const figure = canvas.getByRole("figure", {name: "Traffic by device"});
    await expect(figure).toHaveAccessibleDescription("Share of sessions by device type.");
    const table = tableOf(canvas, "Traffic by device");
    await expect(table.closest("[aria-hidden='true']")).toBeNull();
    await expect(getComputedStyle(table).display).not.toBe("none");
    await expect(getComputedStyle(table).visibility).toBe("visible");
    const headers = within(table).getAllByRole("columnheader");
    await expect(headers.map(h => h.textContent)).toEqual(["category", "value", "Share of total"]);
    await expect(headers.every(h => h.getAttribute("scope") === "col")).toBe(true);
    await expect(matrix(table).slice(1)).toEqual([["Desktop", "55", "55%"], ["Mobile", "35", "35%"], ["Tablet", "10", "10%"]]);
    await expect(within(table).getAllByRole("rowheader").map(h => h.textContent)).toEqual(["Desktop", "Mobile", "Tablet"]);
    const box = table.parentElement!.getBoundingClientRect();
    await expect(box.width).toBeLessThanOrEqual(1);
    await expect(box.height).toBeLessThanOrEqual(1);
  },
};

export const GeneratedName: Story = {
  args: {title: undefined, type: "donut"},
  play: async ({canvasElement}) => {
    await expect(within(canvasElement).getByRole("figure", {name: "Donut chart of value by category"})).toBeVisible();
  },
};

// Keyboard: the chart is one tab stop that shows the same tooltip as hover.
export const KeyboardInspection: Story = {
  args: {title: "Keyboard"},
  play: async ({canvasElement}) => {
    const svg = await plot(within(canvasElement), "Keyboard");
    await waitFor(() => expect(sectors(svg)).toHaveLength(3));
    await userEvent.tab();
    await expect(svg).toHaveFocus();
    await userEvent.keyboard("{ArrowRight}");
    await waitFor(() => expect(canvasElement.querySelector(".vl-chart-tooltip")).not.toBeNull());
  },
};

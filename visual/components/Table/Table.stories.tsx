import type {Meta, StoryObj} from "@storybook/react-vite";
import {expect, within} from "storybook/test";
import {Table, tableDensities, type TableColumn, type TableRow} from "./Table";

const columns: TableColumn[] = [
  {key: "name", header: "Name"},
  {key: "status", header: "Status"},
  {key: "score", header: "Score", align: "end"},
];

const rows: TableRow[] = [
  {name: "Alpha", status: "Passed", score: 82},
  {name: "Beta", status: "Passed", score: 94},
  {name: "Gamma", status: "Needs review", score: 61},
];

const meta = {
  title: "Components/Table",
  component: Table,
  decorators: [Story => <div style={{width: 480, maxWidth: "100%"}}><Story /></div>],
  args: {columns, rows, caption: "Assessment results"},
  argTypes: {
    density: {control: "select", options: tableDensities},
    caption: {control: "text"},
    striped: {control: "boolean"},
    emptyMessage: {control: "text"},
    columns: {control: "object"},
    rows: {control: "object"},
    ref: {control: false},
    className: {control: false},
    style: {control: false},
  },
} satisfies Meta<typeof Table>;

export default meta;
type Story = StoryObj<typeof meta>;

// Native table semantics: the caption names the region, and every body cell sits under a column header.
export const Basic: Story = {
  play: async ({canvasElement}) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByRole("region", {name: "Assessment results"})).toBeVisible();
    await expect(canvas.getByRole("table", {name: "Assessment results"})).toBeVisible();
    const headers = canvas.getAllByRole("columnheader");
    await expect(headers.map(h => h.textContent)).toEqual(["Name", "Status", "Score"]);
    await expect(headers.every(h => h.getAttribute("scope") === "col")).toBe(true);
    await expect(canvas.getAllByRole("row")).toHaveLength(4);
    await expect(canvas.getByRole("cell", {name: "Gamma"})).toBeVisible();
  },
};

export const NumericAlignment: Story = {
  args: {
    caption: "Order totals",
    columns: [{key: "item", header: "Item"}, {key: "qty", header: "Qty", align: "center"}, {key: "price", header: "Price", align: "end"}],
    rows: [{item: "Widget", qty: 12, price: 4.5}, {item: "Gadget", qty: 3, price: 129.99}, {item: "Gizmo", qty: 150, price: 0.75}],
  },
  play: async ({canvasElement}) => {
    const canvas = within(canvasElement);
    await expect(getComputedStyle(canvas.getByRole("columnheader", {name: "Price"})).textAlign).toBe("end");
    await expect(getComputedStyle(canvas.getByRole("cell", {name: "129.99"})).textAlign).toBe("end");
    await expect(getComputedStyle(canvas.getByRole("cell", {name: "12"})).textAlign).toBe("center");
    await expect(getComputedStyle(canvas.getByRole("cell", {name: "Widget"})).textAlign).toBe("start");
  },
};

export const Compact: Story = {
  args: {density: "compact"},
  play: async ({canvasElement}) => {
    const cell = within(canvasElement).getByRole("cell", {name: "Alpha"});
    await expect(parseFloat(getComputedStyle(cell).paddingTop)).toBe(4);
  },
};

export const Striped: Story = {
  args: {striped: true},
  play: async ({canvasElement}) => {
    const [, second, third] = within(canvasElement).getAllByRole("row").slice(1);
    const background = (row: HTMLElement) => getComputedStyle(row.querySelector("td")!).backgroundColor;
    await expect(background(second)).not.toBe(background(third));
  },
};

// A null value is an empty cell: shown as a dash, announced as "No value".
export const EmptyCells: Story = {
  args: {rows: [{name: "Alpha", status: null, score: 82}, {name: "Beta", score: null}]},
  play: async ({canvasElement}) => {
    await expect(within(canvasElement).getAllByText("No value")).toHaveLength(3);
  },
};

export const EmptyData: Story = {
  args: {rows: [], emptyMessage: "No assessments yet"},
  play: async ({canvasElement}) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByRole("cell", {name: "No assessments yet"})).toHaveAttribute("colspan", "3");
    await expect(canvas.getAllByRole("columnheader")).toHaveLength(3);
  },
};

export const WithoutCaption: Story = {
  args: {caption: undefined},
  play: async ({canvasElement}) => {
    await expect(within(canvasElement).getByRole("region", {name: "Table"})).toBeVisible();
  },
};

// A narrow container: many columns scroll sideways inside the table's own region, and long text wraps in its cell.
export const LongContentNarrow: Story = {
  decorators: [Story => <div style={{width: 320}}><Story /></div>],
  args: {
    caption: "Deployment log",
    columns: [
      {key: "id", header: "Deployment ID"},
      {key: "service", header: "Service name"},
      {key: "region", header: "Region"},
      {key: "duration", header: "Duration (seconds)", align: "end"},
      {key: "note", header: "Note"},
    ],
    rows: [
      {id: "dep-2026-10-31-0001", service: "visual-lab-web", region: "eu-west-1", duration: 142, note: "Rolled out after the nightly build finished and the smoke tests passed on every region"},
      {id: "dep-2026-10-31-0002", service: "visual-lab-mcp", region: "us-east-1", duration: 87, note: "https://example.com/a/very/long/unbroken/path/that/cannot/wrap/at/spaces/and/keeps/going"},
    ],
  },
  play: async ({canvasElement}) => {
    const region = within(canvasElement).getByRole("region", {name: "Deployment log"});
    await expect(region.scrollWidth).toBeGreaterThan(region.clientWidth);
    await expect(region.getBoundingClientRect().width).toBeLessThanOrEqual(320);
    await expect(document.documentElement.scrollWidth).toBeLessThanOrEqual(document.documentElement.clientWidth);
    await expect(getComputedStyle(region).overflowX).toBe("auto");
    region.focus();
    await expect(region).toHaveFocus();
  },
};

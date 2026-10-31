import type {Meta, StoryObj} from "@storybook/react-vite";
import {expect, within} from "storybook/test";
import {Badge} from "../Badge/Badge";
import {KeyValue, keyValueLayouts, type KeyValueItem} from "./KeyValue";

const facts: KeyValueItem[] = [
  {label: "Status", value: "Active"},
  {label: "Owner", value: "Alex"},
  {label: "Updated", value: "Today"},
];

const meta = {
  title: "Components/KeyValue",
  component: KeyValue,
  decorators: [Story => <div style={{width: 420, maxWidth: "100%"}}><Story /></div>],
  args: {items: facts},
  argTypes: {
    layout: {control: "select", options: keyValueLayouts},
    dividers: {control: "boolean"},
    emptyMessage: {control: "text"},
    items: {control: "object"},
    ref: {control: false},
    className: {control: false},
    style: {control: false},
  },
} satisfies Meta<typeof KeyValue>;

export default meta;
type Story = StoryObj<typeof meta>;

// Native description list: each label is a dt, each value the dd that follows it.
export const Inline: Story = {
  play: async ({canvasElement}) => {
    const dl = canvasElement.querySelector("dl")!;
    await expect(Array.from(dl.querySelectorAll("dt")).map(dt => dt.textContent)).toEqual(["Status", "Owner", "Updated"]);
    await expect(Array.from(dl.querySelectorAll("dd")).map(dd => dd.textContent)).toEqual(["Active", "Alex", "Today"]);
    const label = within(canvasElement).getByText("Status").getBoundingClientRect();
    const value = within(canvasElement).getByText("Active").getBoundingClientRect();
    // Beside each other, on one line.
    await expect(value.left).toBeGreaterThan(label.right - 1);
    await expect(Math.abs(value.top - label.top)).toBeLessThan(4);
  },
};

export const Stacked: Story = {
  args: {layout: "stacked"},
  play: async ({canvasElement}) => {
    const label = within(canvasElement).getByText("Status").getBoundingClientRect();
    const value = within(canvasElement).getByText("Active").getBoundingClientRect();
    await expect(value.top).toBeGreaterThanOrEqual(label.bottom - 1);
  },
};

export const Dividers: Story = {
  args: {dividers: true},
  play: async ({canvasElement}) => {
    const [first, second] = Array.from(canvasElement.querySelectorAll(".vl-keyvalue__pair"));
    await expect(getComputedStyle(first).borderTopWidth).toBe("0px");
    await expect(getComputedStyle(second).borderTopWidth).toBe("1px");
  },
};

export const LongLabelsAndValues: Story = {
  args: {
    dividers: true,
    items: [
      {label: "Estimated time to first meaningful response", value: "About four to six working days after the request has been reviewed and approved by the owning team"},
      {label: "Repository", value: "https://example.com/an/unbroken/path/with/no/spaces/that/must/still/wrap/inside/its/column"},
      {label: "Id", value: "dep-2026-10-31-0001"},
    ],
  },
  play: async ({canvasElement}) => {
    const root = canvasElement.querySelector<HTMLElement>(".vl-keyvalue")!;
    await expect(root.scrollWidth).toBeLessThanOrEqual(root.clientWidth);
  },
};

export const RichValues: Story = {
  args: {
    dividers: true,
    items: [
      {label: "Status", value: <Badge variant="success">Live</Badge>},
      {label: "Docs", value: <a href="https://example.com/docs">Open documentation</a>},
      {label: "Command", value: <code>npm run dev</code>},
    ],
  },
  play: async ({canvasElement}) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByText("Live")).toBeVisible();
    await expect(canvas.getByRole("link", {name: "Open documentation"})).toBeVisible();
  },
};

// A blank value shows a dash for sighted users and "No value" for screen readers.
export const BlankValues: Story = {
  args: {items: [{label: "Owner", value: null}, {label: "Notes", value: ""}, {label: "Count", value: 0}]},
  play: async ({canvasElement}) => {
    const canvas = within(canvasElement);
    await expect(canvas.getAllByText("No value")).toHaveLength(2);
    await expect(canvas.getByText("0")).toBeVisible();
  },
};

export const Empty: Story = {
  args: {items: [], emptyMessage: "No details available"},
  play: async ({canvasElement}) => {
    await expect(within(canvasElement).getByText("No details available")).toBeVisible();
    await expect(canvasElement.querySelector("dl")).toBeNull();
  },
};

// The component answers to its container, not the viewport: inline pairs stack when the space is narrow.
export const NarrowContainer: Story = {
  decorators: [Story => <div style={{width: 220}}><Story /></div>],
  args: {dividers: true},
  play: async ({canvasElement}) => {
    const label = within(canvasElement).getByText("Status").getBoundingClientRect();
    const value = within(canvasElement).getByText("Active").getBoundingClientRect();
    await expect(value.top).toBeGreaterThanOrEqual(label.bottom - 1);
  },
};

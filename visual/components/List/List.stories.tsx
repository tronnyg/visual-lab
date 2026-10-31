import type {Meta, StoryObj} from "@storybook/react-vite";
import {expect, within} from "storybook/test";
import {List, listDensities, listVariants, type ListItem} from "./List";

const steps: ListItem[] = [
  {content: "Prepare materials"},
  {content: "Review results"},
  {content: "Summarize findings"},
];

const meta = {
  title: "Components/List",
  component: List,
  decorators: [Story => <div style={{width: 420, maxWidth: "100%"}}><Story /></div>],
  args: {items: steps},
  argTypes: {
    variant: {control: "select", options: listVariants},
    density: {control: "select", options: listDensities},
    start: {control: "number"},
    items: {control: "object"},
    ref: {control: false},
    className: {control: false},
    style: {control: false},
  },
} satisfies Meta<typeof List>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Unordered: Story = {
  play: async ({canvasElement}) => {
    const canvas = within(canvasElement);
    const list = canvas.getByRole("list");
    await expect(list.tagName).toBe("UL");
    await expect(canvas.getAllByRole("listitem")).toHaveLength(3);
    await expect(getComputedStyle(list).listStyleType).toBe("disc");
  },
};

export const Ordered: Story = {
  args: {variant: "ordered"},
  play: async ({canvasElement}) => {
    const list = within(canvasElement).getByRole("list");
    await expect(list.tagName).toBe("OL");
    await expect(list).not.toHaveAttribute("start");
    await expect(getComputedStyle(list).listStyleType).toBe("decimal");
  },
};

export const CustomStart: Story = {
  args: {variant: "ordered", start: 4},
  play: async ({canvasElement}) => {
    await expect(within(canvasElement).getByRole("list")).toHaveAttribute("start", "4");
  },
};

// `start` only means something to an ordered list.
export const StartIgnoredWhenUnordered: Story = {
  args: {variant: "unordered", start: 4},
  play: async ({canvasElement}) => {
    await expect(within(canvasElement).getByRole("list")).not.toHaveAttribute("start");
  },
};

export const Compact: Story = {
  render: args => (
    <div style={{display: "flex", flexDirection: "column", gap: 16}}>
      <List {...args} aria-label="Default spacing" />
      <List {...args} density="compact" aria-label="Compact spacing" />
    </div>
  ),
  parameters: {controls: {disable: true}},
  play: async ({canvasElement}) => {
    const second = (name: string) => within(canvasElement).getByRole("list", {name}).querySelectorAll("li")[1];
    await expect(parseFloat(getComputedStyle(second("Default spacing")).marginTop)).toBe(8);
    await expect(parseFloat(getComputedStyle(second("Compact spacing")).marginTop)).toBe(2);
  },
};

export const Nested: Story = {
  args: {
    items: [
      {content: "Frontend", items: [{content: "Components"}, {content: "Styles"}]},
      {content: "Backend", items: [{content: "API"}, {content: "Database", items: [{content: "Schema"}, {content: "Migrations"}]}]},
      {content: "Documentation"},
    ],
  },
  play: async ({canvasElement}) => {
    const canvas = within(canvasElement);
    const lists = canvas.getAllByRole("list");
    await expect(lists).toHaveLength(4);
    // A nested list lives inside its parent's li, so assistive technology reads it as part of that item.
    await expect(lists[1].parentElement?.tagName).toBe("LI");
    await expect(getComputedStyle(lists[1]).listStyleType).toBe("circle");
    await expect(canvas.getAllByRole("listitem")).toHaveLength(9);
  },
};

export const NestedOrdered: Story = {
  args: {variant: "ordered", items: [{content: "Plan", items: [{content: "Scope"}, {content: "Schedule"}]}, {content: "Build"}]},
  play: async ({canvasElement}) => {
    const [, inner] = within(canvasElement).getAllByRole("list");
    await expect(inner.tagName).toBe("OL");
  },
};

export const RichContent: Story = {
  args: {
    items: [
      {content: <><strong>Install</strong> the dependencies with <code>npm install</code></>},
      {content: <a href="https://example.com/docs">Read the documentation</a>},
      {content: <span>Status: <em>done</em></span>},
    ],
  },
  play: async ({canvasElement}) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByRole("link", {name: "Read the documentation"})).toBeVisible();
    await expect(canvas.getByText("npm install").tagName).toBe("CODE");
  },
};

export const LongItem: Story = {
  args: {
    items: [
      {content: "A very long item that keeps going and wraps onto several lines inside a narrow container without pushing the list wider than its parent."},
      {content: "https://example.com/an/unbroken/path/that/has/no/spaces/at/all/and/must/still/wrap/inside/the/list"},
    ],
  },
  play: async ({canvasElement}) => {
    const list = within(canvasElement).getByRole("list");
    await expect(list.scrollWidth).toBeLessThanOrEqual(list.clientWidth);
  },
};

// An empty list means nothing to assistive technology, so nothing is rendered.
export const Empty: Story = {
  args: {items: []},
  play: async ({canvasElement}) => {
    await expect(within(canvasElement).queryByRole("list")).toBeNull();
  },
};

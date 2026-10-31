import type {ReactNode} from "react";
import type {Meta, StoryObj} from "@storybook/react-vite";
import {expect, within} from "storybook/test";
import {Grid, gridAligns, gridColumns, gridJustifies, gridMinColumnWidths, gridSpacings, gridWidths} from "./Grid";

// Grid draws nothing, so each cell is a visible tile. Odd heights make row alignment visible.
function Tile({children, h}: {children: ReactNode; h?: number}) {
  return (
    <div style={{boxSizing: "border-box", height: h, padding: "10px 12px", border: "1px solid var(--ui-accent)", borderRadius: 4, background: "var(--ui-accent-tint)", color: "var(--ui-text)", fontSize: 13}}>
      {children}
    </div>
  );
}

const tiles = (count: number) => Array.from({length: count}, (_, i) => <Tile key={i}>Item {i + 1}</Tile>);

// The number of columns the browser actually laid out, read from the resolved track list.
const columnCount = (grid: HTMLElement) => getComputedStyle(grid).gridTemplateColumns.split(" ").length;

const meta = {
  title: "Components/Grid",
  component: Grid,
  args: {children: tiles(6), "aria-label": "Grid"},
  // The container width is the responsive input: Grid reacts to its container, not the viewport.
  decorators: [Story => <div style={{width: 720, maxWidth: "100%", outline: "1px dashed var(--ui-border)"}}><Story /></div>],
  parameters: {layout: "padded"},
  argTypes: {
    columns: {control: "select", options: gridColumns},
    gap: {control: "select", options: gridSpacings},
    rowGap: {control: "select", options: gridSpacings},
    columnGap: {control: "select", options: gridSpacings},
    align: {control: "select", options: gridAligns},
    justify: {control: "select", options: gridJustifies},
    minColumnWidth: {control: "select", options: gridMinColumnWidths},
    width: {control: "select", options: gridWidths},
    children: {control: false},
    ref: {control: false},
    className: {control: false},
    style: {control: false},
  },
} satisfies Meta<typeof Grid>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  play: async ({canvasElement}) => {
    await expect(columnCount(within(canvasElement).getByLabelText("Grid"))).toBe(2);
  },
};

export const ThreeColumns: Story = {
  args: {columns: 3},
  play: async ({canvasElement}) => {
    await expect(columnCount(within(canvasElement).getByLabelText("Grid"))).toBe(3);
  },
};

export const FourColumns: Story = {
  args: {columns: 4, gap: "sm", children: tiles(8)},
  play: async ({canvasElement}) => {
    await expect(columnCount(within(canvasElement).getByLabelText("Grid"))).toBe(4);
  },
};

export const Gaps: Story = {
  args: {columns: 3, rowGap: "lg", columnGap: "xs"},
  play: async ({canvasElement}) => {
    const [a, b, , d] = Array.from(within(canvasElement).getByLabelText("Grid").children) as HTMLElement[];
    // columnGap xs is 4px and rowGap lg is 24px; both override `gap`.
    await expect(Math.round(b.getBoundingClientRect().left - a.getBoundingClientRect().right)).toBe(4);
    await expect(Math.round(d.getBoundingClientRect().top - a.getBoundingClientRect().bottom)).toBe(24);
  },
};

export const ItemAlignment: Story = {
  args: {
    columns: 3,
    align: "start",
    justify: "center",
    children: [<Tile key="a" h={32}>Short</Tile>, <Tile key="b" h={72}>Tall</Tile>, <Tile key="c" h={48}>Medium</Tile>],
  },
};

// Narrow containers drop columns instead of squeezing them. Each row is the same Grid in a different container width.
export const Responsive: Story = {
  render: () => (
    <div style={{display: "grid", gap: 24}}>
      {[720, 420, 240].map(width => (
        <div key={width}>
          <div style={{fontSize: 12, color: "var(--ui-text-muted)", marginBottom: 4}}>container {width}px, columns=4</div>
          <div style={{width, maxWidth: "100%", outline: "1px dashed var(--ui-border)"}}>
            <Grid columns={4} gap="sm" aria-label={`Grid ${width}`}>{tiles(4)}</Grid>
          </div>
        </div>
      ))}
    </div>
  ),
  parameters: {controls: {disable: true}},
  play: async ({canvasElement}) => {
    const canvas = within(canvasElement);
    // With the default minColumnWidth (sm, 10rem) a 720px container keeps 4 columns, 420px fits 2, and 240px only 1.
    await expect(columnCount(canvas.getByLabelText("Grid 720"))).toBe(4);
    await expect(columnCount(canvas.getByLabelText("Grid 420"))).toBe(2);
    await expect(columnCount(canvas.getByLabelText("Grid 240"))).toBe(1);
  },
};

export const MinColumnWidths: Story = {
  render: () => (
    <div style={{display: "grid", gap: 24}}>
      {gridMinColumnWidths.map(min => (
        <div key={min}>
          <div style={{fontSize: 12, color: "var(--ui-text-muted)", marginBottom: 4}}>minColumnWidth="{min}" in a 360px container</div>
          <div style={{width: 360, maxWidth: "100%", outline: "1px dashed var(--ui-border)"}}>
            <Grid columns={3} gap="sm" minColumnWidth={min} aria-label={`Min ${min}`}>{tiles(3)}</Grid>
          </div>
        </div>
      ))}
    </div>
  ),
  parameters: {controls: {disable: true}},
  play: async ({canvasElement}) => {
    const canvas = within(canvasElement);
    // "none" always keeps the requested columns; "lg" (20rem) collapses to one in 360px.
    await expect(columnCount(canvas.getByLabelText("Min none"))).toBe(3);
    await expect(columnCount(canvas.getByLabelText("Min lg"))).toBe(1);
  },
};

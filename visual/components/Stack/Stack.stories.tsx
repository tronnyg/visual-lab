import type {CSSProperties, ReactNode} from "react";
import type {Meta, StoryObj} from "@storybook/react-vite";
import {expect, within} from "storybook/test";
import {Stack, stackAligns, stackDirections, stackFlexes, stackJustifies, stackSpacings, stackWidths} from "./Stack";

// Stack draws nothing, so each child is a visible box. `h` varies heights so cross-axis alignment is easy to see.
function Box({children, h, style}: {children: ReactNode; h?: number; style?: CSSProperties}) {
  return (
    <div style={{boxSizing: "border-box", minWidth: 56, height: h, padding: "6px 10px", border: "1px solid var(--ui-accent)", borderRadius: 4, background: "var(--ui-accent-tint)", color: "var(--ui-text)", fontSize: 13, ...style}}>
      {children}
    </div>
  );
}

const boxes = [<Box key="a" h={32}>A</Box>, <Box key="b" h={56}>B</Box>, <Box key="c" h={40}>C</Box>];

const rect = (el: HTMLElement) => el.getBoundingClientRect();

const meta = {
  title: "Components/Stack",
  component: Stack,
  args: {children: boxes},
  // A dashed frame shows the Stack's own box, which is otherwise invisible.
  decorators: [Story => <div style={{width: 420, outline: "1px dashed var(--ui-border)"}}><Story /></div>],
  argTypes: {
    direction: {control: "select", options: stackDirections},
    gap: {control: "select", options: stackSpacings},
    padding: {control: "select", options: stackSpacings},
    align: {control: "select", options: stackAligns},
    justify: {control: "select", options: stackJustifies},
    width: {control: "select", options: stackWidths},
    flex: {control: "select", options: stackFlexes},
    wrap: {control: "boolean"},
    children: {control: false},
    ref: {control: false},
    className: {control: false},
    style: {control: false},
  },
} satisfies Meta<typeof Stack>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Vertical: Story = {
  args: {"aria-label": "Vertical stack"},
  play: async ({canvasElement}) => {
    const [a, b] = Array.from(within(canvasElement).getByLabelText("Vertical stack").children) as HTMLElement[];
    // Children share a left edge and sit one default gap (md, 16px) apart.
    await expect(rect(a).left).toBe(rect(b).left);
    await expect(Math.round(rect(b).top - rect(a).bottom)).toBe(16);
  },
};

export const Horizontal: Story = {
  args: {direction: "horizontal", gap: "sm", align: "start", "aria-label": "Horizontal stack"},
  play: async ({canvasElement}) => {
    const [a, b] = Array.from(within(canvasElement).getByLabelText("Horizontal stack").children) as HTMLElement[];
    await expect(rect(a).top).toBe(rect(b).top);
    await expect(Math.round(rect(b).left - rect(a).right)).toBe(8);
  },
};

export const Gaps: Story = {
  render: () => (
    <div style={{display: "grid", gap: 16}}>
      {stackSpacings.map(gap => (
        <div key={gap}>
          <div style={{fontSize: 12, color: "var(--ui-text-muted)", marginBottom: 4}}>gap="{gap}"</div>
          <Stack direction="horizontal" gap={gap}>{boxes.slice(0, 3)}</Stack>
        </div>
      ))}
    </div>
  ),
  parameters: {controls: {disable: true}},
};

export const AlignAndJustify: Story = {
  args: {direction: "horizontal", align: "center", justify: "between", padding: "sm"},
  play: async ({canvasElement}) => {
    const stack = canvasElement.querySelector<HTMLElement>(".vl-stack")!;
    const [a, , c] = Array.from(stack.children) as HTMLElement[];
    // Space-between pushes the first and last child to the padded edges.
    await expect(Math.round(rect(a).left - rect(stack).left)).toBe(8);
    await expect(Math.round(rect(stack).right - rect(c).right)).toBe(8);
  },
};

// Align chooses the cross axis, justify the main axis; the grid shows each value on a fixed-height row.
export const CrossAxisAlignment: Story = {
  render: () => (
    <div style={{display: "grid", gap: 12}}>
      {stackAligns.map(align => (
        <div key={align}>
          <div style={{fontSize: 12, color: "var(--ui-text-muted)", marginBottom: 4}}>align="{align}"</div>
          <Stack direction="horizontal" gap="sm" align={align} style={{height: 80}}>
            <Box>A</Box>
            <Box h={56}>B</Box>
            <Box>
              <span style={{fontSize: 20}}>C</span>
            </Box>
          </Stack>
        </div>
      ))}
    </div>
  ),
  parameters: {controls: {disable: true}},
};

export const Wrapping: Story = {
  args: {
    direction: "horizontal",
    wrap: true,
    gap: "sm",
    align: "start",
    children: Array.from({length: 8}, (_, i) => <Box key={i} style={{width: 90}}>Item {i + 1}</Box>),
  },
  play: async ({canvasElement}) => {
    const stack = canvasElement.querySelector<HTMLElement>(".vl-stack")!;
    const tops = new Set(Array.from(stack.children).map(child => Math.round(child.getBoundingClientRect().top)));
    // 8 items of 90px cannot fit one 420px row, so wrapping produces more than one line.
    await expect(tops.size).toBeGreaterThan(1);
  },
};

export const NestedLayout: Story = {
  render: () => (
    <Stack gap="lg" padding="md">
      <Stack direction="horizontal" justify="between" align="center">
        <Box>Title</Box>
        <Stack direction="horizontal" gap="xs">
          <Box>One</Box>
          <Box>Two</Box>
        </Stack>
      </Stack>
      <Stack direction="horizontal" gap="sm">
        <Stack flex="grow" gap="xs"><Box>Grow column</Box><Box>Row 2</Box></Stack>
        <Stack flex="none" gap="xs"><Box>Fixed</Box><Box>Row 2</Box></Stack>
      </Stack>
    </Stack>
  ),
  parameters: {controls: {disable: true}},
};

import type {CSSProperties, ReactNode} from "react";
import type {Meta, StoryObj} from "@storybook/react-vite";
import {expect, within} from "storybook/test";
import {Spacer, spacerSizes} from "./Spacer";
import {Stack} from "../Stack/Stack";

// A Spacer draws nothing. Stories pass `style` to paint it with a hatch pattern so the space it takes is visible; the component itself stays invisible.
const hatch: CSSProperties = {
  backgroundImage: "repeating-linear-gradient(45deg, var(--ui-border) 0 2px, transparent 2px 6px)",
  outline: "1px dashed var(--ui-text-muted)",
};

function Box({children}: {children: ReactNode}) {
  return (
    <div style={{boxSizing: "border-box", minWidth: 56, padding: "6px 10px", border: "1px solid var(--ui-accent)", borderRadius: 4, background: "var(--ui-accent-tint)", color: "var(--ui-text)", fontSize: 13}}>
      {children}
    </div>
  );
}

const rect = (el: Element) => el.getBoundingClientRect();

const meta = {
  title: "Components/Spacer",
  component: Spacer,
  args: {style: hatch},
  decorators: [Story => <div style={{width: 420}}><Story /></div>],
  argTypes: {
    size: {control: "select", options: spacerSizes},
    ref: {control: false},
    className: {control: false},
    style: {control: false},
  },
} satisfies Meta<typeof Spacer>;

export default meta;
type Story = StoryObj<typeof meta>;

// Spacer adds to the Stack's gap: the space between A and B is gap + spacer + gap.
export const InVerticalStack: Story = {
  args: {size: "lg"},
  render: args => (
    <Stack gap="sm" data-testid="stack">
      <Box>A</Box>
      <Spacer {...args} />
      <Box>B</Box>
    </Stack>
  ),
  play: async ({canvasElement}) => {
    const [a, , b] = Array.from(within(canvasElement).getByTestId("stack").children);
    // gap sm (8px) + spacer lg (24px) + gap sm (8px)
    await expect(Math.round(rect(b).top - rect(a).bottom)).toBe(40);
  },
};

export const InHorizontalStack: Story = {
  args: {size: "xl"},
  render: args => (
    <Stack direction="horizontal" gap="none" align="start" data-testid="stack">
      <Box>A</Box>
      <Spacer {...args} />
      <Box>B</Box>
    </Stack>
  ),
  play: async ({canvasElement}) => {
    const [a, , b] = Array.from(within(canvasElement).getByTestId("stack").children);
    // xl is 48px
    await expect(Math.round(rect(b).left - rect(a).right)).toBe(48);
  },
};

export const Sizes: Story = {
  render: () => (
    <Stack gap="none">
      {spacerSizes.filter(size => size !== "grow").map(size => (
        <Stack key={size} direction="horizontal" align="center" gap="sm">
          <div style={{width: 56, fontSize: 12, color: "var(--ui-text-muted)"}}>{size}</div>
          <Stack direction="horizontal" gap="none" align="start">
            <Box>A</Box>
            <Spacer size={size} style={hatch} />
            <Box>B</Box>
          </Stack>
        </Stack>
      ))}
    </Stack>
  ),
  parameters: {controls: {disable: true}},
};

// grow takes the remaining room, so it needs a parent with spare space: a full-width horizontal Stack.
export const GrowPushesApart: Story = {
  args: {size: "grow"},
  render: args => (
    <Stack direction="horizontal" width="full" gap="none" align="center" data-testid="stack">
      <Box>Logo</Box>
      <Spacer {...args} />
      <Box>Sign in</Box>
    </Stack>
  ),
  play: async ({canvasElement}) => {
    const stack = within(canvasElement).getByTestId("stack");
    const [first, , last] = Array.from(stack.children);
    await expect(rect(first).left).toBe(rect(stack).left);
    await expect(rect(last).right).toBe(rect(stack).right);
  },
};

export const GrowInFixedHeight: Story = {
  args: {size: "grow"},
  render: args => (
    <Stack gap="none" style={{height: 200, padding: 8, border: "1px dashed var(--ui-border)"}} data-testid="stack">
      <Box>Top</Box>
      <Spacer {...args} />
      <Box>Bottom</Box>
    </Stack>
  ),
  play: async ({canvasElement}) => {
    const stack = within(canvasElement).getByTestId("stack");
    const last = stack.lastElementChild!;
    await expect(Math.round(rect(stack).bottom - 9 - rect(last).bottom)).toBeLessThanOrEqual(1);
  },
};

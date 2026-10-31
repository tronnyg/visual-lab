import type {Meta, StoryObj} from "@storybook/react-vite";
import {expect, within} from "storybook/test";
import {Skeleton} from "./Skeleton";
import {Card} from "../Card/Card";
import {Stack} from "../Stack/Stack";
import {Text} from "../Text/Text";

const meta = {
  title: "Components/Skeleton",
  component: Skeleton,
  decorators: [Story => <div style={{width: 360}}><Story /></div>],
  args: {},
  argTypes: {
    variant: {control: "inline-radio", options: ["text", "rectangle", "circle"]},
    width: {control: "text"},
    height: {control: "text"},
    lines: {control: "number"},
    animated: {control: "boolean"},
    ref: {control: false},
    className: {control: false},
  },
} satisfies Meta<typeof Skeleton>;

export default meta;
type Story = StoryObj<typeof meta>;

const root = (canvasElement: HTMLElement) => canvasElement.querySelector<HTMLElement>(".vl-skeleton")!;

export const TextLine: Story = {
  play: async ({canvasElement}) => {
    await expect(root(canvasElement)).toHaveAttribute("data-variant", "text");
    await expect(canvasElement.querySelectorAll(".vl-skeleton__line")).toHaveLength(1);
    await expect(root(canvasElement).getBoundingClientRect().width).toBe(360);
    // Decorative: hidden from assistive technology and contains no text.
    await expect(root(canvasElement)).toHaveAttribute("aria-hidden", "true");
    await expect(root(canvasElement).textContent).toBe("");
    await expect(within(canvasElement).queryByRole("progressbar")).toBeNull();
  },
};

export const MultipleLines: Story = {
  args: {lines: 4},
  play: async ({canvasElement}) => {
    const lines = canvasElement.querySelectorAll<HTMLElement>(".vl-skeleton__line");
    await expect(lines).toHaveLength(4);
    // The last line is shorter, like the end of a paragraph.
    await expect(lines[3].getBoundingClientRect().width).toBeLessThan(lines[0].getBoundingClientRect().width);
    await expect(lines[0].getBoundingClientRect().width).toBe(lines[2].getBoundingClientRect().width);
  },
};

export const LineCountIsClamped: Story = {
  args: {lines: 500},
  play: async ({canvasElement}) => {
    await expect(canvasElement.querySelectorAll(".vl-skeleton__line")).toHaveLength(20);
  },
};

export const Rectangle: Story = {
  args: {variant: "rectangle"},
  play: async ({canvasElement}) => {
    const rect = root(canvasElement).getBoundingClientRect();
    await expect(rect.width).toBe(360);
    await expect(rect.height).toBe(96);
  },
};

export const Circle: Story = {
  args: {variant: "circle"},
  play: async ({canvasElement}) => {
    const rect = root(canvasElement).getBoundingClientRect();
    await expect(rect.width).toBe(40);
    await expect(rect.height).toBe(40);
    await expect(getComputedStyle(root(canvasElement)).borderRadius).not.toBe("0px");
  },
};

export const CircleSizedByWidth: Story = {
  args: {variant: "circle", width: 64},
  play: async ({canvasElement}) => {
    const rect = root(canvasElement).getBoundingClientRect();
    await expect([rect.width, rect.height]).toEqual([64, 64]);
  },
};

export const CustomDimensions: Story = {
  args: {variant: "rectangle", width: "50%", height: 120},
  play: async ({canvasElement}) => {
    const rect = root(canvasElement).getBoundingClientRect();
    await expect(rect.width).toBe(180);
    await expect(rect.height).toBe(120);
  },
};

export const TextLineHeight: Story = {
  args: {lines: 2, height: 24, width: "200px"},
  play: async ({canvasElement}) => {
    await expect(root(canvasElement).getBoundingClientRect().width).toBe(200);
    await expect(canvasElement.querySelector<HTMLElement>(".vl-skeleton__line")!.getBoundingClientRect().height).toBe(24);
  },
};

export const ResponsiveWidth: Story = {
  decorators: [Story => <div style={{width: 120}}><Story /></div>],
  args: {variant: "rectangle", width: 500},
  play: async ({canvasElement}) => {
    // A fixed width never overflows a narrower container.
    await expect(root(canvasElement).getBoundingClientRect().width).toBeLessThanOrEqual(120 + 360);
    await expect(root(canvasElement).getBoundingClientRect().right).toBeLessThanOrEqual(canvasElement.querySelector("div")!.getBoundingClientRect().right);
  },
};

export const Animated: Story = {
  play: async ({canvasElement}) => {
    await expect(root(canvasElement)).toHaveAttribute("data-animated", "true");
    // The pulse is declared only for users who have not asked for reduced motion.
    const rules = Array.from(document.styleSheets).flatMap(sheet => Array.from(sheet.cssRules)).filter((rule): rule is CSSMediaRule => rule instanceof CSSMediaRule);
    const guarded = rules.filter(rule => rule.conditionText.includes("prefers-reduced-motion") && Array.from(rule.cssRules).some(inner => inner.cssText.includes("vl-skeleton-pulse")));
    await expect(guarded.length).toBeGreaterThan(0);
    await expect(guarded.every(rule => rule.conditionText.includes("no-preference"))).toBe(true);
    // No rule outside that media query starts the animation.
    const unguarded = Array.from(document.styleSheets).flatMap(sheet => Array.from(sheet.cssRules)).filter(rule => rule instanceof CSSStyleRule && rule.cssText.includes("animation") && rule.selectorText.includes("vl-skeleton"));
    await expect(unguarded).toHaveLength(0);
  },
};

export const NotAnimated: Story = {
  args: {animated: false},
  play: async ({canvasElement}) => {
    await expect(root(canvasElement)).not.toHaveAttribute("data-animated");
    await expect(getComputedStyle(root(canvasElement)).animationName).toBe("none");
  },
};

export const CardComposition: Story = {
  render: () => (
    <Card title="Loading profile">
      <div aria-busy="true">
        <Stack>
          <Text tone="muted">Loading…</Text>
          <Stack direction="horizontal" align="center">
            <Skeleton variant="circle" width={48} />
            <Stack gap="xs"><Skeleton width={160} /><Skeleton width={100} /></Stack>
          </Stack>
          <Skeleton lines={3} />
        </Stack>
      </div>
    </Card>
  ),
  play: async ({canvasElement}) => {
    await expect(canvasElement.querySelectorAll(".vl-skeleton")).toHaveLength(4);
    // The container communicates the loading state; the placeholders add nothing to the accessibility tree.
    await expect(canvasElement.querySelector("[aria-busy=true]")).not.toBeNull();
    await expect(within(canvasElement).getByText("Loading…")).toBeVisible();
  },
};

export const Dark: Story = {
  globals: {theme: "dark"},
  render: () => (
    <Card title="Loading">
      <Stack>
        <Skeleton variant="circle" width={48} />
        <Skeleton lines={3} />
        <Skeleton variant="rectangle" height={80} />
      </Stack>
    </Card>
  ),
};

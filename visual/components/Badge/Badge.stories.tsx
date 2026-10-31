import type {Meta, StoryObj} from "@storybook/react-vite";
import {expect, within} from "storybook/test";
import {Badge, badgeVariants} from "./Badge";

const meta = {
  title: "Components/Badge",
  component: Badge,
  args: {children: "Beta"},
  argTypes: {
    variant: {control: "select", options: badgeVariants},
    children: {control: "text"},
    ref: {control: false},
    className: {control: false},
    style: {control: false},
  },
} satisfies Meta<typeof Badge>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

// Each variant with a label that states its meaning: colour is never the only signal.
export const Variants: Story = {
  render: () => (
    <div style={{display: "flex", flexWrap: "wrap", gap: 8, maxWidth: 420}}>
      <Badge variant="default">New</Badge>
      <Badge variant="secondary">Draft</Badge>
      <Badge variant="outline">v2.4</Badge>
      <Badge variant="success">Active</Badge>
      <Badge variant="warning">Pending</Badge>
      <Badge variant="danger">Failed</Badge>
    </div>
  ),
  parameters: {controls: {disable: true}},
  play: async ({canvasElement}) => {
    const badges = Array.from(canvasElement.querySelectorAll(".vl-badge"));
    await expect(badges.map(badge => badge.getAttribute("data-variant"))).toEqual([...badgeVariants]);
  },
};

export const InContext: Story = {
  render: () => (
    <p style={{margin: 0, fontFamily: "var(--ui-font)", color: "var(--ui-text)", fontSize: 15}}>
      Deployment <strong>web-42</strong> <Badge variant="success">Live</Badge>
    </p>
  ),
  parameters: {controls: {disable: true}},
  play: async ({canvasElement}) => {
    await expect(within(canvasElement).getByText("Live")).toBeVisible();
  },
};

export const LongLabel: Story = {
  args: {children: "Awaiting review from the platform team"},
};

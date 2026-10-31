import type {Meta, StoryObj} from "@storybook/react-vite";
import {expect, within} from "storybook/test";
import {Divider, dividerOrientations, dividerSpacings, dividerTones} from "./Divider";
import {Stack} from "../Stack/Stack";
import {Text} from "../Text/Text";

const meta = {
  title: "Components/Divider",
  component: Divider,
  decorators: [Story => <div style={{width: 360}}><Story /></div>],
  argTypes: {
    orientation: {control: "select", options: dividerOrientations},
    tone: {control: "select", options: dividerTones},
    spacing: {control: "select", options: dividerSpacings},
    decorative: {control: "boolean"},
    ref: {control: false},
    className: {control: false},
    style: {control: false},
  },
} satisfies Meta<typeof Divider>;

export default meta;
type Story = StoryObj<typeof meta>;

// A horizontal divider separates stacked sections, so the controls story wraps it in surrounding content.
export const Default: Story = {
  render: args => (
    <Stack gap="none">
      <Text weight="semibold">Account</Text>
      <Text tone="muted" size="sm">Name, email and password.</Text>
      <Divider {...args} />
      <Text weight="semibold">Notifications</Text>
      <Text tone="muted" size="sm">Choose what we email you about.</Text>
    </Stack>
  ),
  play: async ({canvasElement}) => {
    // Decorative by default: hidden from assistive technology, so no separator role is exposed.
    await expect(within(canvasElement).queryByRole("separator")).toBeNull();
    await expect(canvasElement.querySelector(".vl-divider")).toHaveAttribute("aria-hidden", "true");
  },
};

export const Tones: Story = {
  render: () => (
    <Stack gap="none">
      {dividerTones.map(tone => (
        <div key={tone}>
          <Text size="sm" tone="muted">{tone}</Text>
          <Divider tone={tone} />
        </div>
      ))}
    </Stack>
  ),
  parameters: {controls: {disable: true}},
};

// Spacing is margin on both sides of the line; the line stays one pixel thick.
export const Spacing: Story = {
  render: () => (
    <Stack gap="none">
      {dividerSpacings.map(spacing => (
        <div key={spacing} style={{outline: "1px dashed var(--ui-border)", marginBottom: 12}}>
          <Text size="sm" tone="muted">spacing="{spacing}"</Text>
          <Divider spacing={spacing} tone="strong" data-testid={`divider-${spacing}`} />
          <Text size="sm" tone="muted">next section</Text>
        </div>
      ))}
    </Stack>
  ),
  parameters: {controls: {disable: true}},
  play: async ({canvasElement}) => {
    const canvas = within(canvasElement);
    const none = canvas.getByTestId("divider-none");
    const lg = canvas.getByTestId("divider-lg");
    await expect(none.getBoundingClientRect().height).toBe(1);
    await expect(lg.getBoundingClientRect().height).toBe(1);
    await expect(getComputedStyle(none).marginTop).toBe("0px");
    await expect(getComputedStyle(lg).marginTop).toBe("24px");
  },
};

// A vertical divider stretches across a horizontal Stack's height.
export const Vertical: Story = {
  args: {orientation: "vertical", tone: "default"},
  render: args => (
    <Stack direction="horizontal" align="stretch" gap="none">
      <Text>Overview</Text>
      <Divider {...args} />
      <Text>Activity</Text>
      <Divider {...args} />
      <Text>Settings</Text>
    </Stack>
  ),
  play: async ({canvasElement}) => {
    const [divider] = Array.from(canvasElement.querySelectorAll<HTMLElement>(".vl-divider"));
    const row = divider.parentElement!;
    await expect(divider.getBoundingClientRect().width).toBe(1);
    await expect(divider.getBoundingClientRect().height).toBe(row.getBoundingClientRect().height);
  },
};

// decorative={false} exposes a separator for assistive technology, with its orientation.
export const Semantic: Story = {
  args: {decorative: false},
  render: args => (
    <Stack gap="none">
      <Text>Before</Text>
      <Divider {...args} />
      <Text>After</Text>
    </Stack>
  ),
  play: async ({canvasElement}) => {
    const separator = within(canvasElement).getByRole("separator");
    await expect(separator).toHaveAttribute("aria-orientation", "horizontal");
  },
};

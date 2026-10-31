import type {Meta, StoryObj} from "@storybook/react-vite";
import {expect, within} from "storybook/test";
import {Icon, iconNames, iconSizes, iconTones} from "./Icon";
import type {IconName} from "./Icon";

// A representative handful from each group in Icon.tsx, not the whole 46-icon vocabulary. The Name control reaches the rest.
const gallery: IconName[] = ["home", "arrow-right", "chevron-down", "plus", "check", "x", "edit", "trash", "search", "settings", "info", "alert-triangle", "check-circle", "x-circle", "bell", "file", "mail", "user", "star", "lock"];

const meta = {
  title: "Components/Icon",
  component: Icon,
  args: {name: "star", size: "lg"},
  argTypes: {
    name: {control: "select", options: iconNames},
    size: {control: "select", options: iconSizes},
    tone: {control: "select", options: [undefined, ...iconTones]},
    label: {control: "text"},
    ref: {control: false},
    className: {control: false},
    style: {control: false},
  },
} satisfies Meta<typeof Icon>;

export default meta;
type Story = StoryObj<typeof meta>;

// Decorative by default: hidden from assistive technology unless a label is given.
export const Decorative: Story = {
  render: args => <span style={{display: "inline-flex", gap: 8, alignItems: "center"}}><Icon {...args} /> Favourites</span>,
  play: async ({canvasElement}) => {
    const icon = canvasElement.querySelector("svg")!;
    await expect(icon).toHaveAttribute("aria-hidden", "true");
    await expect(within(canvasElement).queryByRole("img")).toBeNull();
  },
};

export const Labelled: Story = {
  args: {name: "alert-triangle", tone: "warning", label: "Warning"},
  play: async ({canvasElement}) => {
    // With a label the icon stands alone as an image with that name.
    await expect(within(canvasElement).getByRole("img", {name: "Warning"})).toBeVisible();
  },
};

export const Sizes: Story = {
  render: () => (
    <div style={{display: "flex", gap: 20, alignItems: "end"}}>
      {iconSizes.map(size => (
        <div key={size} style={{display: "grid", gap: 6, justifyItems: "center", fontSize: 12, color: "var(--ui-text-muted)"}}>
          <Icon name="star" size={size} />
          {size}
        </div>
      ))}
    </div>
  ),
  parameters: {controls: {disable: true}},
  play: async ({canvasElement}) => {
    const widths = Array.from(canvasElement.querySelectorAll("svg")).map(svg => svg.getBoundingClientRect().width);
    await expect(widths).toEqual([12, 14, 16, 20, 24]);
  },
};

// Without a tone the icon inherits the surrounding text colour.
export const Tones: Story = {
  render: () => (
    <div style={{display: "flex", gap: 20}}>
      <div style={{display: "grid", gap: 6, justifyItems: "center", fontSize: 12, color: "var(--ui-text)"}}>
        <Icon name="heart" size="xl" />
        inherit
      </div>
      {iconTones.map(tone => (
        <div key={tone} style={{display: "grid", gap: 6, justifyItems: "center", fontSize: 12, color: "var(--ui-text-muted)"}}>
          <Icon name="heart" size="xl" tone={tone} />
          {tone}
        </div>
      ))}
    </div>
  ),
  parameters: {controls: {disable: true}},
};

export const Gallery: Story = {
  render: () => (
    <div style={{display: "grid", gridTemplateColumns: "repeat(5, 88px)", gap: 16}}>
      {gallery.map(name => (
        <div key={name} style={{display: "grid", gap: 6, justifyItems: "center", textAlign: "center", fontSize: 11, color: "var(--ui-text-muted)"}}>
          <Icon name={name} size="xl" tone="default" />
          {name}
        </div>
      ))}
    </div>
  ),
  parameters: {controls: {disable: true}},
  play: async ({canvasElement}) => {
    await expect(canvasElement.querySelectorAll("svg")).toHaveLength(gallery.length);
  },
};

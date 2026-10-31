import type {Meta, StoryObj} from "@storybook/react-vite";
import {expect, within} from "storybook/test";
import {Card, cardBackgrounds, cardRadii, cardShadows, cardSpacings, cardVariants, cardWidths} from "./Card";
import {Input} from "../Input/Input";
import {Select} from "../Select/Select";

const meta = {
  title: "Components/Card",
  component: Card,
  args: {children: "Card content"},
  argTypes: {
    variant: {control: "select", options: cardVariants},
    padding: {control: "select", options: cardSpacings},
    gap: {control: "select", options: cardSpacings},
    radius: {control: "select", options: cardRadii},
    shadow: {control: "select", options: cardShadows},
    background: {control: "select", options: cardBackgrounds},
    width: {control: "select", options: cardWidths},
    border: {control: "boolean"},
    children: {control: false},
    ref: {control: false},
    className: {control: false},
    style: {control: false},
  },
} satisfies Meta<typeof Card>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Basic: Story = {};

export const TextContent: Story = {
  args: {
    width: "md",
    children: (
      <>
        <strong>Release notes</strong>
        <span>Cards group related content on a padded surface and stack their children vertically.</span>
      </>
    ),
  },
};

export const MultipleElements: Story = {
  args: {
    width: "md",
    children: (
      <>
        <strong>Profile</strong>
        <Input label="Name" value="" onChange={() => {}} />
        <span style={{color: "var(--ui-text-muted)", fontSize: 12}}>Shown on your public page.</span>
        <button type="button">Save</button>
      </>
    ),
  },
  play: async ({canvasElement}) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByText("Profile")).toBeVisible();
    await expect(canvas.getByRole("button", {name: "Save"})).toBeVisible();
  },
};

export const NestedLayout: Story = {
  args: {
    width: "lg",
    children: (
      <>
        <strong>Settings</strong>
        <Card variant="subtle" padding="sm">
          <Select label="Theme" value="system" options={[{label: "System", value: "system"}, {label: "Light", value: "light"}, {label: "Dark", value: "dark"}]} />
        </Card>
        <Card variant="outline" padding="sm">Nested outline card</Card>
      </>
    ),
  },
};

export const Variants: Story = {
  render: () => (
    <div style={{display: "grid", gap: 16, width: 360}}>
      {cardVariants.map(variant => <Card key={variant} variant={variant}>{variant}</Card>)}
    </div>
  ),
  parameters: {controls: {disable: true}},
};

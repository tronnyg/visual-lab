import type {Meta, StoryObj} from "@storybook/react-vite";
import {expect, fn, userEvent, within} from "storybook/test";
import {Button, buttonSizes, buttonVariants} from "./Button";
import {Icon} from "../Icon/Icon";

const meta = {
  title: "Components/Button",
  component: Button,
  args: {children: "Save changes", onClick: fn()},
  argTypes: {
    variant: {control: "select", options: buttonVariants},
    size: {control: "select", options: buttonSizes},
    loading: {control: "boolean"},
    fullWidth: {control: "boolean"},
    disabled: {control: "boolean"},
    iconOnly: {control: false},
    leadingIcon: {control: false},
    trailingIcon: {control: false},
    onClick: {control: false},
    children: {control: "text"},
    ref: {control: false},
    className: {control: false},
    style: {control: false},
  },
} satisfies Meta<typeof Button>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  play: async ({canvasElement, args}) => {
    const button = within(canvasElement).getByRole("button", {name: "Save changes"});
    await userEvent.click(button);
    await expect(args.onClick).toHaveBeenCalledTimes(1);
  },
};

export const Variants: Story = {
  render: args => (
    <div style={{display: "flex", flexWrap: "wrap", gap: 12, alignItems: "center", maxWidth: 480}}>
      {buttonVariants.map(variant => <Button key={variant} {...args} variant={variant}>{variant}</Button>)}
    </div>
  ),
  parameters: {controls: {disable: true}},
};

export const Sizes: Story = {
  render: args => (
    <div style={{display: "flex", flexWrap: "wrap", gap: 12, alignItems: "center"}}>
      {buttonSizes.map(size => <Button key={size} {...args} size={size}>{size}</Button>)}
    </div>
  ),
  parameters: {controls: {disable: true}},
};

export const WithIcons: Story = {
  render: args => (
    <div style={{display: "flex", flexWrap: "wrap", gap: 12, alignItems: "center"}}>
      <Button {...args} leadingIcon={<Icon name="plus" />}>New item</Button>
      <Button {...args} variant="outline" trailingIcon={<Icon name="arrow-right" />}>Continue</Button>
      <Button {...args} variant="secondary" leadingIcon={<Icon name="download" />} trailingIcon={<Icon name="chevron-down" />}>Export</Button>
      <Button {...args} variant="ghost" iconOnly aria-label="Settings"><Icon name="settings" /></Button>
      <Button {...args} variant="destructive" size="sm" iconOnly aria-label="Delete"><Icon name="trash" /></Button>
    </div>
  ),
  parameters: {controls: {disable: true}},
  play: async ({canvasElement, args}) => {
    const canvas = within(canvasElement);
    // The text label names the button; its decorative icons add nothing to the name. Icon-only buttons are named by aria-label.
    await expect(canvas.getByRole("button", {name: "New item"})).toBeVisible();
    await userEvent.click(canvas.getByRole("button", {name: "Settings"}));
    await expect(args.onClick).toHaveBeenCalledTimes(1);
  },
};

export const Disabled: Story = {
  args: {disabled: true},
  play: async ({canvasElement, args}) => {
    const button = within(canvasElement).getByRole("button", {name: "Save changes"});
    await expect(button).toBeDisabled();
    await userEvent.click(button);
    await expect(args.onClick).not.toHaveBeenCalled();
    // Disabled buttons are skipped by the tab order.
    await userEvent.tab();
    await expect(button).not.toHaveFocus();
  },
};

// Loading keeps the button focusable (aria-disabled, not disabled) but ignores activation.
export const Loading: Story = {
  args: {loading: true, children: "Saving"},
  play: async ({canvasElement, args}) => {
    const button = within(canvasElement).getByRole("button", {name: /Saving/});
    await expect(button).toHaveAttribute("aria-busy", "true");
    await expect(button).toHaveAttribute("aria-disabled", "true");
    await expect(button).toBeEnabled();
    await userEvent.tab();
    await expect(button).toHaveFocus();
    await userEvent.click(button);
    await userEvent.keyboard("{Enter}");
    await expect(args.onClick).not.toHaveBeenCalled();
  },
};

export const FullWidth: Story = {
  args: {fullWidth: true},
  decorators: [Story => <div style={{width: 320}}><Story /></div>],
  play: async ({canvasElement}) => {
    const button = within(canvasElement).getByRole("button");
    await expect(Math.round(button.getBoundingClientRect().width)).toBe(320);
  },
};

export const KeyboardActivation: Story = {
  play: async ({canvasElement, args}) => {
    const button = within(canvasElement).getByRole("button", {name: "Save changes"});
    await userEvent.tab();
    await expect(button).toHaveFocus();
    await userEvent.keyboard("{Enter}");
    await userEvent.keyboard(" ");
    await expect(args.onClick).toHaveBeenCalledTimes(2);
  },
};

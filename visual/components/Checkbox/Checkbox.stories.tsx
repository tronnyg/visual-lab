import {useEffect, useState} from "react";
import type {ComponentType} from "react";
import type {Meta, StoryObj} from "@storybook/react-vite";
import {expect, fn, userEvent, within} from "storybook/test";
import {Checkbox} from "./Checkbox";
import type {CheckboxProps} from "./Checkbox";

// CheckboxProps requires a label or an aria-* name through a union that Storybook's arg types cannot express; stories use this flat shape.
type StoryProps = Omit<CheckboxProps, "label" | "aria-label" | "aria-labelledby"> & {label?: string; "aria-label"?: string};

// The component is controlled, so every story renders it with real state; `checked` in args only seeds that state.
function StatefulCheckbox({checked, onCheckedChange, ...rest}: StoryProps) {
  const [value, setValue] = useState(checked);
  useEffect(() => setValue(checked), [checked]);
  return <Checkbox {...(rest as CheckboxProps)} checked={value} onCheckedChange={(next, event) => { setValue(next); onCheckedChange?.(next, event); }} />;
}

const meta = {
  title: "Components/Checkbox",
  component: Checkbox as ComponentType<StoryProps>,
  render: args => <StatefulCheckbox {...args} />,
  args: {checked: false, label: "Subscribe to updates", onCheckedChange: fn()},
  argTypes: {
    label: {control: "text"},
    checked: {control: "boolean"},
    disabled: {control: "boolean"},
    onCheckedChange: {control: false},
    ref: {control: false},
    className: {control: false},
    style: {control: false},
  },
} satisfies Meta<StoryProps>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Unchecked: Story = {
  play: async ({canvasElement, args}) => {
    const checkbox = within(canvasElement).getByRole("checkbox", {name: "Subscribe to updates"});
    await expect(checkbox).not.toBeChecked();
    await userEvent.click(checkbox);
    await expect(checkbox).toBeChecked();
    await expect(args.onCheckedChange).toHaveBeenLastCalledWith(true, expect.anything());
    await userEvent.click(checkbox);
    await expect(checkbox).not.toBeChecked();
    await expect(args.onCheckedChange).toHaveBeenLastCalledWith(false, expect.anything());
  },
};

export const Checked: Story = {args: {checked: true}};

// The wrapper is a <label>, so clicking the text toggles the box.
export const ClickLabelText: Story = {
  play: async ({canvasElement}) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByText("Subscribe to updates"));
    await expect(canvas.getByRole("checkbox")).toBeChecked();
  },
};

export const KeyboardToggle: Story = {
  play: async ({canvasElement}) => {
    const checkbox = within(canvasElement).getByRole("checkbox");
    await userEvent.tab();
    await expect(checkbox).toHaveFocus();
    await userEvent.keyboard(" ");
    await expect(checkbox).toBeChecked();
  },
};

export const Disabled: Story = {
  args: {checked: true, disabled: true},
  play: async ({canvasElement, args}) => {
    const checkbox = within(canvasElement).getByRole("checkbox");
    await expect(checkbox).toBeDisabled();
    await userEvent.click(checkbox);
    await expect(checkbox).toBeChecked();
    await expect(args.onCheckedChange).not.toHaveBeenCalled();
  },
};

// Without a visible label, an aria-label provides the name.
export const WithoutVisibleLabel: Story = {
  args: {label: undefined, "aria-label": "Select row"},
  play: async ({canvasElement}) => {
    await expect(within(canvasElement).getByRole("checkbox", {name: "Select row"})).toBeVisible();
  },
};

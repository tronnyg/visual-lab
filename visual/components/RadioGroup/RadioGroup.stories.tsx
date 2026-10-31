import {useEffect, useState} from "react";
import type {ComponentType} from "react";
import type {Meta, StoryObj} from "@storybook/react-vite";
import {expect, fn, userEvent, within} from "storybook/test";
import {RadioGroup} from "./RadioGroup";
import type {RadioGroupOption, RadioGroupProps} from "./RadioGroup";

const plans: RadioGroupOption[] = [
  {label: "Free", value: "free"},
  {label: "Pro", value: "pro"},
  {label: "Team", value: "team"},
];

// RadioGroupProps requires a label or an aria-* name through a union that Storybook's arg types cannot express; stories use this flat shape.
type StoryProps = Omit<RadioGroupProps, "label" | "aria-label" | "aria-labelledby"> & {label?: string; "aria-label"?: string};

// The component is controlled, so every story renders it with real state; `value` in args only seeds that state.
function StatefulRadioGroup({value, onValueChange, ...rest}: StoryProps) {
  const [selected, setSelected] = useState(value);
  useEffect(() => setSelected(value), [value]);
  return <RadioGroup {...(rest as RadioGroupProps)} value={selected} onValueChange={(next, event) => { setSelected(next); onValueChange?.(next, event); }} />;
}

const meta = {
  title: "Components/RadioGroup",
  component: RadioGroup as ComponentType<StoryProps>,
  render: args => <StatefulRadioGroup {...args} />,
  args: {label: "Plan", options: plans, value: "free", onValueChange: fn()},
  argTypes: {
    label: {control: "text"},
    value: {control: "text"},
    options: {control: "object"},
    disabled: {control: "boolean"},
    onValueChange: {control: false},
    ref: {control: false},
    className: {control: false},
    style: {control: false},
  },
} satisfies Meta<StoryProps>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  play: async ({canvasElement}) => {
    const group = within(canvasElement).getByRole("group", {name: "Plan"});
    await expect(within(group).getByRole("radio", {name: "Free"})).toBeChecked();
    await expect(within(group).getAllByRole("radio")).toHaveLength(3);
  },
};

export const Selection: Story = {
  play: async ({canvasElement, args}) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole("radio", {name: "Pro"}));
    await expect(canvas.getByRole("radio", {name: "Pro"})).toBeChecked();
    await expect(canvas.getByRole("radio", {name: "Free"})).not.toBeChecked();
    await expect(args.onValueChange).toHaveBeenLastCalledWith("pro", expect.anything());
    // Clicking the label text selects too.
    await userEvent.click(canvas.getByText("Team"));
    await expect(canvas.getByRole("radio", {name: "Team"})).toBeChecked();
  },
};

// Native radios: Tab enters the group once, arrow keys move the selection.
export const KeyboardNavigation: Story = {
  play: async ({canvasElement, args}) => {
    const canvas = within(canvasElement);
    await userEvent.tab();
    await expect(canvas.getByRole("radio", {name: "Free"})).toHaveFocus();
    await userEvent.keyboard("{ArrowDown}");
    await expect(canvas.getByRole("radio", {name: "Pro"})).toBeChecked();
    await expect(args.onValueChange).toHaveBeenLastCalledWith("pro", expect.anything());
    await userEvent.keyboard("{ArrowDown}{ArrowDown}");
    // Wraps back to the first option.
    await expect(canvas.getByRole("radio", {name: "Free"})).toBeChecked();
  },
};

// A value that matches no option leaves every radio unchecked.
export const NoSelection: Story = {
  args: {value: ""},
  play: async ({canvasElement}) => {
    for (const radio of within(canvasElement).getAllByRole("radio")) await expect(radio).not.toBeChecked();
  },
};

export const DisabledOption: Story = {
  args: {options: [plans[0], {...plans[1], disabled: true}, plans[2]]},
  play: async ({canvasElement, args}) => {
    const canvas = within(canvasElement);
    const pro = canvas.getByRole("radio", {name: "Pro"});
    await expect(pro).toBeDisabled();
    await userEvent.click(pro);
    await expect(canvas.getByRole("radio", {name: "Free"})).toBeChecked();
    await expect(args.onValueChange).not.toHaveBeenCalled();
  },
};

export const DisabledGroup: Story = {
  args: {disabled: true, value: "pro"},
  play: async ({canvasElement, args}) => {
    const canvas = within(canvasElement);
    for (const radio of canvas.getAllByRole("radio")) await expect(radio).toBeDisabled();
    await userEvent.click(canvas.getByText("Team"));
    await expect(canvas.getByRole("radio", {name: "Pro"})).toBeChecked();
    await expect(args.onValueChange).not.toHaveBeenCalled();
  },
};

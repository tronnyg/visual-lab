import {useEffect, useState} from "react";
import type {ComponentType} from "react";
import type {Meta, StoryObj} from "@storybook/react-vite";
import {expect, fn, userEvent, within} from "storybook/test";
import {Select} from "./Select";
import type {SelectOption, SelectProps} from "./Select";

const fruit: SelectOption[] = [
  {label: "Apple", value: "apple"},
  {label: "Banana", value: "banana"},
  {label: "Cherry", value: "cherry"},
];

// SelectProps requires a label or an aria-* name through a union that Storybook's arg types cannot express; stories use this flat shape.
type StoryProps = Omit<SelectProps, "label" | "aria-label" | "aria-labelledby"> & {label?: string; "aria-label"?: string};

// The component is controlled, so every story renders it with real state; `value` in args only seeds that state.
function StatefulSelect({value, onValueChange, ...rest}: StoryProps) {
  const [selected, setSelected] = useState(value);
  useEffect(() => setSelected(value), [value]);
  return <Select {...(rest as SelectProps)} value={selected} onValueChange={(next, event) => { setSelected(next); onValueChange?.(next, event); }} />;
}

const meta = {
  title: "Components/Select",
  component: Select as ComponentType<StoryProps>,
  render: args => <StatefulSelect {...args} />,
  decorators: [Story => <div style={{width: 280}}><Story /></div>],
  args: {label: "Fruit", options: fruit, value: "apple", onValueChange: fn()},
  argTypes: {
    label: {control: "text"},
    placeholder: {control: "text"},
    disabled: {control: "boolean"},
    value: {control: "text"},
    options: {control: "object"},
    onValueChange: {control: false},
    ref: {control: false},
    className: {control: false},
    style: {control: false},
  },
} satisfies Meta<StoryProps>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

// `value` matches no option, so the placeholder shows and cannot be re-selected.
export const Placeholder: Story = {args: {value: "", placeholder: "Choose a fruit"}};

export const Disabled: Story = {
  args: {disabled: true},
  play: async ({canvasElement}) => {
    await expect(within(canvasElement).getByLabelText("Fruit")).toBeDisabled();
  },
};

export const DisabledOption: Story = {
  args: {options: [fruit[0], {...fruit[1], disabled: true}, fruit[2]]},
  play: async ({canvasElement}) => {
    const select = within(canvasElement).getByLabelText("Fruit");
    await expect(within(select).getByRole("option", {name: "Banana"})).toBeDisabled();
    await userEvent.selectOptions(select, "banana");
    await expect(select).toHaveValue("apple");
  },
};

export const Controlled: Story = {
  args: {value: "", placeholder: "Choose a fruit"},
  play: async ({canvasElement, args}) => {
    const select = within(canvasElement).getByLabelText("Fruit");
    await userEvent.selectOptions(select, "cherry");
    await expect(select).toHaveValue("cherry");
    await expect(select).toHaveDisplayValue("Cherry");
    await expect(args.onValueChange).toHaveBeenCalledWith("cherry", expect.anything());
    await userEvent.selectOptions(select, "banana");
    await expect(select).toHaveDisplayValue("Banana");
  },
};

export const Dark: Story = {globals: {theme: "dark"}};

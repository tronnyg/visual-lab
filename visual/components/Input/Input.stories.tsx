import {useEffect, useState} from "react";
import type {ComponentType} from "react";
import type {Meta, StoryObj} from "@storybook/react-vite";
import {expect, fn, userEvent, within} from "storybook/test";
import {Input} from "./Input";
import type {InputProps} from "./Input";

// InputProps requires a label or an aria-* name through a union that Storybook's arg types cannot express; stories use this flat shape.
type StoryProps = Omit<InputProps, "label" | "aria-label" | "aria-labelledby"> & {label?: string; "aria-label"?: string};

// The component is controlled, so every story renders it with real state; `value` in args only seeds that state.
function StatefulInput({value, onChange, ...rest}: StoryProps) {
  const [text, setText] = useState(value);
  useEffect(() => setText(value), [value]);
  return <Input {...(rest as InputProps)} value={text} onChange={e => { setText(e.target.value); onChange?.(e); }} />;
}

const meta = {
  title: "Components/Input",
  component: Input as ComponentType<StoryProps>,
  render: args => <StatefulInput {...args} />,
  decorators: [Story => <div style={{width: 280}}><Story /></div>],
  args: {value: "", onChange: fn()},
  argTypes: {
    label: {control: "text"},
    placeholder: {control: "text"},
    disabled: {control: "boolean"},
    value: {control: "text"},
    onChange: {control: false},
    ref: {control: false},
    className: {control: false},
    style: {control: false},
  },
} satisfies Meta<StoryProps>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {args: {"aria-label": "Name"}};

export const WithLabel: Story = {args: {label: "Name"}};

// Without a label the placeholder is the accessible name.
export const WithPlaceholder: Story = {args: {placeholder: "Enter your name"}};

export const Controlled: Story = {
  args: {label: "Name", value: "Ada"},
  play: async ({canvasElement, args}) => {
    const input = within(canvasElement).getByLabelText("Name");
    await userEvent.clear(input);
    await userEvent.type(input, "Grace Hopper");
    await expect(input).toHaveValue("Grace Hopper");
    await expect(args.onChange).toHaveBeenCalled();
  },
};

export const Disabled: Story = {
  args: {label: "Name", value: "Read only", disabled: true},
  play: async ({canvasElement}) => {
    const input = within(canvasElement).getByLabelText("Name");
    await expect(input).toBeDisabled();
    await userEvent.type(input, "edited");
    await expect(input).toHaveValue("Read only");
  },
};

export const KeyboardFocus: Story = {
  args: {label: "Name"},
  play: async ({canvasElement}) => {
    const input = within(canvasElement).getByLabelText("Name");
    await userEvent.tab();
    await expect(input).toHaveFocus();
    await userEvent.keyboard("tab order");
    await expect(input).toHaveValue("tab order");
  },
};

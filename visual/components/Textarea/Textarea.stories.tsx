import {useEffect, useState} from "react";
import type {ComponentType} from "react";
import type {Meta, StoryObj} from "@storybook/react-vite";
import {expect, fn, userEvent, within} from "storybook/test";
import {Textarea} from "./Textarea";
import type {TextareaProps} from "./Textarea";

// TextareaProps requires a label or an aria-* name through a union that Storybook's arg types cannot express; stories use this flat shape.
type StoryProps = Omit<TextareaProps, "label" | "aria-label" | "aria-labelledby"> & {label?: string; "aria-label"?: string};

// The component is controlled, so every story renders it with real state; `value` in args only seeds that state.
function StatefulTextarea({value, onChange, ...rest}: StoryProps) {
  const [text, setText] = useState(value);
  useEffect(() => setText(value), [value]);
  return <Textarea {...(rest as TextareaProps)} value={text} onChange={e => { setText(e.target.value); onChange?.(e); }} />;
}

const meta = {
  title: "Components/Textarea",
  component: Textarea as ComponentType<StoryProps>,
  render: args => <StatefulTextarea {...args} />,
  decorators: [Story => <div style={{width: 320}}><Story /></div>],
  args: {value: "", onChange: fn()},
  argTypes: {
    label: {control: "text"},
    placeholder: {control: "text"},
    rows: {control: {type: "number", min: 1, max: 12}},
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

export const WithLabel: Story = {args: {label: "Notes"}};

// Without a label the placeholder is the accessible name.
export const WithPlaceholder: Story = {
  args: {placeholder: "Write a note"},
  play: async ({canvasElement}) => {
    await expect(within(canvasElement).getByRole("textbox", {name: "Write a note"})).toBeVisible();
  },
};

export const Controlled: Story = {
  args: {label: "Notes", value: "First line"},
  play: async ({canvasElement, args}) => {
    const textarea = within(canvasElement).getByLabelText("Notes");
    await userEvent.clear(textarea);
    await userEvent.type(textarea, "Line one{enter}Line two");
    await expect(textarea).toHaveValue("Line one\nLine two");
    await expect(args.onChange).toHaveBeenCalled();
  },
};

export const Rows: Story = {
  args: {label: "Notes", rows: 6},
  play: async ({canvasElement}) => {
    await expect(within(canvasElement).getByLabelText("Notes")).toHaveAttribute("rows", "6");
  },
};

export const Disabled: Story = {
  args: {label: "Notes", value: "Read only", disabled: true},
  play: async ({canvasElement}) => {
    const textarea = within(canvasElement).getByLabelText("Notes");
    await expect(textarea).toBeDisabled();
    await userEvent.type(textarea, "edited");
    await expect(textarea).toHaveValue("Read only");
  },
};

import {useEffect, useState} from "react";
import type {ComponentType} from "react";
import type {Meta, StoryObj} from "@storybook/react-vite";
import {expect, fireEvent, fn, userEvent, within} from "storybook/test";
import {Slider} from "./Slider";
import type {SliderProps} from "./Slider";

// SliderProps requires a label or an aria-* name through a union that Storybook's arg types cannot express; stories use this flat shape.
type StoryProps = Omit<SliderProps, "label" | "aria-label" | "aria-labelledby"> & {label?: string; "aria-label"?: string};

// The component is controlled, so every story renders it with real state; `value` in args only seeds that state.
function StatefulSlider({value, onValueChange, ...rest}: StoryProps) {
  const [current, setCurrent] = useState(value);
  useEffect(() => setCurrent(value), [value]);
  return <Slider {...(rest as SliderProps)} value={current} onValueChange={(next, event) => { setCurrent(next); onValueChange?.(next, event); }} />;
}

const meta = {
  title: "Components/Slider",
  component: Slider as ComponentType<StoryProps>,
  render: args => <StatefulSlider {...args} />,
  decorators: [Story => <div style={{width: 280}}><Story /></div>],
  args: {label: "Volume", value: 40, onValueChange: fn()},
  argTypes: {
    label: {control: "text"},
    value: {control: "number"},
    min: {control: "number"},
    max: {control: "number"},
    step: {control: "number"},
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
    const slider = within(canvasElement).getByRole("slider", {name: "Volume"});
    await expect(slider).toHaveValue("40");
    await expect(slider).toHaveAttribute("min", "0");
    await expect(slider).toHaveAttribute("max", "100");
  },
};

// user-event does not emulate the browser's arrow-key stepping on a range input, so the value is driven with change events (as the browser fires them)
// and keyboard access is checked through focus.
export const KeyboardFocus: Story = {
  play: async ({canvasElement}) => {
    const slider = within(canvasElement).getByRole("slider", {name: "Volume"});
    await userEvent.tab();
    await expect(slider).toHaveFocus();
  },
};

export const Controlled: Story = {
  play: async ({canvasElement, args}) => {
    const canvas = within(canvasElement);
    const slider = canvas.getByRole("slider", {name: "Volume"});
    fireEvent.change(slider, {target: {value: "75"}});
    await expect(slider).toHaveValue("75");
    await expect(args.onValueChange).toHaveBeenLastCalledWith(75, expect.anything());
    // The displayed value follows the state.
    await expect(canvas.getByText("75")).toBeInTheDocument();
  },
};

// A custom range and step: the browser clamps to the range and snaps to multiples of the step from the minimum.
export const CustomRangeAndStep: Story = {
  args: {label: "Temperature", min: 10, max: 30, step: 5, value: 15},
  play: async ({canvasElement}) => {
    const slider = within(canvasElement).getByRole("slider", {name: "Temperature"});
    await expect(slider).toHaveAttribute("min", "10");
    await expect(slider).toHaveAttribute("max", "30");
    await expect(slider).toHaveAttribute("step", "5");
    fireEvent.change(slider, {target: {value: "27"}});
    await expect(slider).toHaveValue("25");
    fireEvent.change(slider, {target: {value: "99"}});
    await expect(slider).toHaveValue("30");
  },
};

export const AtMinimum: Story = {args: {value: 0}};

export const AtMaximum: Story = {args: {value: 100}};

export const Disabled: Story = {
  args: {disabled: true},
  play: async ({canvasElement, args}) => {
    const slider = within(canvasElement).getByRole("slider", {name: "Volume"});
    await expect(slider).toBeDisabled();
    await userEvent.tab();
    await expect(slider).not.toHaveFocus();
    await expect(args.onValueChange).not.toHaveBeenCalled();
  },
};

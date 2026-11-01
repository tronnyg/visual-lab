import {useState} from "react";
import type {ComponentType} from "react";
import type {Meta, StoryObj} from "@storybook/react-vite";
import {expect, fn, userEvent, within} from "storybook/test";
import {Switch} from "./Switch";
import type {SwitchProps} from "./Switch";

// SwitchProps requires a label or an aria-* name through a union that Storybook's arg types cannot express; stories use this flat shape.
type StoryProps = Omit<SwitchProps, "label" | "aria-label" | "aria-labelledby"> & {label?: string; "aria-label"?: string};

const meta = {
  title: "Components/Switch",
  component: Switch as ComponentType<StoryProps>,
  args: {label: "Email notifications", onCheckedChange: fn()},
  argTypes: {
    label: {control: "text"},
    checked: {control: "boolean"},
    defaultChecked: {control: "boolean"},
    disabled: {control: "boolean"},
    required: {control: "boolean"},
    onCheckedChange: {control: false},
    ref: {control: false},
    className: {control: false},
    style: {control: false},
  },
} satisfies Meta<StoryProps>;

export default meta;
type Story = StoryObj<typeof meta>;

// Uncontrolled: the browser owns the state, the callback reports user changes.
export const Off: Story = {
  play: async ({canvasElement, args}) => {
    const control = within(canvasElement).getByRole("switch", {name: "Email notifications"});
    await expect(control).not.toBeChecked();
    await userEvent.click(control);
    await expect(control).toBeChecked();
    await expect(args.onCheckedChange).toHaveBeenLastCalledWith(true, expect.anything());
    await userEvent.click(control);
    await expect(control).not.toBeChecked();
    await expect(args.onCheckedChange).toHaveBeenLastCalledWith(false, expect.anything());
  },
};

export const On: Story = {
  args: {defaultChecked: true},
  play: async ({canvasElement, args}) => {
    await expect(within(canvasElement).getByRole("switch")).toBeChecked();
    await expect(args.onCheckedChange).not.toHaveBeenCalled();
  },
};

function ControlledSwitch({onCheckedChange}: {onCheckedChange?: StoryProps["onCheckedChange"]}) {
  const [on, setOn] = useState(false);
  return (
    <div style={{display: "grid", gap: 8}}>
      <Switch label="Dark mode" checked={on} onCheckedChange={(next, event) => { setOn(next); onCheckedChange?.(next, event); }} />
      <span>{on ? "Dark mode is on" : "Dark mode is off"}</span>
    </div>
  );
}

export const Controlled: Story = {
  render: args => <ControlledSwitch onCheckedChange={args.onCheckedChange} />,
  play: async ({canvasElement}) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole("switch", {name: "Dark mode"}));
    await expect(canvas.getByText("Dark mode is on")).toBeVisible();
    await expect(canvas.getByRole("switch")).toBeChecked();
  },
};

// A controlled value is authoritative: when the parent does not accept the change the switch snaps back.
export const ControlledStaysAuthoritative: Story = {
  args: {checked: false},
  play: async ({canvasElement, args}) => {
    const control = within(canvasElement).getByRole("switch");
    await userEvent.click(control);
    await expect(args.onCheckedChange).toHaveBeenCalledWith(true, expect.anything());
    await expect(control).not.toBeChecked();
  },
};

export const KeyboardToggle: Story = {
  play: async ({canvasElement}) => {
    const control = within(canvasElement).getByRole("switch");
    await userEvent.tab();
    await expect(control).toHaveFocus();
    await userEvent.keyboard(" ");
    await expect(control).toBeChecked();
    await userEvent.keyboard(" ");
    await expect(control).not.toBeChecked();
  },
};

export const ClickLabelText: Story = {
  play: async ({canvasElement}) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByText("Email notifications"));
    await expect(canvas.getByRole("switch")).toBeChecked();
  },
};

export const Disabled: Story = {
  args: {defaultChecked: true, disabled: true},
  play: async ({canvasElement, args}) => {
    const control = within(canvasElement).getByRole("switch");
    await expect(control).toBeDisabled();
    await userEvent.click(control);
    await expect(control).toBeChecked();
    await expect(args.onCheckedChange).not.toHaveBeenCalled();
  },
};

export const WithoutVisibleLabel: Story = {
  args: {label: undefined, "aria-label": "Enable sync"},
  play: async ({canvasElement}) => {
    await expect(within(canvasElement).getByRole("switch", {name: "Enable sync"})).toBeVisible();
  },
};

function FormHarness({switchProps}: {switchProps: StoryProps}) {
  const [result, setResult] = useState("");
  return (
    <form
      aria-label="Settings"
      onSubmit={event => {
        event.preventDefault();
        setResult(JSON.stringify(Array.from(new FormData(event.currentTarget).entries())));
      }}
    >
      <Switch {...(switchProps as SwitchProps)} />
      <button type="submit">Save</button>
      <output>{result}</output>
    </form>
  );
}

// An on switch submits name=value (default "on"); an off one submits nothing.
export const FormData_: Story = {
  name: "FormData",
  render: () => <FormHarness switchProps={{label: "Email notifications", name: "email", value: "yes"}} />,
  play: async ({canvasElement}) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole("button", {name: "Save"}));
    await expect(canvas.getByRole("status")).toHaveTextContent("[]");
    await userEvent.click(canvas.getByRole("switch"));
    await userEvent.click(canvas.getByRole("button", {name: "Save"}));
    await expect(canvas.getByRole("status")).toHaveTextContent('[["email","yes"]]');
  },
};

// The browser restores an uncontrolled switch to defaultChecked when its form is reset.
export const FormReset: Story = {
  render: () => (
    <form aria-label="Settings">
      <Switch label="Sync" name="sync" defaultChecked />
      <button type="reset">Reset</button>
    </form>
  ),
  play: async ({canvasElement}) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole("switch"));
    await expect(canvas.getByRole("switch")).not.toBeChecked();
    await userEvent.click(canvas.getByRole("button", {name: "Reset"}));
    await expect(canvas.getByRole("switch")).toBeChecked();
  },
};

// `required` is native constraint validation: the form is invalid until the switch is on.
export const Required: Story = {
  render: () => (
    <form aria-label="Terms">
      <Switch label="Accept the terms" name="terms" required />
    </form>
  ),
  play: async ({canvasElement}) => {
    const canvas = within(canvasElement);
    const control = canvas.getByRole("switch");
    await expect(control).toBeRequired();
    await expect((canvasElement.querySelector("form") as HTMLFormElement).checkValidity()).toBe(false);
    await userEvent.click(control);
    await expect((canvasElement.querySelector("form") as HTMLFormElement).checkValidity()).toBe(true);
  },
};

export const Invalid: Story = {args: {"aria-invalid": true, defaultChecked: true}};

export const Dark: Story = {
  globals: {theme: "dark"},
  render: () => (
    <div style={{display: "grid", gap: 12}}>
      <Switch label="Off" />
      <Switch label="On" defaultChecked />
      <Switch label="Disabled" disabled />
      <Switch label="Disabled on" disabled defaultChecked />
    </div>
  ),
};

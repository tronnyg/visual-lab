import type {Meta, StoryObj} from "@storybook/react-vite";
import {expect, userEvent, within} from "storybook/test";
import {FormGroup} from "./FormGroup";
import {Checkbox} from "../Checkbox/Checkbox";
import {RadioGroup} from "../RadioGroup/RadioGroup";
import {Switch} from "../Switch/Switch";
import {Input} from "../Input/Input";

const meta = {
  title: "Components/FormGroup",
  component: FormGroup,
  decorators: [Story => <div style={{width: 360}}><Story /></div>],
  args: {legend: "Notify me by", children: null},
  argTypes: {
    legend: {control: "text"},
    description: {control: "text"},
    error: {control: "text"},
    required: {control: "boolean"},
    disabled: {control: "boolean"},
    orientation: {control: "inline-radio", options: ["vertical", "horizontal"]},
    children: {control: false},
    ref: {control: false},
  },
} satisfies Meta<typeof FormGroup>;

export default meta;
type Story = StoryObj<typeof meta>;

const noop = () => {};
const channels = (
  <>
    <Checkbox checked onCheckedChange={noop} label="Email" />
    <Checkbox checked={false} onCheckedChange={noop} label="Text message" />
    <Checkbox checked={false} onCheckedChange={noop} label="Push notification" />
  </>
);

export const MultipleCheckboxes: Story = {
  args: {description: "Choose any that apply."},
  render: args => <FormGroup {...args}>{channels}</FormGroup>,
  play: async ({canvasElement}) => {
    const canvas = within(canvasElement);
    const group = canvas.getByRole("group", {name: "Notify me by"});
    await expect(group.tagName).toBe("FIELDSET");
    await expect(group).toHaveAccessibleDescription("Choose any that apply.");
    await expect(within(group).getAllByRole("checkbox")).toHaveLength(3);
    await expect(canvasElement.querySelector("legend")).toHaveTextContent("Notify me by");
  },
};

export const WithRadioGroup: Story = {
  args: {legend: "Billing", description: "Applies from the next cycle."},
  render: args => (
    <FormGroup {...args}>
      <RadioGroup label="Billing period" name="period" value="monthly" onValueChange={noop} options={[{label: "Monthly", value: "monthly"}, {label: "Yearly", value: "yearly"}]} />
      <Switch label="Email me invoices" defaultChecked />
    </FormGroup>
  ),
  play: async ({canvasElement}) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByRole("group", {name: "Billing"})).toBeVisible();
    // The nested radio group keeps its own name and behaviour inside the outer group.
    await expect(canvas.getByRole("group", {name: "Billing period"})).toBeVisible();
    await userEvent.click(canvas.getByRole("switch", {name: "Email me invoices"}));
    await expect(canvas.getByRole("switch")).not.toBeChecked();
  },
};

export const SwitchGroup: Story = {
  args: {legend: "Alerts"},
  render: args => (
    <FormGroup {...args}>
      <Switch label="Mail" defaultChecked />
      <Switch label="Chat" />
      <Switch label="Calls" />
    </FormGroup>
  ),
  play: async ({canvasElement}) => {
    const group = within(canvasElement).getByRole("group", {name: "Alerts"});
    await expect(within(group).getAllByRole("switch")).toHaveLength(3);
  },
};

export const Vertical: Story = {
  render: args => <FormGroup {...args} orientation="vertical">{channels}</FormGroup>,
  play: async ({canvasElement}) => {
    const [first, second] = within(canvasElement).getAllByRole("checkbox").map(box => box.getBoundingClientRect());
    await expect(second.top).toBeGreaterThan(first.bottom - 1);
  },
};

export const Horizontal: Story = {
  render: args => <FormGroup {...args} orientation="horizontal">{channels}</FormGroup>,
  play: async ({canvasElement}) => {
    const [first, second] = within(canvasElement).getAllByRole("checkbox").map(box => box.getBoundingClientRect());
    await expect(second.left).toBeGreaterThan(first.right - 1);
    await expect(Math.abs(second.top - first.top)).toBeLessThan(4);
  },
};

// Horizontal controls wrap instead of overflowing in a narrow container.
export const HorizontalNarrowWraps: Story = {
  decorators: [Story => <div style={{width: 200}}><Story /></div>],
  render: args => <FormGroup {...args} orientation="horizontal">{channels}</FormGroup>,
  play: async ({canvasElement}) => {
    const root = canvasElement.querySelector("fieldset")!;
    await expect(root.scrollWidth).toBeLessThanOrEqual(root.clientWidth);
    const tops = new Set(within(canvasElement).getAllByRole("checkbox").map(box => Math.round(box.getBoundingClientRect().top)));
    await expect(tops.size).toBeGreaterThan(1);
  },
};

export const Disabled: Story = {
  args: {disabled: true, description: "Only admins can change these."},
  render: args => <FormGroup {...args}>{channels}<Switch label="Mute all" /></FormGroup>,
  play: async ({canvasElement}) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByRole("group", {name: "Notify me by"})).toBeDisabled();
    // The browser disables every control inside, whatever component rendered it.
    for (const control of [...canvas.getAllByRole("checkbox"), canvas.getByRole("switch")]) await expect(control).toBeDisabled();
  },
};

export const WithError: Story = {
  args: {error: "Choose at least one", description: "Choose any that apply."},
  render: args => <FormGroup {...args}>{channels}</FormGroup>,
  play: async ({canvasElement}) => {
    const canvas = within(canvasElement);
    const group = canvas.getByRole("group", {name: "Notify me by"});
    // The error is text ("Error: ...") in a live region, not just colour, and describes the group after the help text.
    await expect(group).toHaveAccessibleDescription("Choose any that apply. Error: Choose at least one");
    await expect(canvas.getByText("Choose at least one").closest("[aria-live]")).toHaveAttribute("aria-live", "polite");
  },
};

export const Required: Story = {
  args: {required: true},
  render: args => <FormGroup {...args}>{channels}</FormGroup>,
  play: async ({canvasElement}) => {
    const canvas = within(canvasElement);
    // Announced once, in the legend; the asterisk is decoration and nothing is set on the individual controls.
    await expect(canvas.getByRole("group", {name: "Notify me by (required)"})).toBeVisible();
    await expect(canvas.getByText("*")).toHaveAttribute("aria-hidden", "true");
    for (const box of canvas.getAllByRole("checkbox")) await expect(box).not.toBeRequired();
  },
};

export const NativeGroupOfInputs: Story = {
  args: {legend: "Shipping address"},
  render: args => (
    <FormGroup {...args}>
      <Input value="" onChange={noop} label="Street" />
      <Input value="" onChange={noop} label="City" />
    </FormGroup>
  ),
  play: async ({canvasElement}) => {
    const group = within(canvasElement).getByRole("group", {name: "Shipping address"});
    await expect(within(group).getByRole("textbox", {name: "Street"})).toBeVisible();
    const ids = Array.from(canvasElement.querySelectorAll("[id]")).map(element => element.id);
    await expect(ids.filter((id, index) => ids.indexOf(id) !== index)).toEqual([]);
  },
};

export const Dark: Story = {
  globals: {theme: "dark"},
  args: {error: "Choose at least one", description: "Choose any that apply.", required: true},
  render: args => <FormGroup {...args}>{channels}</FormGroup>,
};

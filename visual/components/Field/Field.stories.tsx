import {useState} from "react";
import type {Meta, StoryObj} from "@storybook/react-vite";
import {expect, userEvent, waitFor, within} from "storybook/test";
import {Field} from "./Field";
import {Input} from "../Input/Input";
import {Select} from "../Select/Select";
import {Switch} from "../Switch/Switch";
import {DatePicker} from "../DatePicker/DatePicker";
import {Combobox} from "../Combobox/Combobox";
import {Textarea} from "../Textarea/Textarea";

const meta = {
  title: "Components/Field",
  component: Field,
  decorators: [Story => <div style={{width: 320}}><Story /></div>],
  args: {label: "Email", children: null},
  argTypes: {
    label: {control: "text"},
    description: {control: "text"},
    error: {control: "text"},
    required: {control: "boolean"},
    disabled: {control: "boolean"},
    children: {control: false},
    ref: {control: false},
  },
} satisfies Meta<typeof Field>;

export default meta;
type Story = StoryObj<typeof meta>;

const noop = () => {};
const duplicateIds = (root: HTMLElement) => {
  const ids = Array.from(root.querySelectorAll("[id]")).map(element => element.id);
  return ids.filter((id, index) => ids.indexOf(id) !== index);
};

// The Field label names the control: getByLabelText finds it through <label for>.
export const WithInput: Story = {
  render: args => <Field {...args}><Input value="" onChange={noop} aria-label="Email" placeholder="you@example.com" /></Field>,
  play: async ({canvasElement}) => {
    const canvas = within(canvasElement);
    const input = canvas.getByLabelText("Email");
    await expect(input).toHaveRole("textbox");
    await expect(canvas.getByText("Email").tagName).toBe("LABEL");
    await expect(canvas.getByText("Email")).toHaveAttribute("for", input.id);
    await expect(duplicateIds(canvasElement)).toEqual([]);
  },
};

// A control with no label or aria-label of its own is named by the Field alone.
export const LabelNamesTheControl: Story = {
  render: args => <Field {...args}><Input value="" onChange={noop} aria-label="Text input" /></Field>,
  play: async ({canvasElement}) => {
    const canvas = within(canvasElement);
    // The generic aria-label is outranked by the visible label through aria-labelledby.
    await expect(canvas.getByRole("textbox")).toHaveAccessibleName("Email");
    await expect(canvas.getByRole("textbox")).toHaveAttribute("aria-labelledby", expect.stringContaining("-label"));
  },
};

export const WithDescription: Story = {
  args: {description: "We only use it to send receipts."},
  render: args => <Field {...args}><Input value="" onChange={noop} aria-label="Email" /></Field>,
  play: async ({canvasElement}) => {
    const input = within(canvasElement).getByRole("textbox");
    await expect(input).toHaveAccessibleDescription("We only use it to send receipts.");
    await expect(input).not.toHaveAttribute("aria-invalid");
  },
};

export const WithError: Story = {
  args: {description: "We only use it to send receipts.", error: "Enter a valid email address"},
  render: args => <Field {...args}><Input value="nope" onChange={noop} aria-label="Email" /></Field>,
  play: async ({canvasElement}) => {
    const canvas = within(canvasElement);
    const input = canvas.getByRole("textbox");
    await expect(input).toBeInvalid();
    await expect(input).toHaveAttribute("aria-invalid", "true");
    // Description first, then the error; the error is text ("Error: ..."), not only colour, and sits in a live region.
    await expect(input).toHaveAccessibleDescription("We only use it to send receipts. Error: Enter a valid email address");
    await expect(canvas.getByText("Enter a valid email address").closest("[aria-live]")).toHaveAttribute("aria-live", "polite");
    await expect(duplicateIds(canvasElement)).toEqual([]);
  },
};

function ErrorToggle() {
  const [value, setValue] = useState("");
  return (
    <Field label="Email" error={value.includes("@") ? undefined : "Enter a valid email address"}>
      <Input value={value} onChange={event => setValue(event.target.value)} aria-label="Email" />
    </Field>
  );
}

// The error is applied and taken away again as it changes, and what Field added does not linger.
export const ErrorAppearsAndClears: Story = {
  render: () => <ErrorToggle />,
  play: async ({canvasElement}) => {
    const canvas = within(canvasElement);
    const input = canvas.getByRole("textbox");
    await expect(input).toHaveAttribute("aria-invalid", "true");
    await userEvent.type(input, "ada@example.com");
    await waitFor(() => expect(input).not.toHaveAttribute("aria-invalid"));
    await expect(input).not.toHaveAttribute("aria-describedby");
    await userEvent.clear(input);
    await waitFor(() => expect(input).toHaveAttribute("aria-invalid", "true"));
    await expect(input).toHaveAccessibleDescription(/Enter a valid email address/);
  },
};

export const Required: Story = {
  args: {required: true},
  render: args => <Field {...args}><Input value="" onChange={noop} aria-label="Email" /></Field>,
  play: async ({canvasElement}) => {
    const canvas = within(canvasElement);
    const input = canvas.getByRole("textbox");
    // Required is announced once, by the control; the asterisk is decoration.
    await expect(input).toBeRequired();
    await expect(canvas.getByText("*")).toHaveAttribute("aria-hidden", "true");
    await expect(input).toHaveAccessibleName("Email");
  },
};

// Existing attributes are kept: a control's own aria-describedby, aria-invalid and id survive and are extended, not replaced.
export const DoesNotOverwriteExistingAttributes: Story = {
  args: {description: "Help", error: "Bad"},
  render: args => (
    <Field {...args}>
      <input id="own-id" aria-describedby="own-hint" aria-invalid="false" aria-label="Email" />
      <p id="own-hint">Own hint</p>
    </Field>
  ),
  play: async ({canvasElement}) => {
    const canvas = within(canvasElement);
    const input = canvas.getByRole("textbox");
    await expect(input.id).toBe("own-id");
    await expect(canvas.getByText("Email", {selector: "label"})).toHaveAttribute("for", "own-id");
    await expect(input).toHaveAttribute("aria-invalid", "false");
    await expect(input).toHaveAccessibleDescription(/Own hint.*Help.*Bad/);
  },
};

export const ExplicitControlId: Story = {
  args: {controlId: "second"},
  render: args => (
    <Field {...args}>
      <input aria-label="Decoy" />
      <input id="second" aria-label="Second" />
    </Field>
  ),
  play: async ({canvasElement}) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByLabelText("Email", {selector: "#second"})).toBeVisible();
    await expect(canvasElement.querySelector("input:not(#second)")).not.toHaveAttribute("aria-describedby");
  },
};

// Without a control the label is plain text: it does not pretend to name something.
export const NoControlFound: Story = {
  render: args => <Field {...args}><p>Read only text</p></Field>,
  play: async ({canvasElement}) => {
    await expect(within(canvasElement).getByText("Email").tagName).toBe("SPAN");
    await expect(canvasElement.querySelector("label")).toBeNull();
  },
};

export const WithTextarea: Story = {
  args: {label: "Notes", description: "Visible to your team."},
  render: args => <Field {...args}><Textarea value="" onChange={noop} aria-label="Notes" /></Field>,
  play: async ({canvasElement}) => {
    const area = within(canvasElement).getByRole("textbox");
    await expect(area.tagName).toBe("TEXTAREA");
    await expect(area).toHaveAccessibleName("Notes");
    await expect(area).toHaveAccessibleDescription("Visible to your team.");
  },
};

export const WithSelect: Story = {
  args: {label: "Plan", description: "Billing starts after the trial.", required: true},
  render: args => (
    <Field {...args}>
      <Select aria-label="Select" value="team" onValueChange={noop} options={[{label: "Free", value: "free"}, {label: "Team", value: "team"}]} />
    </Field>
  ),
  play: async ({canvasElement}) => {
    const select = within(canvasElement).getByRole("combobox");
    await expect(select).toHaveAccessibleName("Plan");
    await expect(select).toBeRequired();
    await expect(select).toHaveAccessibleDescription("Billing starts after the trial.");
  },
};

export const WithSwitch: Story = {
  args: {label: "Notifications", description: "Applies immediately."},
  render: args => <Field {...args}><Switch label="Email me about changes" defaultChecked /></Field>,
  play: async ({canvasElement}) => {
    const toggle = within(canvasElement).getByRole("switch");
    // The setting's name comes from the Field label and the switch keeps its own text.
    await expect(toggle).toHaveAccessibleName(/Notifications/);
    await expect(toggle).toHaveAccessibleName(/Email me about changes/);
    await expect(toggle).toHaveAccessibleDescription("Applies immediately.");
  },
};

export const WithDatePicker: Story = {
  args: {label: "Due date", description: "Pick a day this year.", error: "Choose a date", required: true},
  render: args => <Field {...args}><DatePicker aria-label="Date" /></Field>,
  play: async ({canvasElement}) => {
    const canvas = within(canvasElement);
    const input = canvas.getByRole("textbox", {name: "Due date"});
    await expect(input).toBeRequired();
    await expect(input).toHaveAttribute("aria-invalid", "true");
    // The picker's own format hint is kept alongside the Field's description and error.
    await expect(input).toHaveAccessibleDescription(/Format YYYY-MM-DD.*Pick a day this year.*Choose a date/);
  },
};

export const WithCombobox: Story = {
  args: {label: "Owner", description: "Who is responsible?"},
  render: args => <Field {...args}><Combobox aria-label="Combobox" options={[{value: "ada", label: "Ada"}, {value: "grace", label: "Grace"}]} /></Field>,
  play: async ({canvasElement}) => {
    const canvas = within(canvasElement);
    const box = canvas.getByRole("combobox", {name: "Owner"});
    await expect(box).toHaveAccessibleDescription("Who is responsible?");
    await userEvent.click(box);
    await userEvent.click(canvas.getByRole("option", {name: "Grace"}));
    await expect(box).toHaveValue("Grace");
  },
};

export const Disabled: Story = {
  args: {disabled: true, description: "Assigned automatically."},
  render: args => (
    <Field {...args}>
      <DatePicker aria-label="Date" defaultValue="2026-03-15" />
    </Field>
  ),
  play: async ({canvasElement}) => {
    const canvas = within(canvasElement);
    // Every control inside is disabled, including the picker's calendar button, which a prop on the input could not reach.
    await expect(canvas.getByRole("textbox")).toBeDisabled();
    await expect(canvas.getByRole("button", {name: /Change date/})).toBeDisabled();
  },
};

export const Dark: Story = {
  globals: {theme: "dark"},
  args: {description: "We only use it to send receipts.", error: "Enter a valid email address", required: true},
  render: args => <Field {...args}><Input value="nope" onChange={noop} aria-label="Email" /></Field>,
};

import type {Meta, StoryObj} from "@storybook/react-vite";
import {Renderer} from "@openuidev/react-lang";
import type {ActionEvent} from "@openuidev/react-lang";
import {expect, fn, userEvent, waitFor, within} from "storybook/test";
import {library} from "../library";

// Permanent regression tests for how the form components behave when rendered by the real OpenUI Renderer: `$variable` bindings,
// child references and the existing actions. The plain React behaviour of each component is covered by its own stories.
function Program({code, onAction}: {code: string; onAction?: (event: ActionEvent) => void}) {
  return <Renderer response={code} library={library} onAction={onAction} />;
}

const meta = {
  title: "OpenUI/Forms",
  component: Program,
  parameters: {layout: "centered"},
  tags: ["!autodocs"],
  args: {code: "", onAction: fn()},
} satisfies Meta<typeof Program>;

export default meta;
type Story = StoryObj<typeof meta>;

export const SwitchBinding: Story = {
  args: {
    code: [
      "$push = false",
      "root = Stack([toggle, status, reset], \"sm\")",
      "toggle = Switch($push, \"Push notifications\")",
      "status = Text($push ? \"Push is on\" : \"Push is off\")",
      "reset = Button(\"Reset\", false, \"outline\", \"default\", false, false, null, null, @Reset($push))",
    ].join("\n"),
  },
  play: async ({canvasElement}) => {
    const canvas = within(canvasElement);
    const toggle = await canvas.findByRole("switch", {name: "Push notifications"});
    await expect(toggle).not.toBeChecked();
    await userEvent.click(toggle);
    await waitFor(() => expect(canvas.getByText("Push is on")).toBeVisible());
    await expect(toggle).toBeChecked();
    await userEvent.click(canvas.getByRole("button", {name: "Reset"}));
    await waitFor(() => expect(canvas.getByText("Push is off")).toBeVisible());
    await expect(toggle).not.toBeChecked();
  },
};

// Literals and expressions are not writable, so the switch is shown read-only instead of pretending to work.
export const SwitchWithoutVariableIsReadOnly: Story = {
  args: {code: "root = Switch(true, \"Locked on\")"},
  play: async ({canvasElement}) => {
    const toggle = await within(canvasElement).findByRole("switch", {name: "Locked on"});
    await expect(toggle).toBeChecked();
    await expect(toggle).toBeDisabled();
  },
};

export const DatePickerBinding: Story = {
  args: {
    code: [
      "$date = \"2026-03-15\"",
      "root = Stack([picker, status, clear], \"sm\")",
      "picker = DatePicker($date, \"Appointment date\", \"2026-03-01\", \"2026-03-31\")",
      "status = Text($date == \"\" ? \"No date\" : \"Booked for \" + $date)",
      "clear = Button(\"Reset\", false, \"outline\", \"default\", false, false, null, null, @Reset($date))",
    ].join("\n"),
  },
  play: async ({canvasElement}) => {
    const canvas = within(canvasElement);
    const field = await canvas.findByRole("textbox", {name: "Appointment date"});
    await expect(field).toHaveValue("2026-03-15");
    await userEvent.click(canvas.getByRole("button", {name: /Change date/}));
    const dialog = await canvas.findByRole("dialog", {name: "Choose date"});
    // min and max reach the calendar.
    await expect(within(dialog).getByRole("button", {name: /April 1, 2026/})).toBeDisabled();
    await userEvent.click(within(dialog).getByRole("button", {name: /March 20, 2026/}));
    await waitFor(() => expect(canvas.getByText("Booked for 2026-03-20")).toBeVisible());
    await expect(field).toHaveValue("2026-03-20");
    // Typing a complete date writes to the same variable.
    await userEvent.clear(field);
    await waitFor(() => expect(canvas.getByText("No date")).toBeVisible());
    await userEvent.type(field, "2026-03-05");
    await waitFor(() => expect(canvas.getByText("Booked for 2026-03-05")).toBeVisible());
    await userEvent.click(canvas.getByRole("button", {name: "Reset"}));
    await waitFor(() => expect(canvas.getByText("Booked for 2026-03-15")).toBeVisible());
    await expect(field).toHaveValue("2026-03-15");
  },
};

export const ComboboxBinding: Story = {
  args: {
    code: [
      "$country = \"\"",
      "root = Stack([picker, status, reset], \"sm\")",
      "picker = Combobox($country, [\"Canada\", \"Chile\", {label: \"China\", value: \"cn\", description: \"Asia\"}, {label: \"Cuba\", value: \"cu\", disabled: true}], \"Country\", false, \"Search countries\")",
      "status = Text($country == \"\" ? \"Nothing chosen\" : \"Chose \" + $country)",
      "reset = Button(\"Reset\", false, \"outline\", \"default\", false, false, null, null, @Reset($country))",
    ].join("\n"),
  },
  play: async ({canvasElement}) => {
    const canvas = within(canvasElement);
    const box = await canvas.findByRole("combobox", {name: "Country"});
    await userEvent.type(box, "ch");
    // Search, the option object form and its description reach the list; the disabled one does not match "ch".
    await expect(canvas.getAllByRole("option").map(o => o.textContent)).toEqual(["Chile", "ChinaAsia"]);
    await userEvent.click(canvas.getByRole("option", {name: /China/}));
    // The option's value, not its label, is written to the variable.
    await waitFor(() => expect(canvas.getByText("Chose cn")).toBeVisible());
    await expect(box).toHaveValue("China");
    await userEvent.click(canvas.getByRole("button", {name: "Reset"}));
    await waitFor(() => expect(canvas.getByText("Nothing chosen")).toBeVisible());
    await expect(box).toHaveValue("");
    await userEvent.click(box);
    await expect(canvas.getByRole("option", {name: "Cuba"})).toHaveAttribute("aria-disabled", "true");
  },
};

// Field wires a real label, description and error to the control the SDK renders, whatever that control is.
export const FieldLabelsRenderedControls: Story = {
  args: {
    code: [
      "$email = \"\"",
      "$plan = \"team\"",
      "root = Stack([emailField, planField, notifyField, lockedField], \"md\")",
      "emailField = Field(\"Email\", email, \"We only use it for receipts.\", $email == \"\" ? \"Enter your email address\" : null, true)",
      "email = Input($email, \"you@example.com\")",
      "planField = Field(\"Plan\", plan, null, null, false)",
      "plan = Select($plan, [\"free\", \"team\"])",
      "$notify = true",
      "notifyField = Field(\"Notifications\", notify, \"Applies immediately.\")",
      "notify = Switch($notify, \"Email me about changes\")",
      "$id = \"acct_4821\"",
      "lockedField = Field(\"Account ID\", locked, null, null, false, true)",
      "locked = Input($id)",
    ].join("\n"),
  },
  play: async ({canvasElement}) => {
    const canvas = within(canvasElement);
    const email = await canvas.findByRole("textbox", {name: "Email"});
    // The Input fell back to its placeholder as aria-label; the Field label names it, and it is required and invalid until filled.
    await expect(email).toBeRequired();
    await expect(email).toHaveAttribute("aria-invalid", "true");
    await expect(email).toHaveAccessibleDescription("We only use it for receipts. Error: Enter your email address");
    await userEvent.type(email, "ada@example.com");
    await waitFor(() => expect(email).not.toHaveAttribute("aria-invalid"));
    await expect(email).toHaveAccessibleDescription("We only use it for receipts.");
    await expect(canvas.getByRole("combobox", {name: "Plan"})).toHaveValue("team");
    const toggle = canvas.getByRole("switch", {name: /Notifications/});
    await expect(toggle).toHaveAccessibleDescription("Applies immediately.");
    await userEvent.click(toggle);
    await expect(toggle).not.toBeChecked();
    // disabled reaches the control.
    await expect(canvas.getByRole("textbox", {name: "Account ID"})).toBeDisabled();
    const ids = Array.from(canvasElement.querySelectorAll("[id]")).map(element => element.id);
    await expect(ids.filter((id, index) => ids.indexOf(id) !== index)).toEqual([]);
  },
};

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

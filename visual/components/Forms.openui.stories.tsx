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

// FormGroup renders its children through the existing child reference, keeps each child's binding and passes disabled to all of them.
export const FormGroupComposition: Story = {
  args: {
    code: [
      "$email = true",
      "$sms = false",
      "$locked = false",
      "root = Stack([group, summary, locked], \"md\")",
      "group = FormGroup(\"Notify me by\", [emailBox, smsBox], \"Choose any that apply.\", $email || $sms ? null : \"Choose at least one\", true)",
      "emailBox = Checkbox($email, \"Email\")",
      "smsBox = Switch($sms, \"Text message\")",
      "summary = Text(\"Email: \" + $email + \", SMS: \" + $sms)",
      "locked = FormGroup(\"Admin only\", [adminBox], null, null, false, true)",
      "adminBox = Checkbox($locked, \"Allow guests\")",
    ].join("\n"),
  },
  play: async ({canvasElement}) => {
    const canvas = within(canvasElement);
    const group = await canvas.findByRole("group", {name: "Notify me by (required)"});
    await expect(group).toHaveAccessibleDescription("Choose any that apply.");
    await userEvent.click(within(group).getByRole("checkbox", {name: "Email"}));
    await waitFor(() => expect(canvas.getByText("Email: false, SMS: false")).toBeVisible());
    // The computed error appears while nothing is chosen, and goes when a child binding changes.
    await waitFor(() => expect(group).toHaveAccessibleDescription("Choose any that apply. Error: Choose at least one"));
    await userEvent.click(within(group).getByRole("switch", {name: "Text message"}));
    await waitFor(() => expect(group).toHaveAccessibleDescription("Choose any that apply."));
    await expect(canvas.getByRole("group", {name: "Admin only"})).toBeDisabled();
    await expect(canvas.getByRole("checkbox", {name: "Allow guests"})).toBeDisabled();
  },
};

export const StepperBinding: Story = {
  args: {
    code: [
      "$step = \"account\"",
      "root = Stack([steps, status, next, fixed], \"md\")",
      "steps = Stepper([{id: \"account\", label: \"Account\"}, {id: \"plan\", label: \"Plan\"}, {id: \"review\", label: \"Review\", disabled: true}, {id: \"done\", label: \"Done\"}], $step, \"horizontal\", true)",
      "status = Text(\"Step: \" + $step)",
      "next = Button(\"Go to Plan\", false, \"outline\", \"default\", false, false, null, null, @Set($step, \"plan\"))",
      "fixed = Stepper([{id: \"a\", label: \"First\"}, {id: \"b\", label: \"Second\"}], \"b\", \"vertical\", true)",
    ].join("\n"),
  },
  play: async ({canvasElement}) => {
    const canvas = within(canvasElement);
    const [bound, fixed] = await canvas.findAllByRole("list", {name: "Progress"});
    // A Button's @Set moves the stepper through the variable.
    await userEvent.click(canvas.getByRole("button", {name: "Go to Plan"}));
    await waitFor(() => expect(canvas.getByText("Step: plan")).toBeVisible());
    await expect(within(bound).getByRole("button", {name: /Plan/})).toHaveAttribute("aria-current", "step");
    // interactive: choosing a step writes to the variable; a disabled step does nothing.
    await userEvent.click(within(bound).getByRole("button", {name: /Done/}));
    await waitFor(() => expect(canvas.getByText("Step: done")).toBeVisible());
    await expect(within(bound).getByRole("button", {name: /Review/})).toBeDisabled();
    // A string value has no variable to write to, so it shows progress only: no buttons, and the step stays fixed.
    await expect(within(fixed).queryAllByRole("button")).toHaveLength(0);
    await expect(within(fixed).getAllByRole("listitem")[1]).toHaveAttribute("aria-current", "step");
  },
};

// Chosen files are browser-owned objects. The OpenUI contract exposes no value, binding or action for them, so choosing files
// only changes the control itself: nothing is sent to the host and no variable changes.
export const FileUploadStaysLocal: Story = {
  args: {
    code: [
      "$note = \"idle\"",
      "root = Stack([field, status], \"sm\")",
      "field = Field(\"Résumé\", upload, \"PDF only, up to 1 KB.\")",
      "upload = FileUpload(\".pdf\", false, null, 1024)",
      "status = Text(\"State: \" + $note)",
    ].join("\n"),
  },
  play: async ({canvasElement, args}) => {
    const canvas = within(canvasElement);
    const input = (await canvas.findByLabelText("Résumé")) as HTMLInputElement;
    await expect(input).toHaveAttribute("type", "file");
    await expect(input).toHaveAccessibleDescription(/Accepted: \.pdf · Up to 1 KB/);
    const choose = (files: File[]) => {
      const transfer = new DataTransfer();
      files.forEach(f => transfer.items.add(f));
      input.files = transfer.files;
      input.dispatchEvent(new Event("change", {bubbles: true}));
    };
    choose([new File(["x"], "cv.pdf", {type: "application/pdf"})]);
    await waitFor(() => expect(canvas.getByText("cv.pdf")).toBeVisible());
    choose([new File(["x"], "photo.png", {type: "image/png"})]);
    await waitFor(() => expect(canvas.getByText("photo.png: file type is not accepted")).toBeVisible());
    await userEvent.click(canvas.getByRole("button", {name: "Remove cv.pdf"}));
    await waitFor(() => expect(canvas.queryByText("cv.pdf")).toBeNull());
    // No action reached the host and the document's state is untouched.
    await expect(args.onAction).not.toHaveBeenCalled();
    await expect(canvas.getByText("State: idle")).toBeVisible();
    // The schema the model sees has no value, binding or action property for files.
    const schema = JSON.stringify(library.toJSONSchema());
    const start = schema.indexOf('"FileUpload"');
    await expect(start).toBeGreaterThan(-1);
    await expect(Object.keys((library.toJSONSchema() as unknown as {$defs: Record<string, {properties: Record<string, unknown>}>}).$defs.FileUpload.properties).sort()).toEqual(["accept", "disabled", "label", "maxFiles", "maxSize", "multiple", "required"]);
  },
};

// The browser validates first; only a valid form runs its action, with the SDK's existing steps. @ToAssistant reports the $variables
// (the SDK's formState), not a FormData, and nothing is posted.
export const FormValidatesThenRunsAction: Story = {
  args: {
    code: [
      "$name = \"\"",
      "$status = \"editing\"",
      "root = Form([layout], \"Send\", Action([@Set($status, \"sent\"), @ToAssistant(\"Submit the contact form\")]), false, \"Contact us\")",
      "layout = Stack([nameField, reset, state], \"md\")",
      "nameField = Field(\"Name\", name, null, null, true)",
      "name = Input($name, \"Your name\")",
      "reset = Button(\"Reset\", false, \"outline\", \"default\", false, false, null, null, @Reset($name, $status))",
      "state = Text(\"Status: \" + $status)",
    ].join("\n"),
  },
  play: async ({canvasElement, args}) => {
    const canvas = within(canvasElement);
    const form = await canvas.findByRole("form", {name: "Contact us"});
    const name = canvas.getByRole("textbox", {name: "Name"});
    await expect(name).toBeRequired();
    // Invalid: the browser stops the submit, so neither step runs.
    await userEvent.click(canvas.getByRole("button", {name: "Send"}));
    await expect(args.onAction).not.toHaveBeenCalled();
    await expect(canvas.getByText("Status: editing")).toBeVisible();
    await expect((form as HTMLFormElement).checkValidity()).toBe(false);
    // Valid, by Enter: both steps run in order.
    await userEvent.type(name, "Ada{Enter}");
    await waitFor(() => expect(canvas.getByText("Status: sent")).toBeVisible());
    await expect(args.onAction).toHaveBeenCalledTimes(1);
    await expect(args.onAction).toHaveBeenCalledWith(expect.objectContaining({type: "continue_conversation", humanFriendlyMessage: "Submit the contact form", formState: expect.objectContaining({$name: "Ada", $status: "sent"})}));
    // Reset is a Button with @Reset, which restores the variables (a native reset could not).
    await userEvent.click(canvas.getByRole("button", {name: "Reset"}));
    await waitFor(() => expect(canvas.getByText("Status: editing")).toBeVisible());
    await expect(name).toHaveValue("");
  },
};

export const FormWithoutActionOnlyValidates: Story = {
  args: {
    code: [
      "$email = \"\"",
      "root = Form([field], null, null, false, \"Newsletter\")",
      "field = Field(\"Email\", email, null, null, true)",
      "email = Input($email, \"you@example.com\")",
    ].join("\n"),
  },
  play: async ({canvasElement, args}) => {
    const canvas = within(canvasElement);
    await canvas.findByRole("form", {name: "Newsletter"});
    const before = window.location.href;
    // No action means no submit button, so there is nothing that looks like it sends data.
    await expect(canvas.queryByRole("button")).toBeNull();
    await userEvent.type(canvas.getByRole("textbox", {name: "Email"}), "ada@example.com{Enter}");
    await expect(args.onAction).not.toHaveBeenCalled();
    // Submitting never navigates.
    await expect(window.location.href).toBe(before);
  },
};

// Form can hold the layout and form components, each keeping its own binding and native behaviour.
export const FormComposition: Story = {
  args: {
    code: [
      "$guest = \"\"",
      "$date = \"\"",
      "$room = \"\"",
      "$remind = true",
      "$agree = false",
      "root = Form([layout, group, terms], \"Book\", @ToAssistant(\"Book it\"), false, \"Booking\")",
      "layout = Grid([guestField, dateField, roomField], 2)",
      "guestField = Field(\"Guest\", guest, null, null, true)",
      "guest = Input($guest, \"Full name\")",
      "dateField = Field(\"Date\", date, null, null, true)",
      "date = DatePicker($date, null, \"2026-01-01\", \"2026-12-31\")",
      "roomField = Field(\"Room\", room)",
      "room = Combobox($room, [\"Garden\", \"Library\"], null, false, \"Search rooms\")",
      "group = FormGroup(\"Options\", [remind])",
      "remind = Switch($remind, \"Email me a reminder\")",
      "terms = Switch($agree, \"I accept the terms\", false, true)",
    ].join("\n"),
  },
  play: async ({canvasElement, args}) => {
    const canvas = within(canvasElement);
    await canvas.findByRole("form", {name: "Booking"});
    await userEvent.click(canvas.getByRole("button", {name: "Book"}));
    // Required guest, date and terms all block the submit.
    await expect(args.onAction).not.toHaveBeenCalled();
    await userEvent.type(canvas.getByRole("textbox", {name: "Guest"}), "Ada");
    await userEvent.type(canvas.getByRole("textbox", {name: "Date"}), "2026-06-01");
    await userEvent.click(canvas.getByRole("switch", {name: "I accept the terms"}));
    await userEvent.click(canvas.getByRole("combobox", {name: "Room"}));
    await userEvent.click(canvas.getByRole("option", {name: "Library"}));
    await userEvent.click(canvas.getByRole("button", {name: "Book"}));
    await waitFor(() => expect(args.onAction).toHaveBeenCalledTimes(1));
    await expect(args.onAction).toHaveBeenCalledWith(expect.objectContaining({
      type: "continue_conversation",
      formState: expect.objectContaining({$guest: "Ada", $date: "2026-06-01", $room: "Library", $remind: true, $agree: true}),
    }));
  },
};

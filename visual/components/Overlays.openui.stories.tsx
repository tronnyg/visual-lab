import type {Meta, StoryObj} from "@storybook/react-vite";
import {Renderer} from "@openuidev/react-lang";
import type {ActionEvent} from "@openuidev/react-lang";
import {expect, fn, userEvent, waitFor, within} from "storybook/test";
import {library} from "../library";

// Permanent regression tests for how the overlay components behave when rendered by the real OpenUI Renderer: `$variable` bindings,
// child references, the existing actions and literal links. The plain React behaviour of each component is covered by its own stories.
// Chromium runs these (the overlays need a real top layer), so they live here instead of a jsdom suite.
function Program({code, onAction}: {code: string; onAction?: (event: ActionEvent) => void}) {
  return <Renderer response={code} library={library} onAction={onAction} />;
}

const meta = {
  title: "OpenUI/Overlays",
  component: Program,
  parameters: {layout: "centered"},
  tags: ["!autodocs"],
  args: {code: "", onAction: fn()},
} satisfies Meta<typeof Program>;

export default meta;
type Story = StoryObj<typeof meta>;

const dialog = (canvasElement: HTMLElement) => canvasElement.querySelector("dialog") as HTMLDialogElement;

export const DialogOpenBinding: Story = {
  args: {
    code: [
      "$open = false",
      "root = Stack([openBtn, status, dialog], \"sm\")",
      "openBtn = Button(\"Edit profile\", false, \"primary\", \"default\", false, false, null, null, @Set($open, true))",
      "status = Text($open ? \"Dialog is open\" : \"Dialog is closed\")",
      "dialog = Dialog(\"Edit profile\", body, null, $open)",
      "body = Stack([name, hello, done], \"sm\")",
      "name = Input($name, null, false, \"Display name\")",
      "hello = Text(\"Hello, \" + $name)",
      "done = Button(\"Done\", false, \"outline\", \"default\", false, false, null, null, @Set($open, false))",
      "$name = \"\"",
    ].join("\n"),
  },
  play: async ({canvasElement}) => {
    const canvas = within(canvasElement);
    await waitFor(() => expect(canvas.getByText("Dialog is closed")).toBeVisible());
    await userEvent.click(canvas.getByRole("button", {name: "Edit profile"}));
    // $open → the native dialog is shown as a modal, and the other binding is readable in the status line.
    await waitFor(() => expect(dialog(canvasElement).open).toBe(true));
    await expect(dialog(canvasElement).matches(":modal")).toBe(true);
    await expect(canvas.getByText("Dialog is open")).toBeVisible();
    // Nested content reference: a Stack holding an Input bound to $name, updating a Text live inside the dialog.
    await userEvent.type(canvas.getByRole("textbox", {name: "Display name"}), "Ada");
    await expect(canvas.getByText("Hello, Ada")).toBeVisible();
    // @Set($open, false) from a Button inside the content closes it, and focus returns to the opener.
    await userEvent.click(canvas.getByRole("button", {name: "Done"}));
    await waitFor(() => expect(dialog(canvasElement).open).toBe(false));
    await expect(canvas.getByText("Dialog is closed")).toBeVisible();
    await expect(canvas.getByRole("button", {name: "Edit profile"})).toHaveFocus();
    // Escape writes the dismissal back to the variable.
    await userEvent.click(canvas.getByRole("button", {name: "Edit profile"}));
    await waitFor(() => expect(dialog(canvasElement).open).toBe(true));
    await userEvent.keyboard("{Escape}");
    await waitFor(() => expect(canvas.getByText("Dialog is closed")).toBeVisible());
    await expect(dialog(canvasElement).open).toBe(false);
  },
};

export const DialogTriggerReferenceAndAction: Story = {
  args: {
    code: [
      "root = Dialog(\"Ask the assistant\", body, trigger, false, \"Sends one message.\")",
      "trigger = Button(\"Open\", false, \"outline\")",
      "body = Button(\"Ask\", false, \"primary\", \"default\", false, false, null, null, @ToAssistant(\"Tell me more\"))",
    ].join("\n"),
  },
  play: async ({canvasElement, args}) => {
    const canvas = within(canvasElement);
    // A trigger reference needs no action of its own.
    await userEvent.click(canvas.getByRole("button", {name: "Open"}));
    await waitFor(() => expect(dialog(canvasElement).open).toBe(true));
    await expect(canvas.getByRole("button", {name: "Open"})).toHaveAttribute("aria-haspopup", "dialog");
    await expect(args.onAction).not.toHaveBeenCalled();
    // An existing action inside the dialog still reaches the host.
    await userEvent.click(canvas.getByRole("button", {name: "Ask"}));
    await waitFor(() => expect(args.onAction).toHaveBeenCalledTimes(1));
    await expect(args.onAction).toHaveBeenCalledWith(expect.objectContaining({type: "continue_conversation", humanFriendlyMessage: "Tell me more"}));
  },
};

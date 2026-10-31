import {useState} from "react";
import type {Meta, StoryObj} from "@storybook/react-vite";
import {expect, fn, userEvent, waitFor, within} from "storybook/test";
import {Dialog} from "./Dialog";
import {Button} from "../Button/Button";
import {Checkbox} from "../Checkbox/Checkbox";
import {Input} from "../Input/Input";
import {Stack} from "../Stack/Stack";
import {Text} from "../Text/Text";

const meta = {
  title: "Components/Dialog",
  component: Dialog,
  parameters: {layout: "centered"},
  args: {
    title: "Share project",
    description: "Anyone with the link can view this project.",
    trigger: <Button variant="outline">Open dialog</Button>,
    children: <Text>Dialog body text.</Text>,
    onOpenChange: fn(),
  },
  argTypes: {
    open: {control: "boolean"},
    defaultOpen: {control: "boolean"},
    closeOnBackdrop: {control: "boolean"},
    closeOnEscape: {control: "boolean"},
    showCloseButton: {control: "boolean"},
    title: {control: "text"},
    description: {control: "text"},
    trigger: {control: false},
    children: {control: false},
    onOpenChange: {control: false},
    ref: {control: false},
    className: {control: false},
  },
} satisfies Meta<typeof Dialog>;

export default meta;
type Story = StoryObj<typeof meta>;

const dialog = (canvasElement: HTMLElement) => canvasElement.querySelector("dialog") as HTMLDialogElement;
const trigger = (canvasElement: HTMLElement) => within(canvasElement).getByRole("button", {name: "Open dialog"});
const isOpen = (canvasElement: HTMLElement) => waitFor(() => expect(dialog(canvasElement).open).toBe(true));
const isClosed = (canvasElement: HTMLElement) => waitFor(() => expect(dialog(canvasElement).open).toBe(false));

export const Closed: Story = {
  play: async ({canvasElement}) => {
    const canvas = within(canvasElement);
    await expect(dialog(canvasElement).open).toBe(false);
    await expect(canvas.queryByRole("dialog")).toBeNull();
    await expect(trigger(canvasElement)).toHaveAttribute("aria-haspopup", "dialog");
    // The content stays mounted while closed, just not shown.
    await expect(canvas.getByText("Dialog body text.")).not.toBeVisible();
  },
};

export const InitiallyOpen: Story = {
  args: {defaultOpen: true},
  play: async ({canvasElement, args}) => {
    const canvas = within(canvasElement);
    await isOpen(canvasElement);
    await expect(dialog(canvasElement).matches(":modal")).toBe(true);
    const named = canvas.getByRole("dialog", {name: "Share project"});
    await expect(named).toBeVisible();
    await expect(named).toHaveAccessibleDescription("Anyone with the link can view this project.");
    await expect(canvas.getByRole("heading", {name: "Share project", level: 2})).toBeVisible();
    // The initial state is not a user action.
    await expect(args.onOpenChange).not.toHaveBeenCalled();
    // With nothing else to focus, focus lands on the close button, inside the dialog.
    await expect(dialog(canvasElement).contains(document.activeElement)).toBe(true);
  },
};

export const OpensFromTrigger: Story = {
  play: async ({canvasElement, args}) => {
    await userEvent.click(trigger(canvasElement));
    await isOpen(canvasElement);
    await expect(args.onOpenChange).toHaveBeenCalledTimes(1);
    await expect(args.onOpenChange).toHaveBeenLastCalledWith(true);
    await expect(dialog(canvasElement).contains(document.activeElement)).toBe(true);
    await expect(within(canvasElement).getByRole("dialog", {name: "Share project"})).toBeVisible();
  },
};

export const OpensFromKeyboard: Story = {
  play: async ({canvasElement}) => {
    await userEvent.tab();
    await expect(trigger(canvasElement)).toHaveFocus();
    await userEvent.keyboard("{Enter}");
    await isOpen(canvasElement);
    await userEvent.keyboard("{Escape}");
    await isClosed(canvasElement);
    await expect(trigger(canvasElement)).toHaveFocus();
    await userEvent.keyboard(" ");
    await isOpen(canvasElement);
  },
};

export const CloseButton: Story = {
  play: async ({canvasElement, args}) => {
    await userEvent.click(trigger(canvasElement));
    await isOpen(canvasElement);
    await userEvent.click(within(canvasElement).getByRole("button", {name: "Close"}));
    await isClosed(canvasElement);
    await expect(args.onOpenChange).toHaveBeenLastCalledWith(false);
    await expect(trigger(canvasElement)).toHaveFocus();
  },
};

export const NoCloseButton: Story = {
  args: {showCloseButton: false, defaultOpen: true},
  play: async ({canvasElement}) => {
    await isOpen(canvasElement);
    await expect(within(canvasElement).queryByRole("button", {name: "Close"})).toBeNull();
    // It can still be dismissed with Escape.
    await userEvent.keyboard("{Escape}");
    await isClosed(canvasElement);
  },
};

export const EscapeCloses: Story = {
  play: async ({canvasElement, args}) => {
    await userEvent.click(trigger(canvasElement));
    await isOpen(canvasElement);
    await userEvent.keyboard("{Escape}");
    await isClosed(canvasElement);
    await expect(args.onOpenChange).toHaveBeenLastCalledWith(false);
    await expect(trigger(canvasElement)).toHaveFocus();
  },
};

export const EscapeDisabled: Story = {
  args: {closeOnEscape: false, defaultOpen: true},
  play: async ({canvasElement, args}) => {
    await isOpen(canvasElement);
    // Twice, because a browser may close a dialog on a repeated Escape even when the first was cancelled.
    await userEvent.keyboard("{Escape}");
    await userEvent.keyboard("{Escape}");
    await new Promise(resolve => setTimeout(resolve, 100));
    await expect(dialog(canvasElement).open).toBe(true);
    await expect(args.onOpenChange).not.toHaveBeenCalled();
    // The close button still works.
    await userEvent.click(within(canvasElement).getByRole("button", {name: "Close"}));
    await isClosed(canvasElement);
  },
};

export const BackdropCloses: Story = {
  play: async ({canvasElement, args}) => {
    await userEvent.click(trigger(canvasElement));
    await isOpen(canvasElement);
    // A click on the dialog element itself, outside its panel, is a click on the backdrop.
    await userEvent.click(dialog(canvasElement));
    await isClosed(canvasElement);
    await expect(args.onOpenChange).toHaveBeenLastCalledWith(false);
    await expect(trigger(canvasElement)).toHaveFocus();
  },
};

export const BackdropDisabled: Story = {
  args: {closeOnBackdrop: false, defaultOpen: true},
  play: async ({canvasElement, args}) => {
    await isOpen(canvasElement);
    await userEvent.click(dialog(canvasElement));
    await expect(dialog(canvasElement).open).toBe(true);
    await expect(args.onOpenChange).not.toHaveBeenCalled();
  },
};

export const ClickingContentDoesNotClose: Story = {
  args: {defaultOpen: true},
  play: async ({canvasElement, args}) => {
    const canvas = within(canvasElement);
    await isOpen(canvasElement);
    await userEvent.click(canvas.getByText("Dialog body text."));
    await userEvent.click(canvas.getByRole("heading", {name: "Share project"}));
    await userEvent.click(canvas.getByText("Anyone with the link can view this project."));
    await expect(dialog(canvasElement).open).toBe(true);
    // A press that starts inside the panel and ends on the backdrop (a text selection or drag) is not a backdrop click.
    canvas.getByText("Dialog body text.").dispatchEvent(new MouseEvent("mousedown", {bubbles: true}));
    dialog(canvasElement).dispatchEvent(new MouseEvent("click", {bubbles: true}));
    await expect(dialog(canvasElement).open).toBe(true);
    await expect(args.onOpenChange).not.toHaveBeenCalled();
  },
};

export const FocusIsTrappedAndBackgroundInert: Story = {
  decorators: [Story => <div><Button data-testid="outside" variant="ghost">Outside</Button><Story /></div>],
  args: {children: <Stack><Input value="" label="Email" /><Button>Confirm</Button></Stack>},
  play: async ({canvasElement}) => {
    await userEvent.click(trigger(canvasElement));
    await isOpen(canvasElement);
    // Focus starts on the first control in the content, not on Close.
    await expect(within(canvasElement).getByRole("textbox", {name: "Email"})).toHaveFocus();
    const outside = canvasElement.querySelector<HTMLElement>("[data-testid=outside]")!;
    outside.focus();
    await expect(outside).not.toHaveFocus();
    // Tab order inside the dialog: the content's controls, then Close (last in the DOM). The browser's own trap handles the wrap-around,
    // which synthetic key events cannot exercise.
    await userEvent.tab();
    await expect(within(canvasElement).getByRole("button", {name: "Confirm"})).toHaveFocus();
    await userEvent.tab();
    await expect(within(canvasElement).getByRole("button", {name: "Close"})).toHaveFocus();
  },
};

function Form() {
  const [name, setName] = useState("");
  const [agree, setAgree] = useState(false);
  return (
    <Stack>
      <Input value={name} onChange={event => setName(event.target.value)} label="Name" />
      <Checkbox checked={agree} onCheckedChange={setAgree} label="I agree" />
      <Text>{agree ? `Agreed as ${name}` : "Not agreed"}</Text>
    </Stack>
  );
}

export const NestedFormControls: Story = {
  args: {children: <Form />},
  play: async ({canvasElement, args}) => {
    const canvas = within(canvasElement);
    await userEvent.click(trigger(canvasElement));
    await isOpen(canvasElement);
    await userEvent.type(canvas.getByRole("textbox", {name: "Name"}), "Ada ");
    await userEvent.keyboard("{ArrowLeft}x");
    await userEvent.click(canvas.getByRole("checkbox", {name: "I agree"}));
    await expect(canvas.getByText(/Agreed as Adax/)).toBeVisible();
    // Interacting with the content never dismisses the dialog.
    await expect(dialog(canvasElement).open).toBe(true);
    await expect(args.onOpenChange).toHaveBeenCalledTimes(1);
    // The content kept its state while closed.
    await userEvent.keyboard("{Escape}");
    await isClosed(canvasElement);
    await userEvent.click(trigger(canvasElement));
    await isOpen(canvasElement);
    await expect(canvas.getByRole("textbox", {name: "Name"})).toHaveValue("Adax ");
  },
};

export const Controlled: Story = {
  render: args => {
    const [open, setOpen] = useState(false);
    return (
      <Stack>
        <Button onClick={() => setOpen(true)}>External open</Button>
        <Text>{open ? "Parent: open" : "Parent: closed"}</Text>
        <Dialog {...args} trigger={undefined} open={open} onOpenChange={next => { args.onOpenChange?.(next); setOpen(next); }} />
      </Stack>
    );
  },
  play: async ({canvasElement, args}) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByText("Parent: closed")).toBeVisible();
    await userEvent.click(canvas.getByRole("button", {name: "External open"}));
    await isOpen(canvasElement);
    await expect(canvas.getByText("Parent: open")).toBeVisible();
    await userEvent.click(canvas.getByRole("button", {name: "Close"}));
    await isClosed(canvasElement);
    await expect(canvas.getByText("Parent: closed")).toBeVisible();
    await expect(args.onOpenChange).toHaveBeenCalledTimes(1);
    await expect(args.onOpenChange).toHaveBeenLastCalledWith(false);
    // Focus returns to the control that opened it.
    await expect(canvas.getByRole("button", {name: "External open"})).toHaveFocus();
  },
};

export const ControlledParentRefuses: Story = {
  args: {open: true},
  play: async ({canvasElement, args}) => {
    await isOpen(canvasElement);
    await userEvent.keyboard("{Escape}");
    await expect(args.onOpenChange).toHaveBeenLastCalledWith(false);
    await new Promise(resolve => setTimeout(resolve, 100));
    // The parent never changed `open`, so the dialog is still open.
    await expect(dialog(canvasElement).open).toBe(true);
    await userEvent.click(within(canvasElement).getByRole("button", {name: "Close"}));
    await expect(args.onOpenChange).toHaveBeenCalledTimes(2);
    await expect(dialog(canvasElement).open).toBe(true);
  },
};

export const NestedDialogs: Story = {
  args: {
    children: (
      <Dialog title="Are you sure?" trigger={<Button variant="outline">Open inner</Button>}>
        <Text>Inner dialog body.</Text>
      </Dialog>
    ),
  },
  play: async ({canvasElement}) => {
    const canvas = within(canvasElement);
    await userEvent.click(trigger(canvasElement));
    await isOpen(canvasElement);
    await userEvent.click(canvas.getByRole("button", {name: "Open inner"}));
    await waitFor(() => expect(canvas.getByRole("dialog", {name: "Are you sure?"})).toBeVisible());
    const inner = canvas.getByRole("dialog", {name: "Are you sure?"}) as HTMLDialogElement;
    await expect(inner.matches(":modal")).toBe(true);
    // Escape closes only the topmost dialog and returns focus to the control that opened it.
    await userEvent.keyboard("{Escape}");
    await waitFor(() => expect(inner.open).toBe(false));
    await expect(dialog(canvasElement).open).toBe(true);
    await expect(canvas.getByRole("button", {name: "Open inner"})).toHaveFocus();
    await userEvent.keyboard("{Escape}");
    await isClosed(canvasElement);
    await expect(trigger(canvasElement)).toHaveFocus();
  },
};

export const ScrollableContent: Story = {
  args: {
    defaultOpen: true,
    children: <Stack>{Array.from({length: 40}, (_, i) => <Text key={i}>{`Line ${i + 1} of a long body.`}</Text>)}</Stack>,
  },
  play: async ({canvasElement}) => {
    await isOpen(canvasElement);
    const panel = dialog(canvasElement);
    await expect(panel.getBoundingClientRect().height).toBeLessThanOrEqual(window.innerHeight);
    // The body scrolls, and as a scroll region it can be reached with the keyboard.
    const body = panel.querySelector<HTMLElement>(".vl-modal__body")!;
    await waitFor(() => expect(body).toHaveAttribute("tabindex", "0"));
    await expect(body.scrollHeight).toBeGreaterThan(body.clientHeight);
  },
};

export const Narrow: Story = {
  args: {defaultOpen: true, title: "A_very_long_unbroken_title_that_must_wrap_instead_of_overflowing_the_dialog_panel", description: "Supporting text."},
  play: async ({canvasElement}) => {
    await isOpen(canvasElement);
    const panel = dialog(canvasElement);
    const rect = panel.getBoundingClientRect();
    await expect(rect.left).toBeGreaterThanOrEqual(0);
    await expect(rect.right).toBeLessThanOrEqual(window.innerWidth);
    await expect(panel.scrollWidth).toBeLessThanOrEqual(panel.clientWidth);
    await expect(getComputedStyle(panel).maxWidth).not.toBe("none");
  },
};

export const Dark: Story = {globals: {theme: "dark"}, args: {defaultOpen: true}};

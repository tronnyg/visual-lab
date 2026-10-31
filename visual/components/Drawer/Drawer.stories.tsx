import {useState} from "react";
import type {Meta, StoryObj} from "@storybook/react-vite";
import {expect, fn, userEvent, waitFor, within} from "storybook/test";
import {Drawer} from "./Drawer";
import {Button} from "../Button/Button";
import {Checkbox} from "../Checkbox/Checkbox";
import {Input} from "../Input/Input";
import {Popover} from "../Popover/Popover";
import {Stack} from "../Stack/Stack";
import {Text} from "../Text/Text";

const meta = {
  title: "Components/Drawer",
  component: Drawer,
  parameters: {layout: "centered"},
  args: {
    title: "Order details",
    description: "Order 1042",
    trigger: <Button variant="outline">Open drawer</Button>,
    children: <Text>Drawer body text.</Text>,
    onOpenChange: fn(),
  },
  argTypes: {
    side: {control: "inline-radio", options: ["left", "right", "top", "bottom"]},
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
} satisfies Meta<typeof Drawer>;

export default meta;
type Story = StoryObj<typeof meta>;

const drawer = (canvasElement: HTMLElement) => canvasElement.querySelector("dialog") as HTMLDialogElement;
const trigger = (canvasElement: HTMLElement) => within(canvasElement).getByRole("button", {name: "Open drawer"});
const isOpen = (canvasElement: HTMLElement) => waitFor(() => expect(drawer(canvasElement).open).toBe(true));
const isClosed = (canvasElement: HTMLElement) => waitFor(() => expect(drawer(canvasElement).open).toBe(false));

export const Closed: Story = {
  play: async ({canvasElement}) => {
    await expect(drawer(canvasElement).open).toBe(false);
    await expect(within(canvasElement).queryByRole("dialog")).toBeNull();
    await expect(trigger(canvasElement)).toHaveAttribute("aria-haspopup", "dialog");
    await expect(within(canvasElement).getByText("Drawer body text.")).not.toBeVisible();
  },
};

export const InitiallyOpen: Story = {
  args: {defaultOpen: true},
  play: async ({canvasElement, args}) => {
    await isOpen(canvasElement);
    await expect(drawer(canvasElement).matches(":modal")).toBe(true);
    const named = within(canvasElement).getByRole("dialog", {name: "Order details"});
    await expect(named).toBeVisible();
    await expect(named).toHaveAccessibleDescription("Order 1042");
    await expect(args.onOpenChange).not.toHaveBeenCalled();
  },
};

// Each side is attached to its viewport edge and spans it.
function attached(side: "left" | "right" | "top" | "bottom"): Story {
  return {
    args: {defaultOpen: true, side},
    play: async ({canvasElement}) => {
      await isOpen(canvasElement);
      const rect = drawer(canvasElement).getBoundingClientRect();
      if (side === "left") { await expect(rect.left).toBe(0); await expect(rect.height).toBe(window.innerHeight); await expect(rect.width).toBeLessThan(window.innerWidth); }
      if (side === "right") { await expect(rect.right).toBe(window.innerWidth); await expect(rect.height).toBe(window.innerHeight); await expect(rect.width).toBeLessThan(window.innerWidth); }
      if (side === "top") { await expect(rect.top).toBe(0); await expect(rect.width).toBe(window.innerWidth); await expect(rect.height).toBeLessThan(window.innerHeight); }
      if (side === "bottom") { await expect(rect.bottom).toBe(window.innerHeight); await expect(rect.width).toBe(window.innerWidth); await expect(rect.height).toBeLessThan(window.innerHeight); }
      await expect(drawer(canvasElement)).toHaveAttribute("data-side", side);
    },
  };
}
export const Right: Story = attached("right");
export const Left: Story = attached("left");
export const Top: Story = attached("top");
export const Bottom: Story = attached("bottom");

export const OpensFromTriggerAndRestoresFocus: Story = {
  play: async ({canvasElement, args}) => {
    await userEvent.click(trigger(canvasElement));
    await isOpen(canvasElement);
    await expect(args.onOpenChange).toHaveBeenLastCalledWith(true);
    await expect(drawer(canvasElement).contains(document.activeElement)).toBe(true);
    await userEvent.click(within(canvasElement).getByRole("button", {name: "Close"}));
    await isClosed(canvasElement);
    await expect(args.onOpenChange).toHaveBeenLastCalledWith(false);
    await expect(trigger(canvasElement)).toHaveFocus();
  },
};

export const KeyboardOpenAndEscape: Story = {
  play: async ({canvasElement, args}) => {
    await userEvent.tab();
    await userEvent.keyboard("{Enter}");
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
    await userEvent.keyboard("{Escape}");
    await userEvent.keyboard("{Escape}");
    await new Promise(resolve => setTimeout(resolve, 100));
    await expect(drawer(canvasElement).open).toBe(true);
    await expect(args.onOpenChange).not.toHaveBeenCalled();
  },
};

export const BackdropCloses: Story = {
  play: async ({canvasElement, args}) => {
    await userEvent.click(trigger(canvasElement));
    await isOpen(canvasElement);
    await userEvent.click(within(canvasElement).getByText("Drawer body text."));
    await expect(drawer(canvasElement).open).toBe(true);
    await userEvent.click(drawer(canvasElement));
    await isClosed(canvasElement);
    await expect(args.onOpenChange).toHaveBeenLastCalledWith(false);
    await expect(trigger(canvasElement)).toHaveFocus();
  },
};

export const BackdropDisabled: Story = {
  args: {closeOnBackdrop: false, defaultOpen: true},
  play: async ({canvasElement}) => {
    await isOpen(canvasElement);
    await userEvent.click(drawer(canvasElement));
    await expect(drawer(canvasElement).open).toBe(true);
  },
};

export const BackgroundIsInert: Story = {
  decorators: [Story => <div><Button data-testid="outside" variant="ghost">Outside</Button><Story /></div>],
  play: async ({canvasElement}) => {
    await userEvent.click(trigger(canvasElement));
    await isOpen(canvasElement);
    const outside = canvasElement.querySelector<HTMLElement>("[data-testid=outside]")!;
    outside.focus();
    await expect(outside).not.toHaveFocus();
    await expect(drawer(canvasElement).contains(document.activeElement)).toBe(true);
  },
};

export const Controlled: Story = {
  render: args => {
    const [open, setOpen] = useState(false);
    return (
      <Stack>
        <Button onClick={() => setOpen(true)}>External open</Button>
        <Text>{open ? "Parent: open" : "Parent: closed"}</Text>
        <Drawer {...args} trigger={undefined} open={open} onOpenChange={next => { args.onOpenChange?.(next); setOpen(next); }} />
      </Stack>
    );
  },
  play: async ({canvasElement, args}) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole("button", {name: "External open"}));
    await isOpen(canvasElement);
    await expect(canvas.getByText("Parent: open")).toBeVisible();
    await userEvent.keyboard("{Escape}");
    await isClosed(canvasElement);
    await expect(canvas.getByText("Parent: closed")).toBeVisible();
    await expect(args.onOpenChange).toHaveBeenCalledTimes(1);
    await expect(canvas.getByRole("button", {name: "External open"})).toHaveFocus();
  },
};

export const NestedInteractiveContent: Story = {
  args: {
    children: (
      <Stack>
        <Input value="" label="Search" />
        <Checkbox checked={false} label="Include archived" />
        <Popover trigger={<Button variant="outline" size="sm">More</Button>}><Text>Extra options.</Text></Popover>
      </Stack>
    ),
  },
  play: async ({canvasElement}) => {
    const canvas = within(canvasElement);
    await userEvent.click(trigger(canvasElement));
    await isOpen(canvasElement);
    await expect(canvas.getByRole("textbox", {name: "Search"})).toHaveFocus();
    // An anchored overlay inside the drawer is not inert, and Escape closes it before the drawer.
    await userEvent.click(canvas.getByRole("button", {name: "More"}));
    await waitFor(() => expect(canvas.getByText("Extra options.")).toBeVisible());
    await userEvent.keyboard("{Escape}");
    await waitFor(() => expect(canvas.queryByText("Extra options.")).toBeNull());
    await expect(drawer(canvasElement).open).toBe(true);
  },
};

export const ScrollableContent: Story = {
  args: {
    defaultOpen: true,
    children: <Stack>{Array.from({length: 60}, (_, i) => <Text key={i}>{`Row ${i + 1}`}</Text>)}</Stack>,
  },
  play: async ({canvasElement}) => {
    await isOpen(canvasElement);
    const body = drawer(canvasElement).querySelector<HTMLElement>(".vl-modal__body")!;
    await expect(drawer(canvasElement).getBoundingClientRect().height).toBeLessThanOrEqual(window.innerHeight);
    await waitFor(() => expect(body).toHaveAttribute("tabindex", "0"));
    await expect(body.scrollHeight).toBeGreaterThan(body.clientHeight);
    // The header and close button stay in view while the body scrolls.
    body.scrollTop = 200;
    await expect(within(canvasElement).getByRole("heading", {name: "Order details"})).toBeVisible();
    await expect(within(canvasElement).getByRole("button", {name: "Close"})).toBeVisible();
  },
};

export const Narrow: Story = {
  args: {defaultOpen: true, title: "A_very_long_unbroken_title_that_must_wrap_instead_of_overflowing_the_drawer_panel"},
  play: async ({canvasElement}) => {
    await isOpen(canvasElement);
    const rect = drawer(canvasElement).getBoundingClientRect();
    await expect(rect.left).toBeGreaterThanOrEqual(0);
    await expect(rect.right).toBeLessThanOrEqual(window.innerWidth);
    await expect(drawer(canvasElement).scrollWidth).toBeLessThanOrEqual(drawer(canvasElement).clientWidth);
    await expect(getComputedStyle(drawer(canvasElement)).width).not.toBe("0px");
  },
};

export const Dark: Story = {globals: {theme: "dark"}, args: {defaultOpen: true, side: "left"}};

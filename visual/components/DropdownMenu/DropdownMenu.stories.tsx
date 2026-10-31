import {useState} from "react";
import type {Meta, StoryObj} from "@storybook/react-vite";
import {expect, fn, userEvent, waitFor, within} from "storybook/test";
import {DropdownMenu} from "./DropdownMenu";
import type {DropdownMenuItem} from "./DropdownMenu";
import {Button} from "../Button/Button";
import {Dialog} from "../Dialog/Dialog";
import {Text} from "../Text/Text";

const items: DropdownMenuItem[] = [
  {id: "new", label: "New file"},
  {id: "open", label: "Open recent"},
  {id: "share", label: "Share", disabled: true},
  {id: "rename", label: "Rename", separatorBefore: true},
  {id: "delete", label: "Delete"},
];

const meta = {
  title: "Components/DropdownMenu",
  component: DropdownMenu,
  decorators: [Story => <div style={{padding: "40px 120px 220px"}}><Story /></div>],
  args: {items, trigger: <Button variant="outline">Actions</Button>, onSelect: fn(), onOpenChange: fn()},
  argTypes: {
    placement: {control: "inline-radio", options: ["top", "bottom", "left", "right"]},
    align: {control: "inline-radio", options: ["start", "center", "end"]},
    open: {control: "boolean"},
    defaultOpen: {control: "boolean"},
    label: {control: "text"},
    items: {control: "object"},
    trigger: {control: false},
    onSelect: {control: false},
    onOpenChange: {control: false},
    ref: {control: false},
    className: {control: false},
  },
} satisfies Meta<typeof DropdownMenu>;

export default meta;
type Story = StoryObj<typeof meta>;

const trigger = (canvasElement: HTMLElement) => within(canvasElement).getByRole("button", {name: "Actions"});
const menu = (canvasElement: HTMLElement) => within(canvasElement).getByRole("menu");
const item = (canvasElement: HTMLElement, name: string | RegExp) => within(canvasElement).getByRole("menuitem", {name});
const opened = (canvasElement: HTMLElement) => waitFor(() => expect(within(canvasElement).getByRole("menu")).toBeVisible());
const closed = (canvasElement: HTMLElement) => waitFor(() => expect(within(canvasElement).queryByRole("menu")).toBeNull());

export const Closed: Story = {
  play: async ({canvasElement}) => {
    await expect(trigger(canvasElement)).toHaveAttribute("aria-haspopup", "menu");
    await expect(trigger(canvasElement)).toHaveAttribute("aria-expanded", "false");
    await expect(trigger(canvasElement)).not.toHaveAttribute("aria-controls");
    await expect(within(canvasElement).queryByRole("menu")).toBeNull();
  },
};

export const OpensWithPointer: Story = {
  play: async ({canvasElement, args}) => {
    await userEvent.click(trigger(canvasElement));
    await opened(canvasElement);
    await expect(trigger(canvasElement)).toHaveAttribute("aria-expanded", "true");
    await expect(trigger(canvasElement)).toHaveAttribute("aria-controls", menu(canvasElement).id);
    await expect(menu(canvasElement)).toHaveAccessibleName("Actions");
    await expect(within(canvasElement).getAllByRole("menuitem")).toHaveLength(5);
    await expect(args.onOpenChange).toHaveBeenLastCalledWith(true);
    // Opened by the pointer: the menu itself has focus and no item is highlighted yet.
    await expect(menu(canvasElement)).toHaveFocus();
    await userEvent.keyboard("{ArrowDown}");
    await expect(item(canvasElement, "New file")).toHaveFocus();
  },
};

export const OpensWithEnterAndFocusesFirstItem: Story = {
  play: async ({canvasElement}) => {
    await userEvent.tab();
    await expect(trigger(canvasElement)).toHaveFocus();
    await userEvent.keyboard("{Enter}");
    await opened(canvasElement);
    await expect(item(canvasElement, "New file")).toHaveFocus();
  },
};

export const OpensWithSpace: Story = {
  play: async ({canvasElement}) => {
    await userEvent.tab();
    await userEvent.keyboard(" ");
    await opened(canvasElement);
    await expect(item(canvasElement, "New file")).toHaveFocus();
  },
};

export const OpensWithArrowKeys: Story = {
  play: async ({canvasElement}) => {
    await userEvent.tab();
    await userEvent.keyboard("{ArrowDown}");
    await opened(canvasElement);
    await expect(item(canvasElement, "New file")).toHaveFocus();
    await userEvent.keyboard("{Escape}");
    await closed(canvasElement);
    await expect(trigger(canvasElement)).toHaveFocus();
    // Arrow Up opens at the last item.
    await userEvent.keyboard("{ArrowUp}");
    await opened(canvasElement);
    await expect(item(canvasElement, "Delete")).toHaveFocus();
  },
};

export const ArrowKeysMoveAndSkipDisabled: Story = {
  play: async ({canvasElement}) => {
    await userEvent.tab();
    await userEvent.keyboard("{Enter}");
    await opened(canvasElement);
    await expect(item(canvasElement, "New file")).toHaveFocus();
    await userEvent.keyboard("{ArrowDown}");
    await expect(item(canvasElement, "Open recent")).toHaveFocus();
    // "Share" is disabled, so the next enabled item is "Rename".
    await userEvent.keyboard("{ArrowDown}");
    await expect(item(canvasElement, "Rename")).toHaveFocus();
    await userEvent.keyboard("{ArrowUp}");
    await expect(item(canvasElement, "Open recent")).toHaveFocus();
    // Wraps in both directions.
    await userEvent.keyboard("{ArrowDown}{ArrowDown}{ArrowDown}");
    await expect(item(canvasElement, "New file")).toHaveFocus();
    await userEvent.keyboard("{ArrowUp}");
    await expect(item(canvasElement, "Delete")).toHaveFocus();
    await userEvent.keyboard("{Home}");
    await expect(item(canvasElement, "New file")).toHaveFocus();
    await userEvent.keyboard("{End}");
    await expect(item(canvasElement, "Delete")).toHaveFocus();
    // Exactly one item is in the roving focus at a time and none is a tab stop.
    await expect(within(canvasElement).getAllByRole("menuitem").every(element => element.tabIndex === -1)).toBe(true);
  },
};

export const TypeAhead: Story = {
  play: async ({canvasElement}) => {
    await userEvent.tab();
    await userEvent.keyboard("{Enter}");
    await opened(canvasElement);
    await userEvent.keyboard("r");
    await expect(item(canvasElement, "Rename")).toHaveFocus();
    // Quick letters build a prefix ("rd" matches nothing); after a pause a new letter starts over.
    await userEvent.keyboard("d");
    await expect(item(canvasElement, "Rename")).toHaveFocus();
    await new Promise(resolve => setTimeout(resolve, 700));
    await userEvent.keyboard("d");
    await expect(item(canvasElement, "Delete")).toHaveFocus();
  },
};

export const SelectWithClick: Story = {
  play: async ({canvasElement, args}) => {
    await userEvent.click(trigger(canvasElement));
    await opened(canvasElement);
    await userEvent.click(item(canvasElement, "Open recent"));
    await expect(args.onSelect).toHaveBeenCalledTimes(1);
    await expect(args.onSelect).toHaveBeenCalledWith("open");
    await closed(canvasElement);
    await expect(args.onOpenChange).toHaveBeenLastCalledWith(false);
    // Focus returns to the trigger.
    await expect(trigger(canvasElement)).toHaveFocus();
  },
};

export const SelectWithEnterAndSpace: Story = {
  play: async ({canvasElement, args}) => {
    await userEvent.tab();
    await userEvent.keyboard("{Enter}");
    await opened(canvasElement);
    await userEvent.keyboard("{ArrowDown}{Enter}");
    await expect(args.onSelect).toHaveBeenLastCalledWith("open");
    await closed(canvasElement);
    await expect(trigger(canvasElement)).toHaveFocus();
    await userEvent.keyboard("{ArrowUp}");
    await opened(canvasElement);
    await userEvent.keyboard(" ");
    await expect(args.onSelect).toHaveBeenLastCalledWith("delete");
    await expect(args.onSelect).toHaveBeenCalledTimes(2);
    await closed(canvasElement);
  },
};

export const DisabledItemsCannotBeChosen: Story = {
  play: async ({canvasElement, args}) => {
    await userEvent.click(trigger(canvasElement));
    await opened(canvasElement);
    const share = item(canvasElement, "Share");
    await expect(share).toHaveAttribute("aria-disabled", "true");
    await userEvent.click(share);
    await expect(args.onSelect).not.toHaveBeenCalled();
    // The menu stays open, and the disabled item never takes focus from the pointer either.
    await expect(menu(canvasElement)).toBeVisible();
    await userEvent.hover(share);
    await expect(share).not.toHaveFocus();
  },
};

export const HoverHighlightsByFocus: Story = {
  play: async ({canvasElement}) => {
    await userEvent.click(trigger(canvasElement));
    await opened(canvasElement);
    await userEvent.hover(item(canvasElement, "Rename"));
    await expect(item(canvasElement, "Rename")).toHaveFocus();
    await userEvent.keyboard("{ArrowDown}");
    await expect(item(canvasElement, "Delete")).toHaveFocus();
  },
};

export const EscapeCloses: Story = {
  play: async ({canvasElement, args}) => {
    await userEvent.click(trigger(canvasElement));
    await opened(canvasElement);
    await userEvent.keyboard("{ArrowDown}{Escape}");
    await closed(canvasElement);
    await expect(trigger(canvasElement)).toHaveFocus();
    await expect(args.onSelect).not.toHaveBeenCalled();
    await expect(args.onOpenChange).toHaveBeenLastCalledWith(false);
  },
};

export const OutsideClickCloses: Story = {
  decorators: [Story => <div><Story /><Button variant="ghost">Elsewhere</Button></div>],
  play: async ({canvasElement, args}) => {
    await userEvent.click(trigger(canvasElement));
    await opened(canvasElement);
    await userEvent.click(within(canvasElement).getByRole("button", {name: "Elsewhere"}));
    await closed(canvasElement);
    await expect(args.onSelect).not.toHaveBeenCalled();
  },
};

export const TabClosesAndContinuesFromTrigger: Story = {
  decorators: [Story => <div><Story /><Button variant="ghost">After</Button></div>],
  play: async ({canvasElement}) => {
    await userEvent.tab();
    await userEvent.keyboard("{Enter}");
    await opened(canvasElement);
    await userEvent.tab();
    await closed(canvasElement);
    await expect(within(canvasElement).getByRole("button", {name: "After"})).toHaveFocus();
  },
};

export const SeparatorsAndGroups: Story = {
  args: {
    items: [
      {id: "a", label: "Cut", group: "Edit"},
      {id: "b", label: "Copy", group: "Edit"},
      {id: "c", label: "Paste", group: "Edit", separatorBefore: true},
      {id: "d", label: "Zoom in", group: "View"},
      {id: "e", label: "Fullscreen"},
    ],
  },
  play: async ({canvasElement}) => {
    const canvas = within(canvasElement);
    await userEvent.click(trigger(canvasElement));
    await opened(canvasElement);
    const groups = canvas.getAllByRole("group");
    await expect(groups).toHaveLength(2);
    await expect(groups[0]).toHaveAccessibleName("Edit");
    await expect(groups[1]).toHaveAccessibleName("View");
    await expect(within(groups[0]).getAllByRole("menuitem")).toHaveLength(3);
    // The separator is a real separator, positioned before "Paste" and not at the edges.
    const separators = canvas.getAllByRole("separator");
    await expect(separators).toHaveLength(1);
    await expect(separators[0].nextElementSibling).toBe(item(canvasElement, "Paste"));
    // Arrow keys go through every group in order.
    await userEvent.keyboard("{ArrowDown}{ArrowDown}{ArrowDown}{ArrowDown}");
    await expect(item(canvasElement, "Zoom in")).toHaveFocus();
    await userEvent.keyboard("{ArrowDown}");
    await expect(item(canvasElement, "Fullscreen")).toHaveFocus();
  },
};

export const LinkItems: Story = {
  args: {
    items: [
      {id: "docs", label: "Documentation", href: "https://example.com/docs"},
      {id: "section", label: "Jump to section", href: "#section"},
      {id: "unsafe", label: "Unsafe", href: "javascript:alert(1)"},
    ],
  },
  play: async ({canvasElement, args}) => {
    // Do not actually navigate while testing.
    const stop = (event: Event) => event.preventDefault();
    document.addEventListener("click", stop);
    try {
      await userEvent.click(trigger(canvasElement));
      await opened(canvasElement);
      const docs = item(canvasElement, "Documentation");
      await expect(docs.tagName).toBe("A");
      await expect(docs).toHaveAttribute("href", "https://example.com/docs");
      await expect(docs).toHaveAttribute("target", "_blank");
      await expect(docs).toHaveAttribute("rel", "noopener noreferrer");
      await expect(item(canvasElement, "Jump to section")).not.toHaveAttribute("target");
      // A script link is never rendered as a link.
      await expect(item(canvasElement, "Unsafe").tagName).toBe("BUTTON");
      await expect(item(canvasElement, "Unsafe")).not.toHaveAttribute("href");
      await userEvent.click(docs);
      await expect(args.onSelect).toHaveBeenCalledWith("docs");
      await closed(canvasElement);
      // Links can be chosen from the keyboard too, and Space follows a link like Enter.
      await userEvent.keyboard("{ArrowDown}");
      await opened(canvasElement);
      await userEvent.keyboard("{ArrowDown} ");
      await expect(args.onSelect).toHaveBeenLastCalledWith("section");
    } finally {
      document.removeEventListener("click", stop);
    }
  },
};

export const Controlled: Story = {
  render: args => {
    const [open, setOpen] = useState(false);
    return (
      <div>
        <DropdownMenu {...args} open={open} onOpenChange={next => { args.onOpenChange?.(next); setOpen(next); }} />
        <Text>{open ? "Parent: open" : "Parent: closed"}</Text>
        <Button onClick={() => setOpen(true)}>External open</Button>
      </div>
    );
  },
  play: async ({canvasElement, args}) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole("button", {name: "External open"}));
    await opened(canvasElement);
    await expect(canvas.getByText("Parent: open")).toBeVisible();
    await userEvent.keyboard("{Escape}");
    await closed(canvasElement);
    await expect(canvas.getByText("Parent: closed")).toBeVisible();
    await expect(args.onOpenChange).toHaveBeenCalledTimes(1);
  },
};

export const ControlledParentRefuses: Story = {
  args: {open: true},
  play: async ({canvasElement, args}) => {
    await opened(canvasElement);
    await userEvent.keyboard("{Escape}");
    await expect(args.onOpenChange).toHaveBeenLastCalledWith(false);
    await expect(menu(canvasElement)).toBeVisible();
  },
};

export const FlipsAtBottomEdge: Story = {
  decorators: [Story => <div style={{position: "fixed", bottom: 8, left: 120}}><Story /></div>],
  parameters: {layout: "fullscreen"},
  play: async ({canvasElement}) => {
    await userEvent.click(trigger(canvasElement));
    await opened(canvasElement);
    // No room below a trigger at the bottom of the viewport, so the menu opens above it.
    await waitFor(() => expect(menu(canvasElement).getBoundingClientRect().bottom).toBeLessThanOrEqual(trigger(canvasElement).getBoundingClientRect().top));
    await expect(menu(canvasElement).getBoundingClientRect().top).toBeGreaterThanOrEqual(0);
  },
};

export const StaysInsideViewportAtRightEdge: Story = {
  args: {align: "start"},
  decorators: [Story => <div style={{position: "fixed", top: 40, right: 8}}><Story /></div>],
  parameters: {layout: "fullscreen"},
  play: async ({canvasElement}) => {
    await userEvent.click(trigger(canvasElement));
    await opened(canvasElement);
    await waitFor(() => {
      const rect = menu(canvasElement).getBoundingClientRect();
      expect(rect.right).toBeLessThanOrEqual(window.innerWidth);
      expect(rect.left).toBeGreaterThanOrEqual(0);
    });
  },
};

export const LongLabelsWrap: Story = {
  args: {items: [{id: "x", label: "A_very_long_unbroken_menu_label_that_must_wrap_inside_the_menu_instead_of_overflowing_it_horizontally"}, {id: "y", label: "Short"}]},
  play: async ({canvasElement}) => {
    await userEvent.click(trigger(canvasElement));
    await opened(canvasElement);
    const rect = menu(canvasElement).getBoundingClientRect();
    await expect(rect.width).toBeLessThanOrEqual(280);
    await expect(rect.right).toBeLessThanOrEqual(window.innerWidth);
    await expect(menu(canvasElement).scrollWidth).toBeLessThanOrEqual(menu(canvasElement).clientWidth);
  },
};

export const InsideDialog: Story = {
  render: args => (
    <Dialog title="Project" trigger={<Button>Open dialog</Button>}>
      <DropdownMenu {...args} />
    </Dialog>
  ),
  play: async ({canvasElement, args}) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole("button", {name: "Open dialog"}));
    await waitFor(() => expect(canvas.getByRole("dialog", {name: "Project"})).toBeVisible());
    // The menu is rendered beside its trigger, so it is inside the modal dialog and not inert.
    await userEvent.click(trigger(canvasElement));
    await opened(canvasElement);
    await userEvent.keyboard("{ArrowDown}");
    await expect(item(canvasElement, "New file")).toHaveFocus();
    // Escape closes the menu and returns to its trigger; the dialog stays open.
    await userEvent.keyboard("{Escape}");
    await closed(canvasElement);
    await expect(trigger(canvasElement)).toHaveFocus();
    await expect(canvasElement.querySelector("dialog")!.open).toBe(true);
    await userEvent.click(trigger(canvasElement));
    await opened(canvasElement);
    await userEvent.click(item(canvasElement, "Rename"));
    await expect(args.onSelect).toHaveBeenCalledWith("rename");
    await expect(canvasElement.querySelector("dialog")!.open).toBe(true);
  },
};

export const Dark: Story = {globals: {theme: "dark"}, args: {defaultOpen: true}};

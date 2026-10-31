import {useState} from "react";
import type {Meta, StoryObj} from "@storybook/react-vite";
import {expect, fn, userEvent, waitFor, within} from "storybook/test";
import {Popover} from "./Popover";
import {Button} from "../Button/Button";
import {Card} from "../Card/Card";
import {Checkbox} from "../Checkbox/Checkbox";
import {Dialog} from "../Dialog/Dialog";
import {Input} from "../Input/Input";
import {Stack} from "../Stack/Stack";
import {Text} from "../Text/Text";

const meta = {
  title: "Components/Popover",
  component: Popover,
  // Room on every side so the preferred placement fits.
  decorators: [Story => <div style={{padding: "140px 100px"}}><Story /></div>],
  args: {
    trigger: <Button variant="outline">Open popover</Button>,
    children: <Text>Popover content.</Text>,
    onOpenChange: fn(),
  },
  argTypes: {
    placement: {control: "inline-radio", options: ["top", "bottom", "left", "right"]},
    align: {control: "inline-radio", options: ["start", "center", "end"]},
    open: {control: "boolean"},
    defaultOpen: {control: "boolean"},
    closeOnOutsideClick: {control: "boolean"},
    closeOnEscape: {control: "boolean"},
    label: {control: "text"},
    trigger: {control: false},
    children: {control: false},
    onOpenChange: {control: false},
    ref: {control: false},
    className: {control: false},
  },
} satisfies Meta<typeof Popover>;

export default meta;
type Story = StoryObj<typeof meta>;

const trigger = (canvasElement: HTMLElement) => within(canvasElement).getByRole("button", {name: "Open popover"});
const panel = (canvasElement: HTMLElement) => canvasElement.querySelector<HTMLElement>(".vl-popover");
const shown = (canvasElement: HTMLElement) => waitFor(() => expect(panel(canvasElement)).toBeVisible());
const gone = (canvasElement: HTMLElement) => waitFor(() => expect(panel(canvasElement)).toBeNull());

export const Basic: Story = {
  play: async ({canvasElement, args}) => {
    const canvas = within(canvasElement);
    await expect(trigger(canvasElement)).toHaveAttribute("aria-expanded", "false");
    await expect(trigger(canvasElement)).not.toHaveAttribute("aria-controls");
    await expect(panel(canvasElement)).toBeNull();
    await userEvent.click(trigger(canvasElement));
    await shown(canvasElement);
    await expect(trigger(canvasElement)).toHaveAttribute("aria-expanded", "true");
    await expect(trigger(canvasElement)).toHaveAttribute("aria-controls", panel(canvasElement)!.id);
    await expect(panel(canvasElement)).toHaveAttribute("popover", "manual");
    await expect(panel(canvasElement)!.matches(":popover-open")).toBe(true);
    await expect(args.onOpenChange).toHaveBeenLastCalledWith(true);
    // Not a modal dialog: nothing claims a dialog role and the page stays interactive.
    await expect(canvas.queryByRole("dialog")).toBeNull();
    await userEvent.click(trigger(canvasElement));
    await gone(canvasElement);
    await expect(trigger(canvasElement)).toHaveAttribute("aria-expanded", "false");
    await expect(args.onOpenChange).toHaveBeenLastCalledWith(false);
    await expect(args.onOpenChange).toHaveBeenCalledTimes(2);
  },
};

export const InitiallyOpen: Story = {
  args: {defaultOpen: true},
  play: async ({canvasElement, args}) => {
    await shown(canvasElement);
    await expect(trigger(canvasElement)).toHaveAttribute("aria-expanded", "true");
    await expect(args.onOpenChange).not.toHaveBeenCalled();
  },
};

export const KeyboardToggle: Story = {
  play: async ({canvasElement}) => {
    await userEvent.tab();
    await expect(trigger(canvasElement)).toHaveFocus();
    await userEvent.keyboard("{Enter}");
    await shown(canvasElement);
    // Focus stays on the trigger: the popover does not steal it.
    await expect(trigger(canvasElement)).toHaveFocus();
    await userEvent.keyboard(" ");
    await gone(canvasElement);
    await expect(trigger(canvasElement)).toHaveFocus();
  },
};

export const Controlled: Story = {
  render: args => {
    const [open, setOpen] = useState(false);
    return (
      <Stack align="start">
        <Popover {...args} open={open} onOpenChange={next => { args.onOpenChange?.(next); setOpen(next); }} />
        <Text>{open ? "Parent: open" : "Parent: closed"}</Text>
        <Button onClick={() => setOpen(true)}>External open</Button>
      </Stack>
    );
  },
  play: async ({canvasElement, args}) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByText("Parent: closed")).toBeVisible();
    await userEvent.click(canvas.getByRole("button", {name: "External open"}));
    await shown(canvasElement);
    await expect(canvas.getByText("Parent: open")).toBeVisible();
    await userEvent.keyboard("{Escape}");
    await gone(canvasElement);
    await expect(canvas.getByText("Parent: closed")).toBeVisible();
    await expect(args.onOpenChange).toHaveBeenCalledTimes(1);
    await expect(args.onOpenChange).toHaveBeenLastCalledWith(false);
  },
};

export const ControlledParentRefuses: Story = {
  args: {open: true},
  play: async ({canvasElement, args}) => {
    await shown(canvasElement);
    await userEvent.keyboard("{Escape}");
    await expect(args.onOpenChange).toHaveBeenLastCalledWith(false);
    await expect(panel(canvasElement)).not.toBeNull();
  },
};

function placed(side: "top" | "bottom" | "left" | "right"): Story {
  return {
    args: {defaultOpen: true, placement: side, children: <Text>Hi</Text>},
    play: async ({canvasElement}) => {
      await shown(canvasElement);
      const t = trigger(canvasElement).getBoundingClientRect();
      await waitFor(() => {
        const p = panel(canvasElement)!.getBoundingClientRect();
        if (side === "top") expect(p.bottom).toBeLessThanOrEqual(t.top);
        if (side === "bottom") expect(p.top).toBeGreaterThanOrEqual(t.bottom);
        if (side === "left") expect(p.right).toBeLessThanOrEqual(t.left);
        if (side === "right") expect(p.left).toBeGreaterThanOrEqual(t.right);
      });
      await expect(panel(canvasElement)).toHaveAttribute("data-side", side);
    },
  };
}
export const PlacementTop: Story = placed("top");
export const PlacementBottom: Story = placed("bottom");
export const PlacementLeft: Story = placed("left");
export const PlacementRight: Story = placed("right");

export const AlignStart: Story = {
  args: {defaultOpen: true, align: "start", children: <Text>Popover content that is wider than the trigger button.</Text>},
  play: async ({canvasElement}) => {
    await shown(canvasElement);
    await waitFor(() => expect(Math.round(panel(canvasElement)!.getBoundingClientRect().left)).toBe(Math.round(trigger(canvasElement).getBoundingClientRect().left)));
  },
};

export const AlignEnd: Story = {
  decorators: [Story => <div style={{marginLeft: 300}}><Story /></div>],
  args: {defaultOpen: true, align: "end", children: <Text>Popover content that is wider than the trigger button.</Text>},
  play: async ({canvasElement}) => {
    await shown(canvasElement);
    await waitFor(() => expect(Math.round(panel(canvasElement)!.getBoundingClientRect().right)).toBe(Math.round(trigger(canvasElement).getBoundingClientRect().right)));
  },
};

export const OutsideClickCloses: Story = {
  decorators: [Story => <div><Story /><Button variant="ghost" data-testid="outside">Elsewhere</Button></div>],
  play: async ({canvasElement, args}) => {
    const canvas = within(canvasElement);
    await userEvent.click(trigger(canvasElement));
    await shown(canvasElement);
    // A press inside does not close it.
    await userEvent.click(canvas.getByText("Popover content."));
    await expect(panel(canvasElement)).not.toBeNull();
    await userEvent.click(canvas.getByRole("button", {name: "Elsewhere"}));
    await gone(canvasElement);
    await expect(args.onOpenChange).toHaveBeenLastCalledWith(false);
    await expect(args.onOpenChange).toHaveBeenCalledTimes(2);
  },
};

export const OutsideClickDisabled: Story = {
  args: {closeOnOutsideClick: false, defaultOpen: true},
  decorators: [Story => <div><Story /><Button variant="ghost">Elsewhere</Button></div>],
  play: async ({canvasElement}) => {
    await shown(canvasElement);
    await userEvent.click(within(canvasElement).getByRole("button", {name: "Elsewhere"}));
    await expect(panel(canvasElement)).not.toBeNull();
  },
};

export const EscapeCloses: Story = {
  play: async ({canvasElement}) => {
    await userEvent.click(trigger(canvasElement));
    await shown(canvasElement);
    await userEvent.keyboard("{Escape}");
    await gone(canvasElement);
  },
};

export const EscapeDisabled: Story = {
  args: {closeOnEscape: false, defaultOpen: true},
  play: async ({canvasElement}) => {
    await shown(canvasElement);
    await userEvent.keyboard("{Escape}");
    await expect(panel(canvasElement)).not.toBeNull();
  },
};

export const InteractiveContent: Story = {
  args: {label: "Filters"},
  render: args => {
    const [name, setName] = useState("");
    const [urgent, setUrgent] = useState(false);
    return (
      <div>
        <Popover {...args} children={
          <Stack>
            <Input value={name} onChange={event => setName(event.target.value)} label="Name" />
            <Checkbox checked={urgent} onCheckedChange={setUrgent} label="Only urgent" />
          </Stack>
        } />
        <Button variant="ghost">After</Button>
      </div>
    );
  },
  play: async ({canvasElement}) => {
    const canvas = within(canvasElement);
    await userEvent.tab();
    await userEvent.keyboard("{Enter}");
    await waitFor(() => expect(canvas.getByRole("group", {name: "Filters"})).toBeVisible());
    // The panel follows the trigger in the DOM, so Tab leads straight into it without any focus management.
    await userEvent.tab();
    await expect(canvas.getByRole("textbox", {name: "Name"})).toHaveFocus();
    await userEvent.keyboard("Ada");
    await expect(canvas.getByRole("textbox", {name: "Name"})).toHaveValue("Ada");
    await userEvent.click(canvas.getByRole("checkbox", {name: "Only urgent"}));
    await expect(canvas.getByRole("checkbox", {name: "Only urgent"})).toBeChecked();
    // Clicking inside never closes it or loses what was typed.
    await expect(panel(canvasElement)).not.toBeNull();
    // Escape from inside returns focus to the trigger.
    await canvas.getByRole("textbox", {name: "Name"}).focus();
    await userEvent.keyboard("{Escape}");
    await gone(canvasElement);
    await expect(trigger(canvasElement)).toHaveFocus();
  },
};

export const TabbingOutCloses: Story = {
  render: args => <div><Popover {...args} children={<Input value="" label="Name" />} /><Button variant="ghost">After</Button></div>,
  play: async ({canvasElement}) => {
    const canvas = within(canvasElement);
    await userEvent.click(trigger(canvasElement));
    await waitFor(() => expect(canvas.getByRole("textbox", {name: "Name"})).toBeVisible());
    await userEvent.tab();
    await expect(canvas.getByRole("textbox", {name: "Name"})).toHaveFocus();
    await userEvent.tab();
    await expect(canvas.getByRole("button", {name: "After"})).toHaveFocus();
    await gone(canvasElement);
  },
};

export const NotClippedByOverflow: Story = {
  args: {defaultOpen: true, children: <Text>A popover wider and taller than the box that contains its trigger.</Text>},
  decorators: [Story => <div data-testid="box" style={{width: 120, height: 40, overflow: "hidden", border: "1px solid"}}><Story /></div>],
  play: async ({canvasElement}) => {
    await shown(canvasElement);
    const box = canvasElement.querySelector<HTMLElement>("[data-testid=box]")!.getBoundingClientRect();
    await waitFor(() => expect(panel(canvasElement)!.getBoundingClientRect().height).toBeGreaterThan(0));
    // It lives in the top layer, so it extends past the clipping ancestor and is fully visible.
    await expect(panel(canvasElement)!.getBoundingClientRect().bottom).toBeGreaterThan(box.bottom);
    await expect(within(canvasElement).getByText(/A popover wider/)).toBeVisible();
  },
};

export const FollowsScrolling: Story = {
  args: {defaultOpen: true},
  decorators: [Story => (
    <div data-testid="scroller" style={{width: 300, height: 260, overflow: "auto", border: "1px solid"}}>
      <div style={{height: 600, padding: 120}}><Story /></div>
    </div>
  )],
  play: async ({canvasElement}) => {
    await shown(canvasElement);
    const scroller = canvasElement.querySelector<HTMLElement>("[data-testid=scroller]")!;
    const gap = () => panel(canvasElement)!.getBoundingClientRect().top - trigger(canvasElement).getBoundingClientRect().bottom;
    await waitFor(() => expect(gap()).toBeGreaterThan(0));
    const before = gap();
    scroller.scrollTop = 30;
    // The trigger moved 30px up; the panel keeps its distance from it.
    await waitFor(() => expect(Math.abs(gap() - before)).toBeLessThan(2));
  },
};

export const FlipsAtViewportEdge: Story = {
  args: {defaultOpen: true, placement: "right", children: <div style={{width: 240}}><Text>Content needing room beside the trigger.</Text></div>},
  decorators: [Story => <div style={{display: "flex", justifyContent: "flex-end", padding: 0}}><Story /></div>],
  parameters: {layout: "fullscreen"},
  play: async ({canvasElement}) => {
    await shown(canvasElement);
    await waitFor(() => {
      const p = panel(canvasElement)!.getBoundingClientRect();
      const t = trigger(canvasElement).getBoundingClientRect();
      // No room on the right of a trigger at the right edge, so it flips left and stays inside the viewport.
      expect(p.right).toBeLessThanOrEqual(window.innerWidth);
      expect(p.left).toBeGreaterThanOrEqual(0);
      expect(p.right).toBeLessThanOrEqual(t.left);
    });
    await expect(panel(canvasElement)).toHaveAttribute("data-side", "left");
  },
};

export const InsideCard: Story = {
  decorators: [Story => <div style={{width: 280}}><Card title="Card"><Story /></Card></div>],
  play: async ({canvasElement}) => {
    await userEvent.click(trigger(canvasElement));
    await shown(canvasElement);
  },
};

export const InsideDialog: Story = {
  render: args => (
    <Dialog title="Settings" trigger={<Button>Open dialog</Button>}>
      <Popover {...args} children={<Input value="" label="Nickname" />} />
    </Dialog>
  ),
  play: async ({canvasElement}) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole("button", {name: "Open dialog"}));
    await waitFor(() => expect(canvas.getByRole("dialog", {name: "Settings"})).toBeVisible());
    // The popover is rendered next to its trigger, so it is inside the modal dialog and not inert.
    await userEvent.click(trigger(canvasElement));
    await waitFor(() => expect(canvas.getByRole("textbox", {name: "Nickname"})).toBeVisible());
    await userEvent.click(canvas.getByRole("textbox", {name: "Nickname"}));
    await expect(canvas.getByRole("textbox", {name: "Nickname"})).toHaveFocus();
    // Escape closes the popover first; the dialog stays open until the next Escape.
    await userEvent.keyboard("{Escape}");
    await gone(canvasElement);
    await expect(canvasElement.querySelector("dialog")!.open).toBe(true);
    await userEvent.keyboard("{Escape}");
    await waitFor(() => expect(canvasElement.querySelector("dialog")!.open).toBe(false));
  },
};

export const Dark: Story = {globals: {theme: "dark"}, args: {defaultOpen: true}};

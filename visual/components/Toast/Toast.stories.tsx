import {useState} from "react";
import type {Meta, StoryObj} from "@storybook/react-vite";
import {expect, fn, userEvent, waitFor, within} from "storybook/test";
import {Toast} from "./Toast";
import type {ToastItem} from "./Toast";
import {Button} from "../Button/Button";
import {Stack} from "../Stack/Stack";

const items: ToastItem[] = [
  {id: "saved", title: "Changes saved", description: "Your profile was updated.", variant: "success", duration: 0},
];

const meta = {
  title: "Components/Toast",
  component: Toast,
  // Each story is rendered in its own frame on the docs page, because the stack is fixed to the viewport corner.
  parameters: {layout: "fullscreen", docs: {story: {inline: false, iframeHeight: 320}}},
  args: {items, onDismiss: fn()},
  argTypes: {
    position: {control: "inline-radio", options: ["top-right", "top-left", "bottom-right", "bottom-left"]},
    label: {control: "text"},
    items: {control: "object"},
    onDismiss: {control: false},
    ref: {control: false},
    className: {control: false},
  },
} satisfies Meta<typeof Toast>;

export default meta;
type Story = StoryObj<typeof meta>;

const region = (canvasElement: HTMLElement) => within(canvasElement).getByRole("region", {name: "Notifications"});
const dismissButton = (canvasElement: HTMLElement, title: string) => within(canvasElement).getByRole("button", {name: `Dismiss: ${title}`});
const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export const SingleToast: Story = {
  play: async ({canvasElement}) => {
    const canvas = within(canvasElement);
    await expect(region(canvasElement)).toBeVisible();
    await expect(canvas.getByText("Changes saved")).toBeVisible();
    await expect(canvas.getByText("Your profile was updated.")).toBeVisible();
    // The status is in words as well as colour.
    await expect(canvas.getByText("Success:")).toBeInTheDocument();
    // One polite live region holds the notifications and exists for as long as the component does.
    await expect(region(canvasElement).querySelector("[aria-live=polite]")).not.toBeNull();
    await expect(region(canvasElement).matches(":popover-open")).toBe(true);
  },
};

export const MultipleToastsKeepTheirOrder: Story = {
  args: {items: [
    {id: "a", title: "First", duration: 0},
    {id: "b", title: "Second", duration: 0},
    {id: "c", title: "Third", duration: 0},
  ]},
  play: async ({canvasElement}) => {
    const titles = Array.from(canvasElement.querySelectorAll(".vl-toast__title")).map(element => element.textContent);
    await expect(titles).toEqual(["First", "Second", "Third"]);
  },
};

export const AllVariants: Story = {
  args: {items: [
    {id: "d", title: "Plain notice", duration: 0},
    {id: "s", title: "Saved", variant: "success", duration: 0},
    {id: "w", title: "Storage almost full", variant: "warning", duration: 0},
    {id: "e", title: "Upload failed", description: "The file is too large.", variant: "error"},
  ]},
  play: async ({canvasElement}) => {
    const canvas = within(canvasElement);
    await expect(canvasElement.querySelectorAll(".vl-toast")).toHaveLength(4);
    // Only the error interrupts the screen reader; the rest are polite additions to the live region.
    await expect(canvas.getAllByRole("alert")).toHaveLength(1);
    await expect(canvas.getByRole("alert")).toHaveTextContent("Upload failed");
    await expect(canvas.getByText("Warning:")).toBeInTheDocument();
    await expect(canvas.getByText("Error:")).toBeInTheDocument();
  },
};

export const DismissButton: Story = {
  play: async ({canvasElement, args}) => {
    await userEvent.click(dismissButton(canvasElement, "Changes saved"));
    await waitFor(() => expect(within(canvasElement).queryByText("Changes saved")).toBeNull());
    await expect(args.onDismiss).toHaveBeenCalledTimes(1);
    await expect(args.onDismiss).toHaveBeenCalledWith("saved");
    // The region stays so later notifications are announced.
    await expect(region(canvasElement)).toBeInTheDocument();
  },
};

export const DismissWithoutHandler: Story = {
  args: {onDismiss: undefined},
  play: async ({canvasElement}) => {
    await userEvent.click(dismissButton(canvasElement, "Changes saved"));
    await waitFor(() => expect(within(canvasElement).queryByText("Changes saved")).toBeNull());
  },
};

function Controlled({initial, ...props}: {initial: ToastItem[]} & Partial<React.ComponentProps<typeof Toast>>) {
  const [list, setList] = useState(initial);
  const [count, setCount] = useState(0);
  return (
    <Stack align="start">
      <Button onClick={() => { setList(current => [...current, {id: `n${count}`, title: `Notification ${count}`, duration: 0}]); setCount(count + 1); }}>Add</Button>
      <Button variant="outline" onClick={() => setList([])}>Clear</Button>
      <Toast {...props} items={list} onDismiss={id => { props.onDismiss?.(id); setList(current => current.filter(item => item.id !== id)); }} />
    </Stack>
  );
}

export const AddingAndRemovingItems: Story = {
  render: args => <Controlled {...args} initial={[]} />,
  play: async ({canvasElement, args}) => {
    const canvas = within(canvasElement);
    await expect(canvasElement.querySelectorAll(".vl-toast")).toHaveLength(0);
    await userEvent.click(canvas.getByRole("button", {name: "Add"}));
    await userEvent.click(canvas.getByRole("button", {name: "Add"}));
    await expect(canvasElement.querySelectorAll(".vl-toast")).toHaveLength(2);
    // New notifications never take focus.
    await expect(canvas.getByRole("button", {name: "Add"})).toHaveFocus();
    await userEvent.click(dismissButton(canvasElement, "Notification 0"));
    await waitFor(() => expect(canvas.queryByText("Notification 0")).toBeNull());
    await expect(args.onDismiss).toHaveBeenCalledWith("n0");
    await expect(canvas.getByText("Notification 1")).toBeVisible();
    await userEvent.click(canvas.getByRole("button", {name: "Clear"}));
    await expect(canvasElement.querySelectorAll(".vl-toast")).toHaveLength(0);
  },
};

export const IdCanBeShownAgainAfterItLeft: Story = {
  render: args => {
    const [list, setList] = useState<ToastItem[]>([{id: "x", title: "Same id", duration: 0}]);
    return (
      <Stack align="start">
        <Button onClick={() => setList([])}>Remove</Button>
        <Button onClick={() => setList([{id: "x", title: "Same id", duration: 0}])}>Show</Button>
        <Toast {...args} items={list} onDismiss={undefined} />
      </Stack>
    );
  },
  play: async ({canvasElement}) => {
    const canvas = within(canvasElement);
    await userEvent.click(dismissButton(canvasElement, "Same id"));
    await waitFor(() => expect(canvas.queryByText("Same id")).toBeNull());
    // Still in the list, still hidden: dismissing is remembered while the id stays.
    await userEvent.click(canvas.getByRole("button", {name: "Show"}));
    await expect(canvas.queryByText("Same id")).toBeNull();
    await userEvent.click(canvas.getByRole("button", {name: "Remove"}));
    await userEvent.click(canvas.getByRole("button", {name: "Show"}));
    await expect(canvas.getByText("Same id")).toBeVisible();
  },
};

export const AutomaticTimeout: Story = {
  args: {items: [{id: "t", title: "Gone soon", duration: 300}, {id: "k", title: "Stays", duration: 0}]},
  play: async ({canvasElement, args}) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByText("Gone soon")).toBeVisible();
    await waitFor(() => expect(canvas.queryByText("Gone soon")).toBeNull());
    // Reported once, so there was one timer.
    await expect(args.onDismiss).toHaveBeenCalledTimes(1);
    await expect(args.onDismiss).toHaveBeenCalledWith("t");
    await expect(canvas.getByText("Stays")).toBeVisible();
  },
};

export const ErrorsDoNotDisappearByThemselves: Story = {
  args: {items: [{id: "e", title: "Payment failed", variant: "error"}]},
  play: async ({canvasElement, args}) => {
    await sleep(600);
    await expect(within(canvasElement).getByText("Payment failed")).toBeVisible();
    await expect(args.onDismiss).not.toHaveBeenCalled();
  },
};

export const HoverPausesTheTimer: Story = {
  args: {items: [{id: "h", title: "Reading this", duration: 400}]},
  play: async ({canvasElement, args}) => {
    const canvas = within(canvasElement);
    const card = canvasElement.querySelector<HTMLElement>(".vl-toast")!;
    await userEvent.hover(card);
    await sleep(900);
    await expect(canvas.getByText("Reading this")).toBeVisible();
    await expect(args.onDismiss).not.toHaveBeenCalled();
    await userEvent.unhover(card);
    await waitFor(() => expect(canvas.queryByText("Reading this")).toBeNull());
    await expect(args.onDismiss).toHaveBeenCalledTimes(1);
  },
};

export const FocusPausesTheTimer: Story = {
  args: {items: [{id: "f", title: "Focused one", duration: 400}]},
  play: async ({canvasElement, args}) => {
    const canvas = within(canvasElement);
    await userEvent.tab();
    await expect(dismissButton(canvasElement, "Focused one")).toHaveFocus();
    await sleep(900);
    await expect(canvas.getByText("Focused one")).toBeVisible();
    await expect(args.onDismiss).not.toHaveBeenCalled();
    dismissButton(canvasElement, "Focused one").blur();
    await waitFor(() => expect(canvas.queryByText("Focused one")).toBeNull());
  },
};

function atCorner(position: "top-right" | "top-left" | "bottom-right" | "bottom-left"): Story {
  return {
    args: {position},
    play: async ({canvasElement}) => {
      const card = canvasElement.querySelector<HTMLElement>(".vl-toast")!.getBoundingClientRect();
      const [vertical, horizontal] = position.split("-");
      if (vertical === "top") await expect(card.top).toBeLessThan(window.innerHeight / 3);
      else await expect(card.bottom).toBeGreaterThan(window.innerHeight * 2 / 3);
      if (horizontal === "left") await expect(card.left).toBeLessThan(window.innerWidth / 3);
      else await expect(card.right).toBeGreaterThan(window.innerWidth * 2 / 3);
      await expect(card.left).toBeGreaterThanOrEqual(0);
      await expect(card.right).toBeLessThanOrEqual(window.innerWidth);
      await expect(card.top).toBeGreaterThanOrEqual(0);
      await expect(card.bottom).toBeLessThanOrEqual(window.innerHeight);
    },
  };
}
export const TopRight: Story = atCorner("top-right");
export const TopLeft: Story = atCorner("top-left");
export const BottomRight: Story = atCorner("bottom-right");
export const BottomLeft: Story = atCorner("bottom-left");

export const NoItems: Story = {
  args: {items: []},
  play: async ({canvasElement}) => {
    await expect(canvasElement.querySelectorAll(".vl-toast")).toHaveLength(0);
    await expect(region(canvasElement)).toBeInTheDocument();
  },
};

export const LongTextWraps: Story = {
  args: {items: [{id: "l", title: "A_very_long_unbroken_title_that_must_wrap_instead_of_overflowing_the_toast", description: "Plus a long description that goes on for quite a while so that the notification has to wrap it over several lines.", duration: 0}]},
  play: async ({canvasElement}) => {
    const card = canvasElement.querySelector<HTMLElement>(".vl-toast")!;
    await expect(card.getBoundingClientRect().right).toBeLessThanOrEqual(window.innerWidth);
    await expect(card.scrollWidth).toBeLessThanOrEqual(card.clientWidth);
  },
};

export const Dark: Story = {
  globals: {theme: "dark"},
  args: {items: [
    {id: "d", title: "Plain notice", duration: 0},
    {id: "s", title: "Saved", description: "All changes are stored.", variant: "success", duration: 0},
    {id: "w", title: "Storage almost full", variant: "warning", duration: 0},
    {id: "e", title: "Upload failed", variant: "error"},
  ]},
};

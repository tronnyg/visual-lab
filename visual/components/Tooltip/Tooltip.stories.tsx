import type {Meta, StoryObj} from "@storybook/react-vite";
import {expect, userEvent, waitFor, within} from "storybook/test";
import {Tooltip} from "./Tooltip";
import {Button} from "../Button/Button";
import {Dialog} from "../Dialog/Dialog";
import {Popover} from "../Popover/Popover";
import {Text} from "../Text/Text";

const meta = {
  title: "Components/Tooltip",
  component: Tooltip,
  decorators: [Story => <div style={{padding: "100px 120px"}}><Story /></div>],
  args: {
    content: "Save your changes",
    delay: 50,
    children: <Button>Save</Button>,
  },
  argTypes: {
    placement: {control: "inline-radio", options: ["top", "bottom", "left", "right"]},
    delay: {control: "number"},
    disabled: {control: "boolean"},
    content: {control: "text"},
    children: {control: false},
    ref: {control: false},
    className: {control: false},
  },
} satisfies Meta<typeof Tooltip>;

export default meta;
type Story = StoryObj<typeof meta>;

const trigger = (canvasElement: HTMLElement) => within(canvasElement).getByRole("button", {name: "Save"});
const tip = (canvasElement: HTMLElement) => canvasElement.querySelector<HTMLElement>("[role=tooltip]")!;
const isShown = (canvasElement: HTMLElement) => waitFor(() => expect(tip(canvasElement)).toBeVisible());
const isHidden = (canvasElement: HTMLElement) => waitFor(() => expect(tip(canvasElement)).not.toBeVisible());

export const Hidden: Story = {
  play: async ({canvasElement}) => {
    // Always in the DOM so the trigger can reference it, but not shown.
    await expect(tip(canvasElement)).not.toBeVisible();
    await expect(tip(canvasElement)).toHaveTextContent("Save your changes");
    await expect(trigger(canvasElement)).toHaveAttribute("aria-describedby", tip(canvasElement).id);
    await expect(trigger(canvasElement)).toHaveAccessibleDescription("Save your changes");
    // It is not a focus target.
    await expect(tip(canvasElement)).not.toHaveAttribute("tabindex");
  },
};

export const ShowsOnHover: Story = {
  play: async ({canvasElement}) => {
    await userEvent.hover(trigger(canvasElement));
    await isShown(canvasElement);
    await expect(tip(canvasElement)).toHaveAttribute("role", "tooltip");
    // Hovering does not move focus.
    await expect(trigger(canvasElement)).not.toHaveFocus();
    await userEvent.unhover(trigger(canvasElement));
    await isHidden(canvasElement);
  },
};

export const DelayedAppearance: Story = {
  args: {delay: 400},
  play: async ({canvasElement}) => {
    await userEvent.hover(trigger(canvasElement));
    await new Promise(resolve => setTimeout(resolve, 150));
    await expect(tip(canvasElement)).not.toBeVisible();
    await isShown(canvasElement);
  },
};

export const LeavingBeforeDelayCancels: Story = {
  args: {delay: 200},
  play: async ({canvasElement}) => {
    await userEvent.hover(trigger(canvasElement));
    await userEvent.unhover(trigger(canvasElement));
    await new Promise(resolve => setTimeout(resolve, 400));
    await expect(tip(canvasElement)).not.toBeVisible();
  },
};

export const ShowsOnKeyboardFocus: Story = {
  args: {delay: 5000},
  play: async ({canvasElement}) => {
    await userEvent.tab();
    await expect(trigger(canvasElement)).toHaveFocus();
    // Focus shows it at once, whatever the hover delay.
    await isShown(canvasElement);
    await userEvent.tab();
    await isHidden(canvasElement);
  },
};

export const EscapeHides: Story = {
  play: async ({canvasElement}) => {
    await userEvent.tab();
    await isShown(canvasElement);
    await userEvent.keyboard("{Escape}");
    await isHidden(canvasElement);
    // Focus stays where it was.
    await expect(trigger(canvasElement)).toHaveFocus();
  },
};

export const ClickingHides: Story = {
  args: {delay: 0},
  play: async ({canvasElement}) => {
    await userEvent.hover(trigger(canvasElement));
    await isShown(canvasElement);
    await userEvent.click(trigger(canvasElement));
    await isHidden(canvasElement);
    // The focus caused by the click does not bring it back.
    await new Promise(resolve => setTimeout(resolve, 200));
    await expect(tip(canvasElement)).not.toBeVisible();
  },
};

export const PointerCanMoveOntoTooltip: Story = {
  play: async ({canvasElement}) => {
    await userEvent.hover(trigger(canvasElement));
    await isShown(canvasElement);
    await userEvent.unhover(trigger(canvasElement));
    await userEvent.hover(tip(canvasElement));
    await new Promise(resolve => setTimeout(resolve, 300));
    await expect(tip(canvasElement)).toBeVisible();
    await userEvent.unhover(tip(canvasElement));
    await isHidden(canvasElement);
  },
};

export const Disabled: Story = {
  args: {disabled: true},
  play: async ({canvasElement}) => {
    await userEvent.hover(trigger(canvasElement));
    await userEvent.tab();
    await new Promise(resolve => setTimeout(resolve, 200));
    await expect(tip(canvasElement)).not.toBeVisible();
    await expect(trigger(canvasElement)).not.toHaveAttribute("aria-describedby");
  },
};

export const KeepsTriggerOwnDescription: Story = {
  args: {children: <Button aria-describedby="own-help">Save</Button>},
  decorators: [Story => <div><span id="own-help" hidden>Own help</span><Story /></div>],
  play: async ({canvasElement}) => {
    await expect(trigger(canvasElement)).toHaveAccessibleDescription("Own help Save your changes");
  },
};

export const LongText: Story = {
  args: {content: "A longer explanation that should wrap onto several lines instead of stretching the tooltip across the whole screen, together with_a_very_long_unbroken_token_that_must_not_overflow.", delay: 0},
  play: async ({canvasElement}) => {
    await userEvent.hover(trigger(canvasElement));
    await isShown(canvasElement);
    const rect = tip(canvasElement).getBoundingClientRect();
    await expect(rect.width).toBeLessThanOrEqual(260);
    await expect(rect.left).toBeGreaterThanOrEqual(0);
    await expect(rect.right).toBeLessThanOrEqual(window.innerWidth);
    await expect(tip(canvasElement).scrollWidth).toBeLessThanOrEqual(tip(canvasElement).clientWidth);
  },
};

export const FlipsWhenNoRoomAbove: Story = {
  // Taller than the 100px above the trigger, so the preferred top side cannot hold it.
  args: {delay: 0, placement: "top", content: "A tooltip with so much text that it needs more room than there is above its trigger. ".repeat(16)},
  play: async ({canvasElement}) => {
    await userEvent.hover(trigger(canvasElement));
    await isShown(canvasElement);
    await waitFor(() => expect(tip(canvasElement)).toHaveAttribute("data-side", "bottom"));
    await expect(tip(canvasElement).getBoundingClientRect().top).toBeGreaterThanOrEqual(trigger(canvasElement).getBoundingClientRect().bottom);
  },
};

export const OtherSides: Story = {
  args: {delay: 0, placement: "right"},
  play: async ({canvasElement}) => {
    await userEvent.hover(trigger(canvasElement));
    await isShown(canvasElement);
    await waitFor(() => expect(tip(canvasElement).getBoundingClientRect().left).toBeGreaterThanOrEqual(trigger(canvasElement).getBoundingClientRect().right));
  },
};

export const InsideDialogAndOverPopover: Story = {
  render: args => (
    <Dialog title="Settings" trigger={<Button>Open dialog</Button>}>
      <Popover trigger={<Button variant="outline">More</Button>}>
        <Tooltip {...args}><Button size="sm">Save</Button></Tooltip>
      </Popover>
    </Dialog>
  ),
  play: async ({canvasElement}) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole("button", {name: "Open dialog"}));
    await userEvent.click(canvas.getByRole("button", {name: "More"}));
    await userEvent.hover(await canvas.findByRole("button", {name: "Save"}));
    await isShown(canvasElement);
    // One Escape closes only the topmost layer: the tooltip, then the popover, then the dialog.
    await userEvent.keyboard("{Escape}");
    await isHidden(canvasElement);
    await expect(canvas.getByRole("button", {name: "Save"})).toBeVisible();
    await userEvent.keyboard("{Escape}");
    await waitFor(() => expect(canvas.queryByRole("button", {name: "Save"})).toBeNull());
    await expect(canvasElement.querySelector("dialog")!.open).toBe(true);
  },
};

export const NonInteractiveTextNotFocusable: Story = {
  args: {children: <Text>Plain text</Text>},
  play: async ({canvasElement}) => {
    // No tab stop is added to arbitrary text just to show a tooltip.
    await userEvent.tab();
    await expect(canvasElement.contains(document.activeElement) && document.activeElement !== document.body).toBe(false);
  },
};

export const Dark: Story = {globals: {theme: "dark"}, args: {delay: 0}, play: async ({canvasElement}) => { await userEvent.hover(trigger(canvasElement)); await isShown(canvasElement); }};

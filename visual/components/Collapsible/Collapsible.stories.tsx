import {useState} from "react";
import type {Meta, StoryObj} from "@storybook/react-vite";
import {expect, fn, userEvent, within} from "storybook/test";
import {Collapsible} from "./Collapsible";
import {Text} from "../Text/Text";
import {Input} from "../Input/Input";
import {Button} from "../Button/Button";

const meta = {
  title: "Components/Collapsible",
  component: Collapsible,
  decorators: [Story => <div style={{width: 400}}><Story /></div>],
  args: {title: "Show details", children: <Text>The hidden details.</Text>, onOpenChange: fn()},
  argTypes: {
    variant: {control: "inline-radio", options: ["plain", "bordered"]},
    open: {control: "boolean"},
    defaultOpen: {control: "boolean"},
    disabled: {control: "boolean"},
    title: {control: "text"},
    children: {control: false},
    onOpenChange: {control: false},
    ref: {control: false},
    className: {control: false},
  },
} satisfies Meta<typeof Collapsible>;

export default meta;
type Story = StoryObj<typeof meta>;

const trigger = (canvasElement: HTMLElement) => within(canvasElement).getByRole("button", {name: "Show details"});

export const InitiallyClosed: Story = {
  play: async ({canvasElement}) => {
    const canvas = within(canvasElement);
    await expect(trigger(canvasElement)).toHaveAttribute("aria-expanded", "false");
    await expect(canvas.queryByRole("region")).toBeNull();
    await expect(canvas.getByText("The hidden details.")).not.toBeVisible();
  },
};

export const InitiallyOpen: Story = {
  args: {defaultOpen: true},
  play: async ({canvasElement}) => {
    const canvas = within(canvasElement);
    await expect(trigger(canvasElement)).toHaveAttribute("aria-expanded", "true");
    await expect(canvas.getByRole("region", {name: "Show details"})).toBeVisible();
    await expect(canvas.getByText("The hidden details.")).toBeVisible();
  },
};

export const Bordered: Story = {args: {variant: "bordered", defaultOpen: true}};

export const Toggling: Story = {
  play: async ({canvasElement, args}) => {
    const canvas = within(canvasElement);
    await userEvent.click(trigger(canvasElement));
    await expect(trigger(canvasElement)).toHaveAttribute("aria-expanded", "true");
    await expect(canvas.getByText("The hidden details.")).toBeVisible();
    await expect(args.onOpenChange).toHaveBeenLastCalledWith(true);
    await userEvent.click(trigger(canvasElement));
    await expect(trigger(canvasElement)).toHaveAttribute("aria-expanded", "false");
    await expect(args.onOpenChange).toHaveBeenLastCalledWith(false);
    await expect(args.onOpenChange).toHaveBeenCalledTimes(2);
  },
};

export const KeyboardActivation: Story = {
  play: async ({canvasElement}) => {
    await userEvent.tab();
    await expect(trigger(canvasElement)).toHaveFocus();
    await userEvent.keyboard("{Enter}");
    await expect(trigger(canvasElement)).toHaveAttribute("aria-expanded", "true");
    await userEvent.keyboard(" ");
    await expect(trigger(canvasElement)).toHaveAttribute("aria-expanded", "false");
  },
};

export const Controlled: Story = {
  render: args => {
    const [open, setOpen] = useState(false);
    return (
      <div style={{display: "grid", gap: 12}}>
        <Collapsible {...args} open={open} onOpenChange={next => { setOpen(next); args.onOpenChange?.(next); }} />
        <Button variant="outline" onClick={() => setOpen(true)}>Open from outside</Button>
      </div>
    );
  },
  play: async ({canvasElement, args}) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole("button", {name: "Open from outside"}));
    await expect(trigger(canvasElement)).toHaveAttribute("aria-expanded", "true");
    await expect(args.onOpenChange).not.toHaveBeenCalled();
    await userEvent.click(trigger(canvasElement));
    await expect(trigger(canvasElement)).toHaveAttribute("aria-expanded", "false");
    await expect(args.onOpenChange).toHaveBeenCalledWith(false);
  },
};

// A controlled value is authoritative: clicking asks for a change but nothing opens until the parent updates `open`.
export const ControlledIgnoresClicks: Story = {
  args: {open: false},
  play: async ({canvasElement, args}) => {
    await userEvent.click(trigger(canvasElement));
    await expect(args.onOpenChange).toHaveBeenCalledWith(true);
    await expect(trigger(canvasElement)).toHaveAttribute("aria-expanded", "false");
  },
};

export const Disabled: Story = {
  args: {disabled: true, variant: "bordered"},
  play: async ({canvasElement, args}) => {
    await expect(trigger(canvasElement)).toBeDisabled();
    await userEvent.click(trigger(canvasElement));
    await expect(trigger(canvasElement)).toHaveAttribute("aria-expanded", "false");
    await userEvent.tab();
    await expect(trigger(canvasElement)).not.toHaveFocus();
    await expect(args.onOpenChange).not.toHaveBeenCalled();
  },
};

export const DisabledOpen: Story = {args: {disabled: true, defaultOpen: true}};

// The trigger controls the region it names, and the collapsed region is out of the accessibility tree and tab order.
export const HiddenContent: Story = {
  args: {children: <Button>Inside</Button>},
  play: async ({canvasElement}) => {
    const canvas = within(canvasElement);
    const panel = canvasElement.querySelector(`#${CSS.escape(trigger(canvasElement).getAttribute("aria-controls")!)}`) as HTMLElement;
    await expect(panel).toHaveAttribute("hidden");
    await expect(canvas.queryByRole("button", {name: "Inside"})).toBeNull();
    await userEvent.tab();
    await userEvent.tab();
    await expect(canvasElement.contains(document.activeElement) && document.activeElement !== trigger(canvasElement)).toBe(false);
    await userEvent.click(trigger(canvasElement));
    await expect(canvas.getByRole("button", {name: "Inside"})).toBeVisible();
  },
};

function Form() {
  const [name, setName] = useState("");
  return <Input label="Name" value={name} onChange={e => setName(e.target.value)} />;
}

export const PreservesState: Story = {
  args: {children: <Form />},
  play: async ({canvasElement}) => {
    const canvas = within(canvasElement);
    await userEvent.click(trigger(canvasElement));
    await userEvent.type(canvas.getByLabelText("Name"), "Ada");
    await userEvent.click(trigger(canvasElement));
    await expect(canvasElement.querySelector("input")).not.toBeVisible();
    await userEvent.click(trigger(canvasElement));
    await expect(canvas.getByLabelText("Name")).toHaveValue("Ada");
  },
};

export const EmptyContent: Story = {
  args: {children: undefined, defaultOpen: true, variant: "bordered"},
  play: async ({canvasElement}) => {
    await expect(trigger(canvasElement)).toHaveAttribute("aria-expanded", "true");
  },
};

export const StableIds: Story = {
  args: {id: "details"},
  play: async ({canvasElement}) => {
    await expect(trigger(canvasElement)).toHaveAttribute("aria-controls", "details-panel");
    await expect(canvasElement.querySelector("#details-panel")).toHaveAttribute("aria-labelledby", "details-trigger");
  },
};

export const LongTitle: Story = {
  args: {title: "A very long title that should wrap onto several lines instead of overflowing its container or hiding the chevron", variant: "bordered"},
};

export const Dark: Story = {globals: {theme: "dark"}, args: {variant: "bordered", defaultOpen: true}};

import {useState} from "react";
import type {Meta, StoryObj} from "@storybook/react-vite";
import {expect, fn, userEvent, within} from "storybook/test";
import {Stepper} from "./Stepper";
import type {StepperItem} from "./Stepper";

const steps: StepperItem[] = [
  {id: "account", label: "Account", description: "Your details"},
  {id: "workspace", label: "Workspace", description: "Name your team"},
  {id: "invite", label: "Invite", description: "Add teammates"},
  {id: "done", label: "Done"},
];

const meta = {
  title: "Components/Stepper",
  component: Stepper,
  decorators: [Story => <div style={{width: 640}}><Story /></div>],
  args: {steps, defaultValue: "workspace", onValueChange: fn()},
  argTypes: {
    steps: {control: "object"},
    value: {control: "text"},
    defaultValue: {control: "text"},
    orientation: {control: "inline-radio", options: ["horizontal", "vertical"]},
    interactive: {control: "boolean"},
    onValueChange: {control: false},
    ref: {control: false},
  },
} satisfies Meta<typeof Stepper>;

export default meta;
type Story = StoryObj<typeof meta>;

const item = (canvas: ReturnType<typeof within>, text: string) => canvas.getAllByRole("listitem").find((li: HTMLElement) => li.textContent?.includes(text))!;

// Ordered semantics, with state as text for assistive technology.
export const Horizontal: Story = {
  play: async ({canvasElement}) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByRole("list", {name: "Progress"}).tagName).toBe("OL");
    await expect(canvas.getAllByRole("listitem")).toHaveLength(4);
    await expect(item(canvas, "Account")).toHaveAttribute("data-status", "complete");
    await expect(item(canvas, "Account")).toHaveTextContent("Completed: Account");
    await expect(item(canvas, "Workspace")).toHaveAttribute("data-status", "current");
    await expect(item(canvas, "Workspace")).toHaveAttribute("aria-current", "step");
    await expect(item(canvas, "Workspace")).toHaveTextContent("Current step: Workspace");
    await expect(item(canvas, "Invite")).toHaveAttribute("data-status", "upcoming");
    await expect(item(canvas, "Invite")).toHaveTextContent("Not started: Invite");
    // Wide enough: the steps sit in a row.
    const [first, second] = canvas.getAllByRole("listitem").map(li => li.getBoundingClientRect());
    await expect(second.left).toBeGreaterThan(first.left);
    await expect(Math.abs(second.top - first.top)).toBeLessThan(2);
    // Exactly one current step.
    await expect(canvasElement.querySelectorAll('[aria-current="step"]')).toHaveLength(1);
  },
};

export const Vertical: Story = {
  args: {orientation: "vertical"},
  play: async ({canvasElement}) => {
    const [first, second] = within(canvasElement).getAllByRole("listitem").map(li => li.getBoundingClientRect());
    await expect(second.top).toBeGreaterThan(first.top);
    await expect(Math.abs(second.left - first.left)).toBeLessThan(2);
  },
};

// Not interactive: no buttons, nothing to focus or press.
export const NonInteractive: Story = {
  play: async ({canvasElement, args}) => {
    const canvas = within(canvasElement);
    await expect(canvas.queryAllByRole("button")).toHaveLength(0);
    await userEvent.click(canvas.getByText("Invite"));
    await expect(args.onValueChange).not.toHaveBeenCalled();
    await expect(item(canvas, "Workspace")).toHaveAttribute("data-status", "current");
  },
};

export const Interactive: Story = {
  args: {interactive: true},
  play: async ({canvasElement, args}) => {
    const canvas = within(canvasElement);
    await expect(canvas.getAllByRole("button")).toHaveLength(4);
    await expect(canvas.getByRole("button", {name: /Workspace/})).toHaveAttribute("aria-current", "step");
    await userEvent.click(canvas.getByRole("button", {name: /Invite/}));
    await expect(args.onValueChange).toHaveBeenLastCalledWith("invite");
    // Uncontrolled: the stepper moves, completion follows the order.
    await expect(item(canvas, "Invite")).toHaveAttribute("data-status", "current");
    await expect(item(canvas, "Workspace")).toHaveAttribute("data-status", "complete");
    await userEvent.click(canvas.getByRole("button", {name: /Account/}));
    await expect(item(canvas, "Workspace")).toHaveAttribute("data-status", "upcoming");
    await expect(canvasElement.querySelectorAll('[aria-current="step"]')).toHaveLength(1);
  },
};

export const KeyboardNavigation: Story = {
  args: {interactive: true},
  play: async ({canvasElement, args}) => {
    const canvas = within(canvasElement);
    await userEvent.tab();
    await expect(canvas.getByRole("button", {name: /Account/})).toHaveFocus();
    await userEvent.tab();
    await userEvent.tab();
    await expect(canvas.getByRole("button", {name: /Invite/})).toHaveFocus();
    await userEvent.keyboard("{Enter}");
    await expect(args.onValueChange).toHaveBeenLastCalledWith("invite");
    await userEvent.tab();
    await userEvent.keyboard(" ");
    await expect(args.onValueChange).toHaveBeenLastCalledWith("done");
    await expect(canvas.getByRole("button", {name: /Done/})).toHaveFocus();
  },
};

function ControlledStepper({onValueChange}: {onValueChange?: (id: string) => void}) {
  const [value, setValue] = useState("account");
  return (
    <div style={{display: "grid", gap: 12}}>
      <Stepper steps={steps} value={value} interactive onValueChange={next => { setValue(next); onValueChange?.(next); }} />
      <span>Current: {value}</span>
      <button type="button" onClick={() => setValue("done")}>Finish</button>
    </div>
  );
}

export const Controlled: Story = {
  render: args => <ControlledStepper onValueChange={args.onValueChange} />,
  play: async ({canvasElement}) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole("button", {name: /Workspace/}));
    await expect(canvas.getByText("Current: workspace")).toBeVisible();
    await userEvent.click(canvas.getByRole("button", {name: "Finish"}));
    await expect(canvas.getByText("Current: done")).toBeVisible();
    await expect(item(canvas, "Invite")).toHaveAttribute("data-status", "complete");
  },
};

// A controlled value is authoritative: when the parent does not move, the stepper does not either.
export const ControlledStaysAuthoritative: Story = {
  args: {value: "account", interactive: true},
  play: async ({canvasElement, args}) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole("button", {name: /Invite/}));
    await expect(args.onValueChange).toHaveBeenCalledWith("invite");
    await expect(item(canvas, "Account")).toHaveAttribute("data-status", "current");
  },
};

export const DisabledStep: Story = {
  args: {interactive: true, steps: steps.map(step => step.id === "invite" ? {...step, disabled: true} : step)},
  play: async ({canvasElement, args}) => {
    const canvas = within(canvasElement);
    const invite = canvas.getByRole("button", {name: /Invite/});
    await expect(invite).toBeDisabled();
    await userEvent.click(invite);
    await expect(args.onValueChange).not.toHaveBeenCalled();
    // Skipped by Tab.
    await userEvent.tab();
    await userEvent.tab();
    await userEvent.tab();
    await expect(canvas.getByRole("button", {name: /Done/})).toHaveFocus();
  },
};

export const FirstStep: Story = {
  args: {defaultValue: undefined},
  play: async ({canvasElement}) => {
    const canvas = within(canvasElement);
    await expect(item(canvas, "Account")).toHaveAttribute("data-status", "current");
    await expect(canvasElement.querySelectorAll('[data-status="complete"]')).toHaveLength(0);
  },
};

export const LastStep: Story = {
  args: {defaultValue: "done"},
  play: async ({canvasElement}) => {
    const canvas = within(canvasElement);
    await expect(item(canvas, "Done")).toHaveAttribute("data-status", "current");
    await expect(canvasElement.querySelectorAll('[data-status="complete"]')).toHaveLength(3);
  },
};

export const UnknownValueShowsFirstStep: Story = {
  args: {value: "nope"},
  play: async ({canvasElement}) => {
    await expect(item(within(canvasElement), "Account")).toHaveAttribute("data-status", "current");
  },
};

const long: StepperItem[] = [
  {id: "a", label: "Confirm the billing address and the tax identification number of the organisation", description: "This is used on every invoice we send to your finance department"},
  {id: "b", label: "Superlongunbrokenlabelwithoutanyspacesthatshouldwrapinsteadofoverflowingthecontainer"},
  {id: "c", label: "Done"},
];

export const LongLabels: Story = {
  decorators: [Story => <div style={{width: 480}}><Story /></div>],
  args: {steps: long, defaultValue: "b", interactive: true},
  play: async ({canvasElement}) => {
    const root = canvasElement.querySelector(".vl-stepper__list")!;
    await expect(root.scrollWidth).toBeLessThanOrEqual(root.clientWidth + 1);
  },
};

// A horizontal stepper stacks in a narrow container instead of squeezing its steps.
export const NarrowLayout: Story = {
  decorators: [Story => <div style={{width: 260}}><Story /></div>],
  play: async ({canvasElement}) => {
    const [first, second] = within(canvasElement).getAllByRole("listitem").map(li => li.getBoundingClientRect());
    await expect(second.top).toBeGreaterThan(first.top);
    const root = canvasElement.querySelector(".vl-stepper__list")!;
    await expect(root.scrollWidth).toBeLessThanOrEqual(root.clientWidth + 1);
  },
};

export const CustomLabel: Story = {
  args: {label: "Checkout progress"},
  play: async ({canvasElement}) => {
    await expect(within(canvasElement).getByRole("list", {name: "Checkout progress"})).toBeVisible();
  },
};

export const Dark: Story = {
  globals: {theme: "dark"},
  args: {interactive: true, defaultValue: "invite"},
};

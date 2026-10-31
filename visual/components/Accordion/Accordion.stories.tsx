import {useState} from "react";
import type {ComponentType} from "react";
import type {Meta, StoryObj} from "@storybook/react-vite";
import {expect, fn, userEvent, within} from "storybook/test";
import {Accordion} from "./Accordion";
import type {AccordionItem, AccordionProps} from "./Accordion";
import {Text} from "../Text/Text";
import {Input} from "../Input/Input";
import {Button} from "../Button/Button";

const items: AccordionItem[] = [
  {id: "shipping", title: "Shipping", content: <Text>Shipping details</Text>},
  {id: "returns", title: "Returns", content: <Text>Returns details</Text>},
  {id: "payment", title: "Payment", content: <Text>Payment details</Text>},
];

const withDisabled: AccordionItem[] = [items[0], {...items[1], disabled: true}, items[2]];

// The props are a union of single and multiple mode, which Storybook's arg types cannot express; stories use this flat shape.
type StoryProps = {items: AccordionItem[]; type?: "single" | "multiple"; value?: string | null | string[]; defaultValue?: string | null | string[]; collapsible?: boolean; headingLevel?: 2 | 3 | 4 | 5 | 6; onValueChange?: (value: never) => void};

const meta = {
  title: "Components/Accordion",
  component: Accordion as ComponentType<StoryProps>,
  decorators: [Story => <div style={{width: 480}}><Story /></div>],
  args: {items, onValueChange: fn()},
  argTypes: {
    type: {control: "inline-radio", options: ["single", "multiple"]},
    collapsible: {control: "boolean"},
    headingLevel: {control: "inline-radio", options: [2, 3, 4, 5, 6]},
    value: {control: "object"},
    defaultValue: {control: "object"},
    items: {control: "object"},
    onValueChange: {control: false},
  },
} satisfies Meta<StoryProps>;

export default meta;
type Story = StoryObj<typeof meta>;

const trigger = (canvas: ReturnType<typeof within>, name: string) => canvas.getByRole("button", {name});

export const Default: Story = {
  play: async ({canvasElement}) => {
    const canvas = within(canvasElement);
    for (const name of ["Shipping", "Returns", "Payment"]) await expect(trigger(canvas, name)).toHaveAttribute("aria-expanded", "false");
    await expect(canvas.getAllByRole("heading", {level: 3})).toHaveLength(3);
    await expect(canvas.queryByRole("region")).toBeNull();
  },
};

export const DefaultOpen: Story = {
  args: {defaultValue: "returns"},
  play: async ({canvasElement}) => {
    const canvas = within(canvasElement);
    await expect(trigger(canvas, "Returns")).toHaveAttribute("aria-expanded", "true");
    await expect(canvas.getByRole("region", {name: "Returns"})).toBeVisible();
  },
};

export const HeadingLevel: Story = {
  args: {headingLevel: 2},
  play: async ({canvasElement}) => {
    await expect(within(canvasElement).getAllByRole("heading", {level: 2})).toHaveLength(3);
  },
};

export const SingleMode: Story = {
  play: async ({canvasElement, args}) => {
    const canvas = within(canvasElement);
    await userEvent.click(trigger(canvas, "Shipping"));
    await expect(trigger(canvas, "Shipping")).toHaveAttribute("aria-expanded", "true");
    await userEvent.click(trigger(canvas, "Returns"));
    await expect(trigger(canvas, "Returns")).toHaveAttribute("aria-expanded", "true");
    await expect(trigger(canvas, "Shipping")).toHaveAttribute("aria-expanded", "false");
    await expect(args.onValueChange).toHaveBeenLastCalledWith("returns");
    // Collapsible by default: clicking the open section closes it.
    await userEvent.click(trigger(canvas, "Returns"));
    await expect(trigger(canvas, "Returns")).toHaveAttribute("aria-expanded", "false");
    await expect(args.onValueChange).toHaveBeenLastCalledWith(null);
  },
};

export const NotCollapsible: Story = {
  args: {collapsible: false, defaultValue: "shipping"},
  play: async ({canvasElement, args}) => {
    const canvas = within(canvasElement);
    await userEvent.click(trigger(canvas, "Shipping"));
    await expect(trigger(canvas, "Shipping")).toHaveAttribute("aria-expanded", "true");
    await expect(args.onValueChange).not.toHaveBeenCalled();
    await userEvent.click(trigger(canvas, "Payment"));
    await expect(trigger(canvas, "Shipping")).toHaveAttribute("aria-expanded", "false");
    await expect(trigger(canvas, "Payment")).toHaveAttribute("aria-expanded", "true");
  },
};

export const MultipleMode: Story = {
  args: {type: "multiple", defaultValue: ["shipping"]},
  play: async ({canvasElement, args}) => {
    const canvas = within(canvasElement);
    await userEvent.click(trigger(canvas, "Payment"));
    await expect(trigger(canvas, "Shipping")).toHaveAttribute("aria-expanded", "true");
    await expect(trigger(canvas, "Payment")).toHaveAttribute("aria-expanded", "true");
    await expect(args.onValueChange).toHaveBeenLastCalledWith(["shipping", "payment"]);
    await userEvent.click(trigger(canvas, "Shipping"));
    await expect(trigger(canvas, "Shipping")).toHaveAttribute("aria-expanded", "false");
    await expect(args.onValueChange).toHaveBeenLastCalledWith(["payment"]);
  },
};

export const ControlledSingle: Story = {
  render: args => {
    const [value, setValue] = useState<string | null>("returns");
    return (
      <div style={{display: "grid", gap: 12}}>
        <Accordion items={args.items} value={value} onValueChange={next => { setValue(next); args.onValueChange?.(next as never); }} />
        <Button variant="outline" onClick={() => setValue("payment")}>Open payment</Button>
      </div>
    );
  },
  play: async ({canvasElement, args}) => {
    const canvas = within(canvasElement);
    await expect(trigger(canvas, "Returns")).toHaveAttribute("aria-expanded", "true");
    await userEvent.click(canvas.getByRole("button", {name: "Open payment"}));
    await expect(trigger(canvas, "Payment")).toHaveAttribute("aria-expanded", "true");
    await expect(trigger(canvas, "Returns")).toHaveAttribute("aria-expanded", "false");
    await expect(args.onValueChange).not.toHaveBeenCalled();
    await userEvent.click(trigger(canvas, "Shipping"));
    await expect(args.onValueChange).toHaveBeenCalledWith("shipping");
  },
};

export const ControlledMultiple: Story = {
  render: args => {
    const [value, setValue] = useState<string[]>([]);
    return (
      <div style={{display: "grid", gap: 12}}>
        <Accordion type="multiple" items={args.items} value={value} onValueChange={setValue} />
        <Button variant="outline" onClick={() => setValue(args.items.map(item => item.id))}>Expand all</Button>
      </div>
    );
  },
  play: async ({canvasElement}) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole("button", {name: "Expand all"}));
    for (const name of ["Shipping", "Returns", "Payment"]) await expect(trigger(canvas, name)).toHaveAttribute("aria-expanded", "true");
    await userEvent.click(trigger(canvas, "Returns"));
    await expect(trigger(canvas, "Returns")).toHaveAttribute("aria-expanded", "false");
  },
};

// A controlled value is authoritative: clicking asks for a change but nothing opens until the parent updates the value.
export const ControlledIgnoresClicks: Story = {
  args: {value: null},
  play: async ({canvasElement, args}) => {
    const canvas = within(canvasElement);
    await userEvent.click(trigger(canvas, "Shipping"));
    await expect(args.onValueChange).toHaveBeenCalledWith("shipping");
    await expect(trigger(canvas, "Shipping")).toHaveAttribute("aria-expanded", "false");
  },
};

export const DisabledSection: Story = {
  args: {items: withDisabled},
  play: async ({canvasElement}) => {
    const canvas = within(canvasElement);
    await expect(trigger(canvas, "Returns")).toBeDisabled();
    await userEvent.click(trigger(canvas, "Returns"));
    await expect(trigger(canvas, "Returns")).toHaveAttribute("aria-expanded", "false");
    // Arrow keys skip it.
    trigger(canvas, "Shipping").focus();
    await userEvent.keyboard("{ArrowDown}");
    await expect(trigger(canvas, "Payment")).toHaveFocus();
  },
};

export const KeyboardActivation: Story = {
  play: async ({canvasElement}) => {
    const canvas = within(canvasElement);
    await userEvent.tab();
    await expect(trigger(canvas, "Shipping")).toHaveFocus();
    await userEvent.keyboard("{Enter}");
    await expect(trigger(canvas, "Shipping")).toHaveAttribute("aria-expanded", "true");
    await userEvent.keyboard("{ArrowDown}");
    await expect(trigger(canvas, "Returns")).toHaveFocus();
    await userEvent.keyboard(" ");
    await expect(trigger(canvas, "Returns")).toHaveAttribute("aria-expanded", "true");
    await userEvent.keyboard("{End}");
    await expect(trigger(canvas, "Payment")).toHaveFocus();
    await userEvent.keyboard("{ArrowDown}");
    await expect(trigger(canvas, "Shipping")).toHaveFocus();
    await userEvent.keyboard("{ArrowUp}");
    await expect(trigger(canvas, "Payment")).toHaveFocus();
    await userEvent.keyboard("{Home}");
    await expect(trigger(canvas, "Shipping")).toHaveFocus();
  },
};

// Collapsed panels stay in the DOM (so their state survives) but are hidden from users, the tab order and assistive technology.
export const HiddenContent: Story = {
  play: async ({canvasElement}) => {
    const canvas = within(canvasElement);
    const panel = canvasElement.querySelector(`#${CSS.escape(trigger(canvas, "Shipping").getAttribute("aria-controls")!)}`) as HTMLElement;
    await expect(panel).toHaveAttribute("hidden");
    await expect(panel).not.toBeVisible();
    await expect(canvas.queryByText("Shipping details")).not.toBeVisible();
    await userEvent.click(trigger(canvas, "Shipping"));
    await expect(canvas.getByText("Shipping details")).toBeVisible();
  },
};

function Form() {
  const [name, setName] = useState("");
  return <Input label="Name" value={name} onChange={e => setName(e.target.value)} />;
}

export const PreservesState: Story = {
  args: {items: [{id: "form", title: "Form", content: <Form />}, {id: "other", title: "Other", content: <Text>Other</Text>}]},
  play: async ({canvasElement}) => {
    const canvas = within(canvasElement);
    await userEvent.click(trigger(canvas, "Form"));
    await userEvent.type(canvas.getByLabelText("Name"), "Ada");
    await userEvent.click(trigger(canvas, "Other"));
    await expect(canvasElement.querySelector("input")).not.toBeVisible();
    await userEvent.click(trigger(canvas, "Form"));
    await expect(canvas.getByLabelText("Name")).toHaveValue("Ada");
  },
};

// Unknown ids in the value are ignored; no sections renders an empty root.
export const UnknownValue: Story = {
  args: {defaultValue: "nope"},
  play: async ({canvasElement}) => {
    const canvas = within(canvasElement);
    for (const button of canvas.getAllByRole("button")) await expect(button).toHaveAttribute("aria-expanded", "false");
  },
};

export const Empty: Story = {
  args: {items: []},
  play: async ({canvasElement}) => {
    await expect(within(canvasElement).queryByRole("button")).toBeNull();
  },
};

export const ManySections: Story = {
  args: {items: Array.from({length: 8}, (_, i) => ({id: `s${i}`, title: `Section ${i + 1}`, content: <Text>Content {i + 1}</Text>}))},
  play: async ({canvasElement}) => {
    const canvas = within(canvasElement);
    await userEvent.click(trigger(canvas, "Section 1"));
    // Beyond six sections the region landmark is dropped to avoid landmark noise, but the content is still reachable.
    await expect(canvas.queryByRole("region")).toBeNull();
    await expect(canvas.getByText("Content 1")).toBeVisible();
  },
};

export const LongTitle: Story = {
  args: {items: [{id: "long", title: "A very long section title that should wrap onto several lines instead of overflowing its container or hiding the chevron", content: <Text>Content</Text>}, items[0]]},
};

export const Dark: Story = {globals: {theme: "dark"}, args: {defaultValue: "shipping"}};

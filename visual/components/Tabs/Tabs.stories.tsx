import {useState} from "react";
import type {Meta, StoryObj} from "@storybook/react-vite";
import {expect, fn, userEvent, within} from "storybook/test";
import {Tabs} from "./Tabs";
import type {TabItem} from "./Tabs";
import {Text} from "../Text/Text";
import {Input} from "../Input/Input";
import {Button} from "../Button/Button";

const items: TabItem[] = [
  {id: "overview", label: "Overview", content: <Text>Overview panel</Text>},
  {id: "details", label: "Details", content: <Text>Details panel</Text>},
  {id: "history", label: "History", content: <Text>History panel</Text>},
];

const withDisabled: TabItem[] = [items[0], {...items[1], disabled: true}, items[2]];

const meta = {
  title: "Components/Tabs",
  component: Tabs,
  decorators: [Story => <div style={{width: 480}}><Story /></div>],
  args: {items, "aria-label": "Sections", onValueChange: fn()},
  argTypes: {
    variant: {control: "inline-radio", options: ["line", "contained"]},
    orientation: {control: "inline-radio", options: ["horizontal", "vertical"]},
    value: {control: "text"},
    defaultValue: {control: "text"},
    items: {control: "object"},
    onValueChange: {control: false},
    ref: {control: false},
    className: {control: false},
  },
} satisfies Meta<typeof Tabs>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  play: async ({canvasElement}) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByRole("tab", {name: "Overview"})).toHaveAttribute("aria-selected", "true");
    await expect(canvas.getByRole("tabpanel", {name: "Overview"})).toBeVisible();
    await expect(canvas.getByRole("tablist")).toHaveAttribute("aria-label", "Sections");
  },
};

export const Contained: Story = {args: {variant: "contained"}};

export const DefaultValue: Story = {
  args: {defaultValue: "history"},
  play: async ({canvasElement}) => {
    await expect(within(canvasElement).getByRole("tab", {name: "History"})).toHaveAttribute("aria-selected", "true");
  },
};

export const Vertical: Story = {
  args: {orientation: "vertical"},
  play: async ({canvasElement}) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByRole("tablist")).toHaveAttribute("aria-orientation", "vertical");
    canvas.getByRole("tab", {name: "Overview"}).focus();
    // Left/Right do nothing in a vertical list; Up/Down move and select.
    await userEvent.keyboard("{ArrowRight}");
    await expect(canvas.getByRole("tab", {name: "Overview"})).toHaveFocus();
    await userEvent.keyboard("{ArrowDown}");
    await expect(canvas.getByRole("tab", {name: "Details"})).toHaveFocus();
    await expect(canvas.getByRole("tab", {name: "Details"})).toHaveAttribute("aria-selected", "true");
  },
};

export const VerticalContained: Story = {args: {orientation: "vertical", variant: "contained"}};

export const Selecting: Story = {
  play: async ({canvasElement, args}) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole("tab", {name: "Details"}));
    await expect(canvas.getByRole("tab", {name: "Details"})).toHaveAttribute("aria-selected", "true");
    await expect(canvas.getByRole("tabpanel", {name: "Details"})).toBeVisible();
    await expect(args.onValueChange).toHaveBeenCalledTimes(1);
    await expect(args.onValueChange).toHaveBeenCalledWith("details");
  },
};

// Roving tabindex: only the selected tab is in the page's tab order; the panel follows it.
export const KeyboardNavigation: Story = {
  play: async ({canvasElement}) => {
    const canvas = within(canvasElement);
    const tab = (name: string) => canvas.getByRole("tab", {name});
    await userEvent.tab();
    await expect(tab("Overview")).toHaveFocus();
    await expect(tab("Details")).toHaveAttribute("tabindex", "-1");
    await userEvent.keyboard("{ArrowRight}");
    await expect(tab("Details")).toHaveFocus();
    await expect(tab("Details")).toHaveAttribute("aria-selected", "true");
    await userEvent.keyboard("{End}");
    await expect(tab("History")).toHaveFocus();
    await userEvent.keyboard("{ArrowRight}");
    await expect(tab("Overview")).toHaveFocus();
    await userEvent.keyboard("{ArrowLeft}");
    await expect(tab("History")).toHaveFocus();
    await userEvent.keyboard("{Home}");
    await expect(tab("Overview")).toHaveFocus();
    await expect(tab("Overview")).toHaveAttribute("aria-selected", "true");
    await userEvent.tab();
    await expect(canvas.getByRole("tabpanel", {name: "Overview"})).toHaveFocus();
  },
};

export const DisabledTab: Story = {
  args: {items: withDisabled},
  play: async ({canvasElement, args}) => {
    const canvas = within(canvasElement);
    const disabled = canvas.getByRole("tab", {name: "Details"});
    await expect(disabled).toBeDisabled();
    await userEvent.click(disabled);
    await expect(canvas.getByRole("tab", {name: "Overview"})).toHaveAttribute("aria-selected", "true");
    // Arrow keys skip the disabled tab.
    canvas.getByRole("tab", {name: "Overview"}).focus();
    await userEvent.keyboard("{ArrowRight}");
    await expect(canvas.getByRole("tab", {name: "History"})).toHaveFocus();
    await expect(args.onValueChange).toHaveBeenLastCalledWith("history");
  },
};

// A value that is unknown or disabled never selects anything; the first enabled tab shows instead, with no callback.
export const InvalidValue: Story = {
  args: {items: [{...items[0], disabled: true}, items[1], items[2]], value: "nope"},
  play: async ({canvasElement, args}) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByRole("tab", {name: "Details"})).toHaveAttribute("aria-selected", "true");
    await expect(args.onValueChange).not.toHaveBeenCalled();
  },
};

export const DisabledValue: Story = {
  args: {items: withDisabled, value: "details"},
  play: async ({canvasElement}) => {
    await expect(within(canvasElement).getByRole("tab", {name: "Overview"})).toHaveAttribute("aria-selected", "true");
  },
};

export const AllDisabled: Story = {
  args: {items: items.map(item => ({...item, disabled: true}))},
  play: async ({canvasElement}) => {
    const canvas = within(canvasElement);
    for (const tab of canvas.getAllByRole("tab")) await expect(tab).toHaveAttribute("aria-selected", "false");
    await expect(canvas.queryByRole("tabpanel")).toBeNull();
  },
};

export const Empty: Story = {
  args: {items: []},
  play: async ({canvasElement}) => {
    const canvas = within(canvasElement);
    await expect(canvas.queryByRole("tablist")).toBeNull();
    await expect(canvas.queryByRole("tabpanel")).toBeNull();
  },
};

// Inactive panels stay in the DOM but are hidden from users, keyboard and assistive technology.
export const HiddenPanels: Story = {
  play: async ({canvasElement}) => {
    const canvas = within(canvasElement);
    const hidden = canvasElement.querySelector("[role=tabpanel][hidden]") as HTMLElement;
    await expect(hidden).not.toBeNull();
    await expect(hidden).not.toBeVisible();
    await expect(canvas.queryByRole("tabpanel", {name: "Details"})).toBeNull();
    await expect(canvas.getAllByRole("tabpanel")).toHaveLength(1);
    await expect(canvas.getByRole("tab", {name: "Details"})).toHaveAttribute("aria-controls", hidden.id);
  },
};

function Form() {
  const [name, setName] = useState("");
  return <Input label="Name" value={name} onChange={e => setName(e.target.value)} />;
}

// Switching tabs must not remount the hidden panel, or typed text would be lost.
export const PreservesState: Story = {
  args: {items: [{id: "form", label: "Form", content: <Form />}, {id: "other", label: "Other", content: <Text>Other panel</Text>}]},
  play: async ({canvasElement}) => {
    const canvas = within(canvasElement);
    await userEvent.type(canvas.getByLabelText("Name"), "Ada");
    await userEvent.click(canvas.getByRole("tab", {name: "Other"}));
    await expect(canvasElement.querySelector("input")).not.toBeVisible();
    await userEvent.click(canvas.getByRole("tab", {name: "Form"}));
    await expect(canvas.getByLabelText("Name")).toHaveValue("Ada");
  },
};

export const Controlled: Story = {
  render: args => {
    const [value, setValue] = useState("details");
    return (
      <div style={{display: "grid", gap: 12}}>
        <Tabs {...args} value={value} onValueChange={next => { setValue(next); args.onValueChange?.(next); }} />
        <Button variant="outline" onClick={() => setValue("history")}>Show history</Button>
        <Text data-testid="state">Selected: {value}</Text>
      </div>
    );
  },
  play: async ({canvasElement, args}) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByRole("tab", {name: "Details"})).toHaveAttribute("aria-selected", "true");
    // Setting the value from outside changes the selection without calling the callback.
    await userEvent.click(canvas.getByRole("button", {name: "Show history"}));
    await expect(canvas.getByRole("tab", {name: "History"})).toHaveAttribute("aria-selected", "true");
    await expect(args.onValueChange).not.toHaveBeenCalled();
    await userEvent.click(canvas.getByRole("tab", {name: "Overview"}));
    await expect(canvas.getByTestId("state")).toHaveTextContent("Selected: overview");
    await expect(args.onValueChange).toHaveBeenCalledWith("overview");
  },
};

// A controlled value is authoritative: clicking asks for a change but the selection stays until the parent updates it.
export const ControlledIgnoresClicks: Story = {
  args: {value: "overview"},
  play: async ({canvasElement, args}) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole("tab", {name: "Details"}));
    await expect(args.onValueChange).toHaveBeenCalledWith("details");
    await expect(canvas.getByRole("tab", {name: "Overview"})).toHaveAttribute("aria-selected", "true");
  },
};

export const AwkwardIds: Story = {
  args: {items: [{id: "a b", label: "Spaced", content: <Text>One</Text>}, {id: "a_b", label: "Underscore", content: <Text>Two</Text>}]},
  play: async ({canvasElement}) => {
    const canvas = within(canvasElement);
    const controls = canvas.getAllByRole("tab").map(tab => tab.getAttribute("aria-controls"));
    await expect(new Set(controls).size).toBe(2);
    for (const id of controls) await expect(id).not.toMatch(/\s/);
    await userEvent.click(canvas.getByRole("tab", {name: "Underscore"}));
    await expect(canvas.getByRole("tabpanel", {name: "Underscore"})).toBeVisible();
  },
};

export const Dark: Story = {globals: {theme: "dark"}, args: {variant: "contained"}};

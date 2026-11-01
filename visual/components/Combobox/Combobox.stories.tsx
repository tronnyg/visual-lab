import {useState} from "react";
import type {ComponentType} from "react";
import type {Meta, StoryObj} from "@storybook/react-vite";
import {expect, fn, userEvent, waitFor, within} from "storybook/test";
import {Combobox} from "./Combobox";
import type {ComboboxOption, ComboboxProps} from "./Combobox";

const countries: ComboboxOption[] = [
  {value: "ar", label: "Argentina", description: "South America"},
  {value: "ca", label: "Canada", description: "North America"},
  {value: "cl", label: "Chile", description: "South America"},
  {value: "cn", label: "China", description: "Asia"},
  {value: "fr", label: "France", description: "Europe", disabled: true},
  {value: "us", label: "United States", description: "North America"},
];

// ComboboxProps requires a label or an aria-* name through a union that Storybook's arg types cannot express; stories use this flat shape.
type StoryProps = Omit<ComboboxProps, "label" | "aria-label" | "aria-labelledby"> & {label?: string; "aria-label"?: string};

const meta = {
  title: "Components/Combobox",
  component: Combobox as ComponentType<StoryProps>,
  decorators: [Story => <div style={{width: 300, minHeight: 360}}><Story /></div>],
  args: {label: "Country", options: countries, placeholder: "Search countries", onValueChange: fn()},
  argTypes: {
    label: {control: "text"},
    value: {control: "text"},
    defaultValue: {control: "text"},
    options: {control: "object"},
    placeholder: {control: "text"},
    searchPlaceholder: {control: "text"},
    emptyMessage: {control: "text"},
    disabled: {control: "boolean"},
    required: {control: "boolean"},
    onValueChange: {control: false},
    ref: {control: false},
    className: {control: false},
    style: {control: false},
  },
} satisfies Meta<StoryProps>;

export default meta;
type Story = StoryObj<typeof meta>;

type Canvas = ReturnType<typeof within>;
const box = (canvas: Canvas) => canvas.getByRole("combobox", {name: "Country"}) as HTMLInputElement;
const options = (canvas: Canvas) => canvas.queryAllByRole("option").map((option: HTMLElement) => option.querySelector("span > span")?.textContent ?? "");
const listbox = (canvas: Canvas) => canvas.getByRole("listbox", {name: "Country"});

export const Closed: Story = {
  play: async ({canvasElement}) => {
    const canvas = within(canvasElement);
    await expect(box(canvas)).toHaveValue("");
    await expect(box(canvas)).toHaveAttribute("aria-expanded", "false");
    await expect(box(canvas)).toHaveAttribute("aria-autocomplete", "list");
    await expect(canvas.queryByRole("listbox")).toBeNull();
  },
};

export const PointerSelection: Story = {
  play: async ({canvasElement, args}) => {
    const canvas = within(canvasElement);
    await userEvent.click(box(canvas));
    await expect(box(canvas)).toHaveAttribute("aria-expanded", "true");
    await expect(box(canvas)).toHaveAttribute("aria-controls", listbox(canvas).id);
    await expect(options(canvas)).toHaveLength(6);
    await userEvent.click(canvas.getByRole("option", {name: /Chile/}));
    await expect(box(canvas)).toHaveValue("Chile");
    await expect(args.onValueChange).toHaveBeenLastCalledWith("cl");
    await waitFor(() => expect(canvas.queryByRole("listbox")).toBeNull());
    // Focus never left the field.
    await expect(box(canvas)).toHaveFocus();
    // The chosen option is marked when the list opens again.
    await userEvent.click(box(canvas));
    await expect(canvas.getByRole("option", {name: /Chile/})).toHaveAttribute("aria-selected", "true");
  },
};

// Search matches label and value, ignoring case; options keep their order.
export const Search: Story = {
  play: async ({canvasElement}) => {
    const canvas = within(canvasElement);
    await userEvent.type(box(canvas), "ch");
    await expect(options(canvas)).toEqual(["Chile", "China"]);
    await userEvent.clear(box(canvas));
    await userEvent.type(box(canvas), "US");
    // "us" is the value of United States, and the label of no other option contains it.
    await expect(options(canvas)).toEqual(["United States"]);
  },
};

export const NoResults: Story = {
  args: {emptyMessage: "No country found"},
  play: async ({canvasElement, args}) => {
    const canvas = within(canvasElement);
    await userEvent.type(box(canvas), "zzz");
    await expect(canvas.queryAllByRole("option")).toHaveLength(0);
    await expect(canvasElement.querySelector(".vl-combobox__empty")).toBeVisible();
    await expect(canvas.getByRole("status")).toHaveTextContent("No country found");
    // Enter with nothing highlighted chooses nothing.
    await userEvent.keyboard("{Enter}");
    await expect(args.onValueChange).not.toHaveBeenCalled();
    // Leaving restores the field to the (empty) selection.
    await userEvent.keyboard("{Escape}");
    await expect(box(canvas)).toHaveValue("");
  },
};

function ControlledCombobox({onValueChange}: {onValueChange?: (value: string) => void}) {
  const [value, setValue] = useState("ca");
  return (
    <div style={{display: "grid", gap: 8}}>
      <Combobox label="Country" options={countries} value={value} onValueChange={next => { setValue(next); onValueChange?.(next); }} />
      <span>Chosen: {value || "none"}</span>
      <button type="button" onClick={() => setValue("cn")}>Set externally</button>
    </div>
  );
}

export const Controlled: Story = {
  render: args => <ControlledCombobox onValueChange={args.onValueChange} />,
  play: async ({canvasElement}) => {
    const canvas = within(canvasElement);
    await expect(box(canvas)).toHaveValue("Canada");
    await userEvent.click(box(canvas));
    await userEvent.click(canvas.getByRole("option", {name: /Argentina/}));
    await expect(canvas.getByText("Chosen: ar")).toBeVisible();
    await userEvent.click(canvas.getByRole("button", {name: "Set externally"}));
    await expect(box(canvas)).toHaveValue("China");
  },
};

export const ControlledStaysAuthoritative: Story = {
  args: {value: "ca"},
  play: async ({canvasElement, args}) => {
    const canvas = within(canvasElement);
    await userEvent.click(box(canvas));
    await userEvent.click(canvas.getByRole("option", {name: /Chile/}));
    await expect(args.onValueChange).toHaveBeenCalledWith("cl");
    await expect(box(canvas)).toHaveValue("Canada");
  },
};

export const Uncontrolled: Story = {
  args: {defaultValue: "us"},
  play: async ({canvasElement, args}) => {
    const canvas = within(canvasElement);
    await expect(box(canvas)).toHaveValue("United States");
    await expect(args.onValueChange).not.toHaveBeenCalled();
  },
};

export const KeyboardSelection: Story = {
  play: async ({canvasElement, args}) => {
    const canvas = within(canvasElement);
    box(canvas).focus();
    await userEvent.keyboard("{ArrowDown}");
    await expect(box(canvas)).toHaveAttribute("aria-expanded", "true");
    // The highlight is aria-activedescendant; DOM focus stays on the field.
    const active = () => canvasElement.querySelector(`#${CSS.escape(box(canvas).getAttribute("aria-activedescendant") ?? "none")}`);
    await expect(active()).toHaveTextContent("Argentina");
    await userEvent.keyboard("{ArrowDown}");
    await expect(active()).toHaveTextContent("Canada");
    await expect(box(canvas)).toHaveFocus();
    await userEvent.keyboard("{ArrowDown}{ArrowDown}");
    await expect(active()).toHaveTextContent("China");
    // France is disabled and is skipped.
    await userEvent.keyboard("{ArrowDown}");
    await expect(active()).toHaveTextContent("United States");
    // Wraps around at both ends.
    await userEvent.keyboard("{ArrowDown}");
    await expect(active()).toHaveTextContent("Argentina");
    await userEvent.keyboard("{ArrowUp}");
    await expect(active()).toHaveTextContent("United States");
    await userEvent.keyboard("{ArrowUp}{Enter}");
    await expect(box(canvas)).toHaveValue("China");
    await expect(args.onValueChange).toHaveBeenLastCalledWith("cn");
    await expect(box(canvas)).toHaveAttribute("aria-expanded", "false");
  },
};

export const TypeThenEnter: Story = {
  play: async ({canvasElement, args}) => {
    const canvas = within(canvasElement);
    await userEvent.type(box(canvas), "unit{Enter}");
    await expect(box(canvas)).toHaveValue("United States");
    await expect(args.onValueChange).toHaveBeenCalledWith("us");
  },
};

export const EscapeRestoresSelection: Story = {
  args: {defaultValue: "ca"},
  play: async ({canvasElement, args}) => {
    const canvas = within(canvasElement);
    await userEvent.click(box(canvas));
    await userEvent.type(box(canvas), "{Control>}a{/Control}chil");
    await expect(options(canvas)).toHaveLength(1);
    await userEvent.keyboard("{Escape}");
    await waitFor(() => expect(canvas.queryByRole("listbox")).toBeNull());
    await expect(box(canvas)).toHaveValue("Canada");
    await expect(box(canvas)).toHaveFocus();
    await expect(args.onValueChange).not.toHaveBeenCalled();
  },
};

export const TabClosesWithoutChoosing: Story = {
  render: args => <div><Combobox {...(args as ComboboxProps)} /><button type="button">Next</button></div>,
  play: async ({canvasElement, args}) => {
    const canvas = within(canvasElement);
    await userEvent.type(box(canvas), "chi");
    await userEvent.tab();
    await waitFor(() => expect(canvas.queryByRole("listbox")).toBeNull());
    await expect(canvas.getByRole("button", {name: "Next"})).toHaveFocus();
    await expect(box(canvas)).toHaveValue("");
    await expect(args.onValueChange).not.toHaveBeenCalled();
  },
};

export const OutsidePressCloses: Story = {
  render: args => <div><Combobox {...(args as ComboboxProps)} /><button type="button">Elsewhere</button></div>,
  play: async ({canvasElement}) => {
    const canvas = within(canvasElement);
    await userEvent.click(box(canvas));
    await userEvent.click(canvas.getByRole("button", {name: "Elsewhere"}));
    await waitFor(() => expect(canvas.queryByRole("listbox")).toBeNull());
  },
};

export const DisabledOption: Story = {
  play: async ({canvasElement, args}) => {
    const canvas = within(canvasElement);
    await userEvent.click(box(canvas));
    const france = canvas.getByRole("option", {name: /France/});
    await expect(france).toHaveAttribute("aria-disabled", "true");
    await userEvent.click(france);
    await expect(args.onValueChange).not.toHaveBeenCalled();
    await expect(canvas.getByRole("listbox")).toBeVisible();
  },
};

export const Disabled: Story = {
  args: {defaultValue: "ca", disabled: true},
  play: async ({canvasElement}) => {
    const canvas = within(canvasElement);
    await expect(box(canvas)).toBeDisabled();
    await userEvent.click(box(canvas));
    await expect(canvas.queryByRole("listbox")).toBeNull();
    await expect(canvas.queryByRole("button", {name: "Clear selection"})).toBeNull();
  },
};

export const ClearSelection: Story = {
  args: {defaultValue: "ca"},
  play: async ({canvasElement, args}) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole("button", {name: "Clear selection"}));
    await expect(box(canvas)).toHaveValue("");
    await expect(args.onValueChange).toHaveBeenLastCalledWith("");
    await expect(box(canvas)).toHaveFocus();
    await expect(canvas.queryByRole("button", {name: "Clear selection"})).toBeNull();
  },
};

const many: ComboboxOption[] = Array.from({length: 120}, (_, i) => ({value: `item-${i + 1}`, label: `Option ${i + 1}`}));

// A long list scrolls inside its panel and the highlighted option is kept in view.
export const LongListScrolls: Story = {
  args: {options: many},
  play: async ({canvasElement}) => {
    const canvas = within(canvasElement);
    box(canvas).focus();
    await userEvent.keyboard("{ArrowUp}");
    // Opening with Arrow Up and nothing chosen highlights the last option.
    const last = canvas.getByRole("option", {name: "Option 120"}) as HTMLElement;
    await expect(box(canvas)).toHaveAttribute("aria-activedescendant", last.id);
    const panel = canvasElement.querySelector(".vl-combobox__list") as HTMLElement;
    await expect(panel.scrollHeight).toBeGreaterThan(panel.clientHeight);
    await waitFor(() => {
      const o = last.getBoundingClientRect(), p = panel.getBoundingClientRect();
      expect(o.top).toBeGreaterThanOrEqual(p.top - 1);
      expect(o.bottom).toBeLessThanOrEqual(p.bottom + 1);
    });
    await userEvent.keyboard("{ArrowDown}");
    await expect(box(canvas)).toHaveAttribute("aria-activedescendant", canvas.getByRole("option", {name: "Option 1"}).id);
    // Back at the top, apart from the panel's own padding.
    await waitFor(() => expect(panel.scrollTop).toBeLessThanOrEqual(8));
  },
};

export const WithoutVisibleLabel: Story = {
  args: {label: undefined, "aria-label": "Nation"},
  play: async ({canvasElement}) => {
    await expect(within(canvasElement).getByRole("combobox", {name: "Nation"})).toBeVisible();
  },
};

function FormHarness({comboProps}: {comboProps: StoryProps}) {
  const [result, setResult] = useState("");
  return (
    <form
      aria-label="Profile"
      onSubmit={event => {
        event.preventDefault();
        setResult(JSON.stringify(Array.from(new FormData(event.currentTarget).entries())));
      }}
    >
      <Combobox {...(comboProps as ComboboxProps)} />
      <button type="submit">Save</button>
      <button type="reset">Reset</button>
      <output>{result}</output>
    </form>
  );
}

// A hidden input named `name` submits the chosen value; the visible label text is not submitted.
export const FormData_: Story = {
  name: "FormData",
  render: args => <FormHarness comboProps={{...args, name: "country", defaultValue: "ca"}} />,
  play: async ({canvasElement}) => {
    const canvas = within(canvasElement);
    const result = () => canvasElement.querySelector("output")!;
    await userEvent.click(canvas.getByRole("button", {name: "Save"}));
    await expect(result()).toHaveTextContent('[["country","ca"]]');
    await userEvent.click(box(canvas));
    await userEvent.click(canvas.getByRole("option", {name: /China/}));
    await userEvent.click(canvas.getByRole("button", {name: "Save"}));
    await expect(result()).toHaveTextContent('[["country","cn"]]');
    await userEvent.click(canvas.getByRole("button", {name: "Reset"}));
    await waitFor(() => expect(box(canvas)).toHaveValue("Canada"));
    await userEvent.click(canvas.getByRole("button", {name: "Save"}));
    await expect(result()).toHaveTextContent('[["country","ca"]]');
  },
};

export const FormDataEmptyAndUnknownValue: Story = {
  render: args => <FormHarness comboProps={{...args, name: "country", value: "not-an-option"}} />,
  play: async ({canvasElement}) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole("button", {name: "Save"}));
    // A value that matches no option is shown as empty and is not submitted as if it were chosen.
    await expect(box(canvas)).toHaveValue("");
    await expect(canvasElement.querySelector("output")).toHaveTextContent('[["country",""]]');
  },
};

export const RequiredBlocksSubmit: Story = {
  render: args => <FormHarness comboProps={{...args, name: "country", required: true}} />,
  play: async ({canvasElement}) => {
    const canvas = within(canvasElement);
    const form = canvasElement.querySelector("form") as HTMLFormElement;
    await expect(box(canvas)).toBeRequired();
    await expect(form.checkValidity()).toBe(false);
    await userEvent.click(box(canvas));
    await userEvent.click(canvas.getByRole("option", {name: /Canada/}));
    await expect(form.checkValidity()).toBe(true);
    // A required selection cannot be cleared.
    await expect(canvas.queryByRole("button", {name: "Clear selection"})).toBeNull();
  },
};

export const NarrowLayout: Story = {
  args: {defaultValue: "us"},
  decorators: [Story => <div style={{width: 180, minHeight: 360}}><Story /></div>],
  play: async ({canvasElement}) => {
    const canvas = within(canvasElement);
    await userEvent.click(box(canvas));
    const panel = canvasElement.querySelector(".vl-combobox__panel") as HTMLElement;
    await expect(panel.getBoundingClientRect().width).toBeLessThanOrEqual(window.innerWidth);
    await expect(panel.getBoundingClientRect().left).toBeGreaterThanOrEqual(0);
    await expect(canvasElement.querySelector(".vl-combobox")!.getBoundingClientRect().width).toBeLessThanOrEqual(180);
  },
};

export const Dark: Story = {
  globals: {theme: "dark"},
  args: {defaultValue: "ca"},
  play: async ({canvasElement}) => {
    await userEvent.click(box(within(canvasElement)));
  },
};

import {useState} from "react";
import type {Meta, StoryObj} from "@storybook/react-vite";
import {expect, fn, userEvent, waitFor, within} from "storybook/test";
import {CommandPalette} from "./CommandPalette";
import type {CommandItem} from "./CommandPalette";
import {filterCommands, flattenGroups, groupCommands} from "./commandPaletteModel";
import {Button} from "../Button/Button";
import {Input} from "../Input/Input";
import {Text} from "../Text/Text";

const commands: CommandItem[] = [
  {id: "new", label: "Create new file", description: "Start an empty document", group: "File", keywords: ["add", "blank"]},
  {id: "open", label: "Open recent", group: "File"},
  {id: "share", label: "Share", description: "Not available on this plan", group: "File", disabled: true},
  {id: "settings", label: "Open settings", group: "Go to", keywords: ["preferences"]},
  {id: "help", label: "Help and support", group: "Go to"},
];

const meta = {
  title: "Components/CommandPalette",
  component: CommandPalette,
  parameters: {layout: "fullscreen"},
  args: {commands, defaultOpen: true, onOpenChange: fn(), onSelect: fn()},
  argTypes: {
    open: {control: "boolean"},
    defaultOpen: {control: "boolean"},
    shortcut: {control: "boolean"},
    placeholder: {control: "text"},
    emptyMessage: {control: "text"},
    label: {control: "text"},
    commands: {control: "object"},
    onOpenChange: {control: false},
    onSelect: {control: false},
    ref: {control: false},
    className: {control: false},
  },
} satisfies Meta<typeof CommandPalette>;

export default meta;
type Story = StoryObj<typeof meta>;

const dialog = (canvasElement: HTMLElement) => canvasElement.querySelector("dialog") as HTMLDialogElement;
const search = (canvasElement: HTMLElement) => within(canvasElement).getByRole("combobox", {name: "Search commands"});
const option = (canvasElement: HTMLElement, name: string | RegExp) => within(canvasElement).getByRole("option", {name});
const highlighted = (canvasElement: HTMLElement) => within(canvasElement).getByRole("option", {selected: true});

export const Open: Story = {
  play: async ({canvasElement}) => {
    const canvas = within(canvasElement);
    await expect(dialog(canvasElement).open).toBe(true);
    // A native modal dialog: the page behind it is inert and the search field has focus.
    await expect(dialog(canvasElement).matches(":modal")).toBe(true);
    await expect(canvas.getByRole("dialog", {name: "Command palette"})).toBeVisible();
    await expect(search(canvasElement)).toHaveFocus();
    await expect(canvas.getAllByRole("option")).toHaveLength(5);
    await expect(canvas.getByRole("listbox", {name: "Commands"})).toBeVisible();
    await expect(search(canvasElement)).toHaveAttribute("aria-expanded", "true");
    await expect(canvas.getByRole("status")).toHaveTextContent("5 results");
  },
};

export const Closed: Story = {
  args: {defaultOpen: false},
  play: async ({canvasElement}) => {
    await expect(dialog(canvasElement).open).toBe(false);
    await expect(within(canvasElement).queryByRole("dialog")).toBeNull();
    await expect(canvasElement.querySelector("input")).toBeNull();
  },
};

export const GroupedResults: Story = {
  play: async ({canvasElement}) => {
    const canvas = within(canvasElement);
    const groups = canvas.getAllByRole("group");
    await expect(groups).toHaveLength(2);
    await expect(groups[0]).toHaveAccessibleName("File");
    await expect(groups[1]).toHaveAccessibleName("Go to");
    await expect(within(groups[0]).getAllByRole("option")).toHaveLength(3);
  },
};

export const SearchFiltering: Story = {
  play: async ({canvasElement}) => {
    const canvas = within(canvasElement);
    await userEvent.type(search(canvasElement), "OPEN");
    // Case-insensitive; matches labels.
    await expect(canvas.getAllByRole("option")).toHaveLength(2);
    await expect(option(canvasElement, /Open recent/)).toBeVisible();
    await expect(option(canvasElement, /Open settings/)).toBeVisible();
    await expect(canvas.getByRole("status")).toHaveTextContent("2 results");
    await userEvent.clear(search(canvasElement));
    await expect(canvas.getAllByRole("option")).toHaveLength(5);
  },
};

export const KeywordAndDescriptionMatching: Story = {
  play: async ({canvasElement}) => {
    const canvas = within(canvasElement);
    await userEvent.type(search(canvasElement), "blank");
    await expect(canvas.getAllByRole("option")).toHaveLength(1);
    await expect(option(canvasElement, /Create new file/)).toBeVisible();
    await userEvent.clear(search(canvasElement));
    await userEvent.type(search(canvasElement), "empty document");
    await expect(canvas.getAllByRole("option")).toHaveLength(1);
    await userEvent.clear(search(canvasElement));
    await userEvent.type(search(canvasElement), "prefer");
    await expect(option(canvasElement, /Open settings/)).toBeVisible();
  },
};

export const EmptyResults: Story = {
  args: {emptyMessage: "Nothing matches that."},
  play: async ({canvasElement, args}) => {
    const canvas = within(canvasElement);
    await userEvent.type(search(canvasElement), "zzz");
    await expect(canvas.queryByRole("option")).toBeNull();
    await expect(canvas.queryByRole("listbox")).toBeNull();
    await expect(canvas.getByRole("status")).toHaveTextContent("Nothing matches that.");
    await expect(canvas.getByRole("status")).toBeVisible();
    await expect(search(canvasElement)).toHaveAttribute("aria-expanded", "false");
    // Enter with nothing highlighted chooses nothing.
    await userEvent.keyboard("{Enter}");
    await expect(args.onSelect).not.toHaveBeenCalled();
  },
};

export const KeyboardHighlight: Story = {
  play: async ({canvasElement}) => {
    const canvas = within(canvasElement);
    // The first enabled result starts highlighted, and the highlight is announced through aria-activedescendant.
    await expect(highlighted(canvasElement)).toHaveAccessibleName(/Create new file/);
    await expect(search(canvasElement)).toHaveAttribute("aria-activedescendant", highlighted(canvasElement).id);
    await userEvent.keyboard("{ArrowDown}");
    await expect(highlighted(canvasElement)).toHaveAccessibleName(/Open recent/);
    // "Share" is disabled, so the next enabled command is "Open settings".
    await userEvent.keyboard("{ArrowDown}");
    await expect(highlighted(canvasElement)).toHaveAccessibleName(/Open settings/);
    await userEvent.keyboard("{ArrowDown}{ArrowDown}");
    await expect(highlighted(canvasElement)).toHaveAccessibleName(/Create new file/);
    await userEvent.keyboard("{ArrowUp}");
    await expect(highlighted(canvasElement)).toHaveAccessibleName(/Help and support/);
    await expect(canvas.getAllByRole("option", {selected: true})).toHaveLength(1);
    // Focus never leaves the search field.
    await expect(search(canvasElement)).toHaveFocus();
  },
};

export const SelectWithEnter: Story = {
  play: async ({canvasElement, args}) => {
    await userEvent.keyboard("{ArrowDown}{Enter}");
    await expect(args.onSelect).toHaveBeenCalledTimes(1);
    await expect(args.onSelect).toHaveBeenCalledWith("open");
    await expect(args.onOpenChange).toHaveBeenLastCalledWith(false);
    await waitFor(() => expect(dialog(canvasElement).open).toBe(false));
  },
};

export const SelectWithClick: Story = {
  play: async ({canvasElement, args}) => {
    await userEvent.click(option(canvasElement, /Help and support/));
    await expect(args.onSelect).toHaveBeenCalledWith("help");
    await waitFor(() => expect(dialog(canvasElement).open).toBe(false));
  },
};

export const SearchThenSelect: Story = {
  play: async ({canvasElement, args}) => {
    await userEvent.type(search(canvasElement), "settings{Enter}");
    await expect(args.onSelect).toHaveBeenCalledWith("settings");
  },
};

export const DisabledCommands: Story = {
  play: async ({canvasElement, args}) => {
    const share = option(canvasElement, /Share/);
    await expect(share).toHaveAttribute("aria-disabled", "true");
    await userEvent.click(share);
    await expect(args.onSelect).not.toHaveBeenCalled();
    await expect(dialog(canvasElement).open).toBe(true);
    // Searching down to only a disabled command leaves nothing to choose.
    await userEvent.type(search(canvasElement), "share{Enter}");
    await expect(args.onSelect).not.toHaveBeenCalled();
    await expect(within(canvasElement).queryByRole("option", {selected: true})).toBeNull();
    await expect(search(canvasElement)).not.toHaveAttribute("aria-activedescendant");
  },
};

export const EscapeDismisses: Story = {
  play: async ({canvasElement, args}) => {
    await userEvent.keyboard("{Escape}");
    await expect(args.onOpenChange).toHaveBeenCalledWith(false);
    await waitFor(() => expect(dialog(canvasElement).open).toBe(false));
    await expect(args.onSelect).not.toHaveBeenCalled();
  },
};

export const BackdropClickDismisses: Story = {
  play: async ({canvasElement, args}) => {
    // A click on the dialog element itself (outside its panel) is a click on the backdrop.
    dialog(canvasElement).dispatchEvent(new MouseEvent("click", {bubbles: true}));
    await expect(args.onOpenChange).toHaveBeenCalledWith(false);
    await waitFor(() => expect(dialog(canvasElement).open).toBe(false));
  },
};

export const ClicksInsideDoNotDismiss: Story = {
  play: async ({canvasElement, args}) => {
    await userEvent.click(search(canvasElement));
    await userEvent.click(within(canvasElement).getByRole("listbox"));
    await expect(args.onOpenChange).not.toHaveBeenCalled();
    await expect(dialog(canvasElement).open).toBe(true);
  },
};

function Harness(args: Parameters<typeof CommandPalette>[0]) {
  const [open, setOpen] = useState(false);
  const [chosen, setChosen] = useState("none");
  return (
    <div style={{padding: 24, display: "grid", gap: 12, justifyItems: "start"}}>
      <Button variant="outline" onClick={() => setOpen(true)}>Open palette</Button>
      <Input label="Other field" value="" onChange={() => {}} />
      <Text data-testid="chosen">Chosen: {chosen}</Text>
      <CommandPalette {...args} defaultOpen={undefined} open={open} onOpenChange={next => { setOpen(next); args.onOpenChange?.(next); }} onSelect={id => { setChosen(id); args.onSelect?.(id); }} />
    </div>
  );
}

// The palette is controlled by the parent: an outside button opens it, and Escape or a choice closes it and returns focus to that button.
export const ControlledWithFocusReturn: Story = {
  render: args => <Harness {...args} />,
  play: async ({canvasElement, args}) => {
    const canvas = within(canvasElement);
    const opener = canvas.getByRole("button", {name: "Open palette"});
    await expect(dialog(canvasElement).open).toBe(false);
    opener.focus();
    await userEvent.click(opener);
    await waitFor(() => expect(dialog(canvasElement).open).toBe(true));
    await waitFor(() => expect(search(canvasElement)).toHaveFocus());
    await userEvent.keyboard("{Escape}");
    await waitFor(() => expect(dialog(canvasElement).open).toBe(false));
    await waitFor(() => expect(opener).toHaveFocus());
    // Choosing a command also closes it, reports it, and returns focus.
    await userEvent.click(opener);
    await waitFor(() => expect(dialog(canvasElement).open).toBe(true));
    await userEvent.type(search(canvasElement), "help{Enter}");
    await expect(canvas.getByTestId("chosen")).toHaveTextContent("Chosen: help");
    await waitFor(() => expect(dialog(canvasElement).open).toBe(false));
    await waitFor(() => expect(opener).toHaveFocus());
    await expect(args.onSelect).toHaveBeenCalledWith("help");
  },
};

// A fresh search each time: the query and highlight do not survive closing.
export const ResetsOnReopen: Story = {
  render: args => <Harness {...args} />,
  play: async ({canvasElement}) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole("button", {name: "Open palette"}));
    await waitFor(() => expect(dialog(canvasElement).open).toBe(true));
    await userEvent.type(search(canvasElement), "settings");
    await userEvent.keyboard("{Escape}");
    await waitFor(() => expect(dialog(canvasElement).open).toBe(false));
    await userEvent.click(canvas.getByRole("button", {name: "Open palette"}));
    await waitFor(() => expect(search(canvasElement)).toHaveValue(""));
    await expect(canvas.getAllByRole("option")).toHaveLength(5);
  },
};

// A controlled palette is authoritative: Escape asks to close but it stays open until the parent says so.
export const ControlledStaysOpen: Story = {
  args: {open: true, defaultOpen: undefined},
  play: async ({canvasElement, args}) => {
    await userEvent.keyboard("{Escape}");
    await expect(args.onOpenChange).toHaveBeenCalledWith(false);
    await expect(dialog(canvasElement).open).toBe(true);
  },
};

export const CustomText: Story = {
  args: {placeholder: "Find an action…", label: "Quick actions"},
  play: async ({canvasElement}) => {
    await expect(search(canvasElement)).toHaveAttribute("placeholder", "Find an action…");
    await expect(within(canvasElement).getByRole("dialog", {name: "Quick actions"})).toBeVisible();
  },
};

export const NoCommands: Story = {
  args: {commands: []},
  play: async ({canvasElement}) => {
    await expect(within(canvasElement).getByRole("status")).toHaveTextContent("No results found.");
    await userEvent.keyboard("{ArrowDown}{Enter}");
    await expect(dialog(canvasElement).open).toBe(true);
  },
};

export const Ungrouped: Story = {
  args: {commands: [{id: "a", label: "Alpha"}, {id: "b", label: "Beta"}, {id: "c", label: "Gamma", group: "Later"}]},
  play: async ({canvasElement}) => {
    const canvas = within(canvasElement);
    await expect(canvas.getAllByRole("option")).toHaveLength(3);
    await expect(canvas.getAllByRole("group")).toHaveLength(2);
    await expect(canvas.getByRole("group", {name: "Later"})).toBeVisible();
  },
};

export const ManyCommands: Story = {
  args: {commands: Array.from({length: 40}, (_, i) => ({id: `c${i}`, label: `Command ${i + 1}`, group: i < 20 ? "First" : "Second"}))},
  play: async ({canvasElement}) => {
    const canvas = within(canvasElement);
    // Moving past the visible rows scrolls the highlighted option into view.
    for (let i = 0; i < 30; i++) await userEvent.keyboard("{ArrowDown}");
    await expect(highlighted(canvasElement)).toHaveAccessibleName("Command 31");
    const results = canvasElement.querySelector(".vl-command-palette__results") as HTMLElement;
    const rect = highlighted(canvasElement).getBoundingClientRect();
    await expect(rect.bottom).toBeLessThanOrEqual(results.getBoundingClientRect().bottom + 1);
    await expect(canvas.getAllByRole("option")).toHaveLength(40);
  },
};

function ShortcutHarness({first = true, second = false}: {first?: boolean; second?: boolean}) {
  const [a, setA] = useState(false);
  const [b, setB] = useState(false);
  return (
    <div style={{padding: 24, display: "grid", gap: 12, justifyItems: "start"}}>
      <Input label="Text field" value="" onChange={() => {}} />
      {first && <CommandPalette commands={commands} open={a} onOpenChange={setA} shortcut label="First palette" />}
      {second && <CommandPalette commands={commands} open={b} onOpenChange={setB} shortcut label="Second palette" />}
    </div>
  );
}

const press = (target: Element | Document, init: KeyboardEventInit = {}) => target.dispatchEvent(new KeyboardEvent("keydown", {key: "k", ctrlKey: true, bubbles: true, cancelable: true, ...init}));

// Opt-in only: without `shortcut`, Ctrl+K does nothing.
export const ShortcutIsOptIn: Story = {
  args: {defaultOpen: false, shortcut: false},
  play: async ({canvasElement}) => {
    press(document.body);
    await new Promise(resolve => setTimeout(resolve, 50));
    await expect(dialog(canvasElement).open).toBe(false);
  },
};

export const KeyboardShortcut: Story = {
  render: () => <ShortcutHarness />,
  play: async ({canvasElement}) => {
    const canvas = within(canvasElement);
    // Typing in a text field must not be hijacked.
    const field = canvas.getByLabelText("Text field");
    field.focus();
    press(field);
    await new Promise(resolve => setTimeout(resolve, 50));
    await expect(dialog(canvasElement).open).toBe(false);
    // Elsewhere on the page it opens, with either Ctrl or Cmd, and swallows the browser's own handling.
    (document.activeElement as HTMLElement).blur();
    const handled = !press(document.body);
    await expect(handled).toBe(true);
    await waitFor(() => expect(dialog(canvasElement).open).toBe(true));
    await waitFor(() => expect(search(canvasElement)).toHaveFocus());
    await userEvent.keyboard("{Escape}");
    await waitFor(() => expect(dialog(canvasElement).open).toBe(false));
    press(document.body, {ctrlKey: false, metaKey: true});
    await waitFor(() => expect(dialog(canvasElement).open).toBe(true));
    await userEvent.keyboard("{Escape}");
    // Other chords are left alone.
    await waitFor(() => expect(dialog(canvasElement).open).toBe(false));
    press(document.body, {shiftKey: true});
    press(document.body, {key: "j"});
    await new Promise(resolve => setTimeout(resolve, 50));
    await expect(dialog(canvasElement).open).toBe(false);
  },
};

// Several palettes with the shortcut: only the first answers, so they never open together.
export const ShortcutWithTwoPalettes: Story = {
  render: () => <ShortcutHarness second />,
  play: async ({canvasElement}) => {
    press(document.body);
    await waitFor(() => expect(canvasElement.querySelectorAll("dialog[open]")).toHaveLength(1));
    await expect(within(canvasElement).getByRole("dialog", {name: "First palette"})).toBeVisible();
  },
};

function RemovableShortcut() {
  const [mounted, setMounted] = useState(true);
  return (
    <div style={{padding: 24}}>
      <Button onClick={() => setMounted(false)}>Remove palette</Button>
      {mounted ? <CommandPalette commands={commands} shortcut label="Removable palette" /> : <Text>Removed</Text>}
    </div>
  );
}

// Removing the palette removes its listener: the shortcut then does nothing, and the next palette takes over.
export const ShortcutListenerCleanup: Story = {
  render: () => <RemovableShortcut />,
  play: async ({canvasElement}) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole("button", {name: "Remove palette"}));
    await expect(canvas.getByText("Removed")).toBeVisible();
    const event = new KeyboardEvent("keydown", {key: "k", ctrlKey: true, bubbles: true, cancelable: true});
    document.body.dispatchEvent(event);
    await expect(event.defaultPrevented).toBe(false);
    await expect(canvasElement.querySelector("dialog")).toBeNull();
  },
};

export const Dark: Story = {globals: {theme: "dark"}};

// The search and grouping are pure functions; these tables pin their behaviour.
export const SearchModel: Story = {
  args: {defaultOpen: false},
  render: () => <Text>Search model checks run in the play function.</Text>,
  play: async () => {
    const ids = (query: string) => filterCommands(commands, query).map(c => c.id);
    await expect(ids("")).toEqual(["new", "open", "share", "settings", "help"]);
    await expect(ids("   ")).toEqual(["new", "open", "share", "settings", "help"]);
    await expect(ids("OPEN")).toEqual(["open", "settings"]);
    await expect(ids("open recent")).toEqual(["open"]);
    await expect(ids("recent open")).toEqual(["open"]);
    await expect(ids("BLANK")).toEqual(["new"]);
    await expect(ids("start empty")).toEqual(["new"]);
    await expect(ids("preferences")).toEqual(["settings"]);
    await expect(ids("open zebra")).toEqual([]);
    await expect(ids("İ")).toEqual([]);
    const groups = groupCommands(filterCommands(commands, "o"));
    await expect(groups.map(g => g.label)).toEqual(["File", "Go to"]);
    await expect(flattenGroups(groups).map(c => c.id)).toEqual(["new", "open", "share", "settings", "help"].filter(id => ids("o").includes(id)));
    // Commands without a group come out as one unlabeled group, in place of first appearance.
    const mixed = groupCommands([{id: "a", label: "A"}, {id: "b", label: "B", group: "G"}, {id: "c", label: "C"}]);
    await expect(mixed.map(g => [g.label, g.commands.map(c => c.id)])).toEqual([["", ["a", "c"]], ["G", ["b"]]]);
  },
};

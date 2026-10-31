// Positional args: DropdownMenu(items, trigger, placement, align). The trigger is a Button that needs no action. Items are
// {id, label, disabled, separatorBefore, group, action, href}: an action (@Set, @Reset, @ToAssistant, @OpenUrl) or an href, one or the other.
export const dropdownMenuExamples = [
  {
    title: "Dropdown menu that changes a variable",
    code: '$view = "list"\nroot = Stack([menu, status], "sm")\nmenu = DropdownMenu([{id: "list", label: "List view", action: @Set($view, "list")}, {id: "grid", label: "Grid view", action: @Set($view, "grid")}, {id: "reset", label: "Reset view", separatorBefore: true, action: @Reset($view)}], trigger, "bottom", "start")\ntrigger = Button("View", false, "outline")\nstatus = Text("Current view: " + $view, "muted")',
  },
  {
    title: "Dropdown menu with groups, a link and a disabled item",
    code: 'root = DropdownMenu([{id: "rename", label: "Rename", group: "Project", action: @ToAssistant("Rename this project")}, {id: "share", label: "Share", group: "Project", disabled: true}, {id: "help", label: "Help center", group: "More", href: "https://example.com/help"}, {id: "mail", label: "Contact support", group: "More", href: "mailto:support@example.com"}], trigger, "bottom", "end")\ntrigger = Button("Actions", false, "outline")',
  },
] as const;

// Positional args: CommandPalette(commands, open, placeholder, emptyMessage, shortcut). Each command is {id, label, description?, group?, keywords?, disabled?, action?, href?}.
// `open` should be a bare boolean $variable that a Button sets with @Set($palette, true).
export const commandPaletteExamples = [
  {
    title: "Command palette opened by a button",
    code: '$palette = false\n$theme = "light"\nroot = Stack([open, status, palette], "sm")\nopen = Button("Open commands", false, "outline", "default", false, false, null, null, @Set($palette, true))\nstatus = Text("Theme: " + $theme, "muted", "caption")\npalette = CommandPalette([{id: "light", label: "Light theme", group: "Appearance", keywords: ["day", "bright"], action: @Set($theme, "light")}, {id: "dark", label: "Dark theme", group: "Appearance", keywords: ["night"], action: @Set($theme, "dark")}, {id: "reset", label: "Reset theme", description: "Back to the default", group: "Appearance", action: @Reset($theme)}], $palette)',
  },
  {
    title: "Command palette with groups, a disabled command and Cmd/Ctrl+K",
    code: '$palette = false\n$note = "Nothing chosen yet"\nroot = Stack([open, status, palette], "sm")\nopen = Button("Search commands", false, "outline", "default", false, false, null, null, @Set($palette, true))\nstatus = Text($note, "muted", "caption")\npalette = CommandPalette([{id: "new", label: "Create new file", description: "Start an empty document", group: "File", keywords: ["add"], action: @Set($note, "Create new file chosen")}, {id: "open", label: "Open recent", group: "File", action: @Set($note, "Open recent chosen")}, {id: "share", label: "Share (unavailable)", group: "File", disabled: true, action: @Set($note, "Share chosen")}, {id: "settings", label: "Open settings", group: "Go to", action: @Set($note, "Open settings chosen")}], $palette, "Type a command…", "No matching commands.", true)',
  },
  {
    title: "Command palette that asks the assistant and opens links",
    code: '$palette = false\nroot = Stack([open, palette], "sm")\nopen = Button("Quick actions", false, "outline", "default", false, false, null, null, @Set($palette, true))\npalette = CommandPalette([{id: "summary", label: "Summarize this board", group: "Assistant", action: @ToAssistant("Summarize this board")}, {id: "ideas", label: "Suggest improvements", group: "Assistant", action: @ToAssistant("Suggest improvements to this board")}, {id: "docs", label: "Open the documentation", description: "Opens in a new tab", group: "Go to", href: "https://example.com/docs"}], $palette)',
  },
] as const;

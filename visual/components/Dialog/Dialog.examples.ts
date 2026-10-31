// Positional args: Dialog(title, content, trigger, open, description, closeOnBackdrop, closeOnEscape, showCloseButton).
// `open` may be a bare boolean $variable that a Button opens with @Set; `trigger` is an optional Button that opens the dialog by itself.
export const dialogExamples = [
  {
    title: "Dialog with a trigger button",
    code: 'root = Dialog("Share project", body, trigger, false, "Anyone with the link can view.")\ntrigger = Button("Share", false, "outline")\nbody = Stack([link, note], "sm")\nlink = Input($link, null, false, "Link")\nnote = Text("Links stay active until you turn sharing off.", "muted", "caption")\n$link = "https://example.com/project"',
  },
  {
    title: "Dialog opened and closed by buttons",
    code: '$open = false\n$saved = false\nroot = Stack([openBtn, status, dialog], "sm")\nopenBtn = Button("Edit profile", false, "primary", "default", false, false, null, null, @Set($open, true))\nstatus = Text($saved ? "Profile saved" : "Profile not saved yet", "muted")\ndialog = Dialog("Edit profile", form, null, $open, "Update how others see you.")\nform = Stack([name, actions], "md")\nname = Input($name, null, false, "Display name")\nactions = Stack([save, cancel], "sm", "horizontal")\nsave = Button("Save", false, "primary", "default", false, false, null, null, Action([@Set($saved, true), @Set($open, false)]))\ncancel = Button("Cancel", false, "outline", "default", false, false, null, null, @Set($open, false))\n$name = ""',
  },
  {
    title: "Confirmation dialog that cannot be dismissed by the backdrop",
    code: 'root = Dialog("Delete project?", body, trigger, false, "This cannot be undone.", false)\ntrigger = Button("Delete project", false, "destructive")\nbody = Text("All boards in this project will be permanently removed. (Illustrative.)")',
  },
] as const;

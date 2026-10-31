// Positional args: Popover(trigger, content, placement, align, open, closeOnOutsideClick, closeOnEscape).
// `open` may be a bare boolean $variable; the trigger is a Button that needs no action.
export const popoverExamples = [
  {
    title: "Popover with a form",
    code: 'root = Popover(trigger, form, "bottom", "start")\ntrigger = Button("Filters", false, "outline")\nform = Stack([status, urgent], "sm")\nstatus = Select($status, ["Open", "Closed"], "Status")\nurgent = Checkbox($urgent, "Only urgent")\n$status = "Open"\n$urgent = false',
  },
  {
    title: "Popover with open state in a variable",
    code: '$open = false\nroot = Stack([popover, state], "sm")\npopover = Popover(trigger, body, "right", "start", $open)\ntrigger = Button("Quick note", false, "outline")\nbody = Stack([note, close], "sm")\nnote = Textarea($note, "Write a note", false, "Note", 3)\nclose = Button("Done", false, "primary", "default", false, false, null, null, @Set($open, false))\nstate = Text($open ? "Popover is open" : "Popover is closed", "muted", "caption")\n$note = ""',
  },
  {
    title: "Popover with details",
    code: 'root = Popover(trigger, details, "top")\ntrigger = Button("What is a seat?", false, "link")\ndetails = KeyValue([{label: "Included", value: "5 seats"}, {label: "Extra seat", value: "$8 per month"}], "stacked")',
  },
] as const;

// Positional args: Checkbox(checked, label, disabled). `checked` must be a bare boolean $variable to be writable.
export const checkboxExamples = [
  {
    title: "Basic checkbox",
    code: 'root = Stack([box, status], "sm")\n$agree = false\nbox = Checkbox($agree, "I agree to the terms")\nstatus = Text($agree ? "Thanks, you agreed." : "Not agreed yet.", "muted")',
  },
  {
    title: "Resetting a checkbox",
    code: 'root = Stack([box, status, clear], "sm")\n$subscribed = true\nbox = Checkbox($subscribed, "Email me updates")\nstatus = Text($subscribed ? "Subscribed" : "Unsubscribed", "default", "heading")\nclear = Button("Reset", false, "outline", "default", false, false, null, null, @Reset($subscribed))',
  },
  {
    title: "Independent checkboxes",
    code: 'root = Stack([a, b, c, summary], "sm")\n$a = true\n$b = false\n$c = false\na = Checkbox($a, "Notes")\nb = Checkbox($b, "Slides")\nc = Checkbox($c, "Recording")\nsummary = Text("Notes: " + $a + ", Slides: " + $b + ", Recording: " + $c, "muted", "caption")',
  },
  {
    title: "Disabled checkbox",
    code: 'root = Stack([locked, note], "sm")\n$required = true\nlocked = Checkbox($required, "Required cookies", true)\nnote = Text("Disabled checkboxes cannot be toggled or focused.", "muted", "caption")',
  },
] as const;

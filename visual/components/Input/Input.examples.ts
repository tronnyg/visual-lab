// Positional args: Input(value, placeholder, disabled, label). `value` must be a bare $variable to be writable.
export const inputExamples = [
  {
    title: "Basic text input",
    code: 'root = Stack([field, echo], "sm")\n$name = ""\nfield = Input($name, "Enter your name", false, "Name")\necho = Text($name, "muted")',
  },
  {
    title: "Live reactive input",
    code: 'root = Stack([field, greeting])\n$name = ""\nfield = Input($name, "Enter your name")\ngreeting = Text("Hello, " + $name)',
  },
  {
    title: "Resetting an input",
    code: 'root = Stack([field, greeting, clear], "sm")\n$name = "Ada"\nfield = Input($name, "Enter your name", false, "Name")\ngreeting = Text("Hello, " + $name, "default", "heading")\nclear = Button("Clear", false, "outline", "default", false, false, null, null, @Reset($name))',
  },
  {
    title: "Two independent inputs",
    code: 'root = Stack([first, last, summary], "sm")\n$first = ""\n$last = ""\nfirst = Input($first, "Ada", false, "First name")\nlast = Input($last, "Lovelace", false, "Last name")\nsummary = Text("Full name: " + $first + " " + $last)',
  },
  {
    title: "Disabled input",
    code: 'root = Stack([field, note], "sm")\n$plan = "Starter"\nfield = Input($plan, null, true, "Plan")\nnote = Text("Disabled inputs cannot be edited or focused.", "muted", "caption")',
  },
] as const;

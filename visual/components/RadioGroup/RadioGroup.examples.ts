// Positional args: RadioGroup(value, options, label, disabled). `value` must be a bare string $variable to be writable.
// Options are strings (label = value) or {label, value} objects.
export const radioGroupExamples = [
  {
    title: "Basic radio group",
    code: 'root = Stack([group, choice], "sm")\n$plan = "Free"\ngroup = RadioGroup($plan, ["Free", "Pro", "Team"], "Plan")\nchoice = Text("Selected plan: " + $plan, "muted")',
  },
  {
    title: "Radio group with separate labels and values",
    code: 'root = Stack([group, choice], "sm")\n$size = "m"\ngroup = RadioGroup($size, [{label: "Small", value: "s"}, {label: "Medium", value: "m"}, {label: "Large", value: "l"}], "T-shirt size")\nchoice = Text("Size code: " + $size, "default", "heading")',
  },
  {
    title: "Resetting a radio group",
    code: 'root = Stack([group, choice, clear], "sm")\n$delivery = "Standard"\ngroup = RadioGroup($delivery, ["Standard", "Express", "Pickup"], "Delivery")\nchoice = Text("Delivery: " + $delivery)\nclear = Button("Reset", false, "outline", "default", false, false, null, null, @Reset($delivery))',
  },
  {
    title: "Two independent radio groups",
    code: 'root = Stack([color, shape, summary], "md")\n$color = "Red"\n$shape = "Circle"\ncolor = RadioGroup($color, ["Red", "Green", "Blue"], "Color")\nshape = RadioGroup($shape, ["Circle", "Square"], "Shape")\nsummary = Text($color + " " + $shape, "muted")',
  },
  {
    title: "Disabled radio group",
    code: 'root = Stack([group, note], "sm")\n$tier = "Pro"\ngroup = RadioGroup($tier, ["Free", "Pro"], "Tier", true)\nnote = Text("Disabled groups cannot be changed or focused.", "muted", "caption")',
  },
] as const;

// Positional args: Select(value, options, label, disabled, placeholder). `value` must be a bare string $variable to be writable.
// Options are strings (label = value) or {label, value} objects.
export const selectExamples = [
  {
    title: "Basic select",
    code: 'root = Stack([field, choice], "sm")\n$country = "Canada"\nfield = Select($country, ["Canada", "France", "Japan", "Kenya", "Peru"], "Country")\nchoice = Text("Selected country: " + $country, "muted")',
  },
  {
    title: "Select with separate labels and values",
    code: 'root = Stack([field, choice], "sm")\n$lang = "ts"\nfield = Select($lang, [{label: "TypeScript", value: "ts"}, {label: "Python", value: "py"}, {label: "Rust", value: "rs"}], "Language")\nchoice = Text("Language code: " + $lang, "default", "heading")',
  },
  {
    title: "Select with a placeholder",
    code: 'root = Stack([field, choice], "sm")\n$fruit = ""\nfield = Select($fruit, ["Apple", "Banana", "Cherry"], "Fruit", false, "Choose a fruit")\nchoice = Text($fruit == "" ? "Nothing chosen yet." : "You chose " + $fruit, "muted")',
  },
  {
    title: "Resetting a select",
    code: 'root = Stack([field, choice, clear], "sm")\n$priority = "Medium"\nfield = Select($priority, ["Low", "Medium", "High", "Urgent"], "Priority")\nchoice = Text("Priority: " + $priority)\nclear = Button("Reset", false, "outline", "default", false, false, null, null, @Reset($priority))',
  },
  {
    title: "Two independent selects",
    code: 'root = Stack([from, to, summary], "sm")\n$from = "Paris"\n$to = "Tokyo"\nfrom = Select($from, ["Paris", "Tokyo", "Lima", "Nairobi", "Toronto"], "From")\nto = Select($to, ["Paris", "Tokyo", "Lima", "Nairobi", "Toronto"], "To")\nsummary = Text($from + " to " + $to, "muted")',
  },
  {
    title: "Disabled select",
    code: 'root = Stack([field, note], "sm")\n$region = "Europe"\nfield = Select($region, ["Africa", "Asia", "Europe"], "Region", true)\nnote = Text("Disabled selects cannot be changed or focused.", "muted", "caption")',
  },
] as const;

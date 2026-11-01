// Positional args: Combobox(value, options, label, disabled, placeholder, required, emptyMessage). `value` must be a bare $variable to be writable.
export const comboboxExamples = [
  {
    title: "Searchable country list",
    code: 'root = Stack([picker, status], "sm")\n$country = ""\npicker = Combobox($country, ["Argentina", "Australia", "Brazil", "Canada", "Chile", "China", "Denmark", "Egypt", "France", "Germany", "India", "Japan", "Kenya", "Mexico", "Norway", "Spain"], "Country", false, "Search countries")\nstatus = Text($country == "" ? "No country chosen." : "You chose " + $country, "muted")',
  },
  {
    title: "Assignee with descriptions and a disabled option",
    code: 'root = Stack([assignee, summary], "sm")\n$owner = "ada"\nassignee = Combobox($owner, [{label: "Ada Lovelace", value: "ada", description: "Engineering"}, {label: "Grace Hopper", value: "grace", description: "Platform"}, {label: "Alan Turing", value: "alan", description: "On leave", disabled: true}, {label: "Katherine Johnson", value: "katherine", description: "Research"}], "Assignee", false, "Find a teammate", false, "Nobody matches that name")\nsummary = Text("Assigned to " + $owner, "muted")',
  },
  {
    title: "Filter bound to other content",
    code: 'root = Stack([status, filter, message], "sm")\n$status = "open"\nstatus = Text("Filtering by status", "muted", "caption")\nfilter = Combobox($status, [{label: "Open", value: "open"}, {label: "In review", value: "review"}, {label: "Closed", value: "closed"}], "Status")\nmessage = Alert($status == "closed" ? "Showing closed items." : "Showing active items.", null, "info")',
  },
] as const;

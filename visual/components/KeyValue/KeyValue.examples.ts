// Positional args: KeyValue(items, layout, dividers, emptyMessage)
export const keyValueExamples = [
  {
    title: "Key-value facts",
    code: 'root = KeyValue([{label: "Status", value: "Active"}, {label: "Owner", value: "Alex"}, {label: "Updated", value: "Today"}], "inline", true)',
  },
  {
    title: "Stacked key-value pairs",
    code: 'root = KeyValue(items, "stacked")\nitems = [{label: "Project", value: "Visual Lab"}, {label: "Open issues", value: 12}, {label: "Release date", value: null}]',
  },
  {
    title: "Key-value in a card",
    code: 'root = Card(null, null, [title, facts])\ntitle = Text("Deployment", "default", "subheading")\nfacts = KeyValue([{label: "Environment", value: "Staging"}, {label: "Version", value: "2.4.0"}, {label: "Replicas", value: 3}], "inline", true)',
  },
  {
    title: "Key-value from variables",
    code: 'root = Stack([facts, pick], "sm")\n$count = 3\nfacts = KeyValue([{label: "Open items", value: $count}, {label: "State", value: $count > 0 ? "Needs attention" : "All clear"}], "inline", true)\npick = Slider($count, "Open items", 0, 10)',
  },
] as const;

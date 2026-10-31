// Positional args: Tabs(items, value, variant, orientation). Each item is {id, label, content, disabled?}; content references one component.
export const tabsExamples = [
  {
    title: "Text tabs",
    code: 'root = Tabs([{id: "overview", label: "Overview", content: overview}, {id: "usage", label: "Usage", content: usage}, {id: "notes", label: "Notes", content: notes}])\noverview = Text("Visual Lab is a library of React components that AI can compose into boards.")\nusage = Text("Describe what you need and the assistant arranges the components for you.")\nnotes = Text("Illustrative content.", "muted")',
  },
  {
    title: "Mixed component tabs",
    code: 'root = Tabs([{id: "chart", label: "Chart", content: chart}, {id: "table", label: "Table", content: table}, {id: "code", label: "Code", content: code}], null, "contained")\nchart = Chart("bar", [{month: "Jan", sales: 120}, {month: "Feb", sales: 160}, {month: "Mar", sales: 140}], "month", [{dataKey: "sales", label: "Sales"}], "Monthly sales (illustrative)")\ntable = Table([{key: "month", header: "Month"}, {key: "sales", header: "Sales", align: "end"}], [{month: "Jan", sales: 120}, {month: "Feb", sales: 160}, {month: "Mar", sales: 140}], "Monthly sales (illustrative)")\ncode = CodeBlock("const total = sales.reduce((a, b) => a + b, 0);", "typescript")',
  },
  {
    title: "Disabled tab and a form that keeps its state",
    code: '$name = ""\nroot = Tabs([{id: "profile", label: "Profile", content: profile}, {id: "billing", label: "Billing", content: billing, disabled: true}, {id: "summary", label: "Summary", content: summary}])\nprofile = Input($name, "Your name", false, "Name")\nbilling = Text("Billing is unavailable on this plan.", "muted")\nsummary = Text("Hello, " + $name)',
  },
  {
    title: "Selected tab in a variable",
    code: '$tab = "second"\nroot = Stack([tabs, status], "sm")\ntabs = Tabs([{id: "first", label: "First", content: a}, {id: "second", label: "Second", content: b}], $tab)\na = Text("The first panel.")\nb = Text("The second panel.")\nstatus = Text("Selected tab: " + $tab, "muted", "caption")',
  },
  {
    title: "Vertical tabs",
    code: 'root = Tabs([{id: "general", label: "General", content: general}, {id: "security", label: "Security", content: security}, {id: "alerts", label: "Alerts", content: alerts}], null, "line", "vertical")\ngeneral = KeyValue([{label: "Workspace", value: "Acme"}, {label: "Region", value: "EU"}])\nsecurity = Alert("Two-factor sign-in is recommended.", "Security", "warning")\nalerts = Checkbox($email, "Email me about incidents")\n$email = true',
  },
] as const;

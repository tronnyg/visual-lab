// Positional args: Collapsible(title, content, open, disabled, variant). `open` may be a bare boolean $variable to be readable elsewhere.
export const collapsibleExamples = [
  {
    title: "Collapsible details",
    code: 'root = Collapsible("Show system requirements", details)\ndetails = List(["64-bit processor", "8 GB of memory", "2 GB of free disk space"])',
  },
  {
    title: "Bordered and initially open",
    code: 'root = Collapsible("Release notes", notes, true, null, "bordered")\nnotes = Text("This release improves startup time and fixes keyboard focus in dialogs. (Illustrative.)")',
  },
  {
    title: "Open state in a variable",
    code: '$open = false\nroot = Stack([toggle, status], "sm")\ntoggle = Collapsible("Advanced options", options, $open, null, "bordered")\noptions = Stack([debug, verbose], "sm")\ndebug = Checkbox($debug, "Debug mode")\nverbose = Checkbox($verbose, "Verbose logging")\n$debug = false\n$verbose = false\nstatus = Text($open ? "Options are shown" : "Options are hidden", "muted", "caption")',
  },
  {
    title: "Disabled collapsible",
    code: 'root = Collapsible("Billing details (unavailable)", body, false, true, "bordered")\nbody = Text("Billing is not available on this plan.")',
  },
  {
    title: "Chart in a collapsible",
    code: 'root = Collapsible("Traffic breakdown", chart, false, null, "bordered")\nchart = ProportionChart("donut", [{category: "Desktop", value: 55}, {category: "Mobile", value: 35}, {category: "Tablet", value: 10}], "category", "value", "Traffic by device (illustrative)")',
  },
] as const;

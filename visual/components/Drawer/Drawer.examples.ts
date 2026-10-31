// Positional args: Drawer(title, content, trigger, open, side, description, closeOnBackdrop, closeOnEscape).
// `open` may be a bare boolean $variable that a Button opens with @Set; `trigger` is an optional Button that opens the drawer by itself.
export const drawerExamples = [
  {
    title: "Drawer with a trigger button",
    code: 'root = Drawer("Order details", details, trigger, false, "right", "Order 1042 (illustrative)")\ntrigger = Button("View order", false, "outline")\ndetails = KeyValue([{label: "Status", value: "Shipped"}, {label: "Items", value: 3}, {label: "Total", value: "$84.00"}], "stacked")',
  },
  {
    title: "Filters drawer on the left, opened by a variable",
    code: '$open = false\nroot = Stack([openBtn, status, drawer], "sm")\nopenBtn = Button("Filters", false, "outline", "default", false, false, null, null, @Set($open, true))\nstatus = Text($urgent ? "Showing urgent items only" : "Showing all items", "muted")\ndrawer = Drawer("Filters", body, null, $open, "left")\nbody = Stack([urgent, apply], "md")\nurgent = Checkbox($urgent, "Only urgent")\napply = Button("Apply", false, "primary", "default", false, false, null, null, @Set($open, false))\n$urgent = false',
  },
  {
    title: "Bottom drawer",
    code: 'root = Drawer("Cookie preferences", body, trigger, false, "bottom")\ntrigger = Button("Cookie settings", false, "outline")\nbody = Text("Choose which cookies you accept. (Illustrative.)")',
  },
] as const;

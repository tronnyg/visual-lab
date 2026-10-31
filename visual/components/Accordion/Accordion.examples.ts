// Positional args: Accordion(items, type, open, collapsible). Each item is {id, title, content, disabled?}; content references one component.
export const accordionExamples = [
  {
    title: "FAQ accordion (single open)",
    code: 'root = Accordion([{id: "ship", title: "How long does shipping take?", content: ship}, {id: "ret", title: "Can I return an item?", content: ret}, {id: "pay", title: "Which payment methods are accepted?", content: pay}], "single", ["ship"])\nship = Text("Orders usually arrive within 3 to 5 business days. (Illustrative.)")\nret = Text("Unused items can be returned within 30 days. (Illustrative.)")\npay = Text("Cards and bank transfers are accepted. (Illustrative.)")',
  },
  {
    title: "Several sections open",
    code: 'root = Accordion([{id: "profile", title: "Profile", content: profile}, {id: "notify", title: "Notifications", content: notify}, {id: "danger", title: "Danger zone", content: danger}], "multiple", ["profile", "notify"])\nprofile = KeyValue([{label: "Name", value: "Alex"}, {label: "Plan", value: "Pro"}])\nnotify = Stack([email, sms], "sm")\nemail = Checkbox($email, "Email updates")\nsms = Checkbox($sms, "Text messages")\n$email = true\n$sms = false\ndanger = Alert("Deleting the workspace cannot be undone.", "Careful", "danger")',
  },
  {
    title: "Disabled section and a section that must stay open",
    code: 'root = Accordion([{id: "basics", title: "Basics", content: basics}, {id: "advanced", title: "Advanced (locked)", content: advanced, disabled: true}], "single", ["basics"], false)\nbasics = Text("One section always stays open when collapsible is false.")\nadvanced = Text("Not available yet.", "muted")',
  },
  {
    title: "Mixed nested content",
    code: 'root = Accordion([{id: "metrics", title: "Metrics", content: metrics}, {id: "log", title: "Recent log", content: log}, {id: "more", title: "More detail", content: more}], "multiple", ["metrics"])\nmetrics = Chart("bar", [{day: "Mon", visits: 40}, {day: "Tue", visits: 55}, {day: "Wed", visits: 48}], "day", [{dataKey: "visits", label: "Visits"}], "Visits per day (illustrative)")\nlog = CodeBlock("12:01 started\\n12:02 finished", "text")\nmore = Tabs([{id: "a", label: "Summary", content: sum}, {id: "b", label: "Notes", content: notes}], null, "contained")\nsum = Text("Traffic is steady.")\nnotes = Text("Illustrative numbers.", "muted")',
  },
] as const;

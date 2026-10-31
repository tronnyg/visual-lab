// Positional args: Alert(message, title, variant)
export const alertExamples = [
  {
    title: "Alert variants",
    code: 'root = Stack([a, b, c, d], "sm")\na = Alert("Boards save automatically as you edit them.", "Heads up")\nb = Alert("Your changes were saved.", "Saved", "success")\nc = Alert("This board uses a component that is still in beta.", "Beta feature", "warning")\nd = Alert("The program could not be rendered. Check the syntax and try again.", "Something went wrong", "danger")',
  },
  {
    title: "Alerts without a title",
    code: 'root = Stack([a, b], "sm")\na = Alert("A short message needs no title.")\nb = Alert("Payment received.", null, "success")',
  },
  {
    title: "Multiline alert",
    code: 'root = Alert("Before you publish:\\n1. Review the draft.\\n2. Check every link.\\n3. Ask a teammate to approve it.", "Publishing checklist", "warning")',
  },
  {
    title: "Alert from a variable",
    code: 'root = Stack([alert, pick], "sm")\n$used = 40\nalert = Alert("You have used " + $used + "% of your storage.", $used > 90 ? "Storage almost full" : "Storage", $used > 90 ? "danger" : $used > 70 ? "warning" : "info")\npick = Slider($used, "Storage used (%)", 0, 100)',
  },
] as const;

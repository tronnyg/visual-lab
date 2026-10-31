// Positional args: Tooltip(text, trigger, placement, delay, disabled). The trigger is one component, normally a Button.
export const tooltipExamples = [
  {
    title: "Tooltip on a button",
    code: 'root = Tooltip("Save your changes", save)\nsave = Button("Save", false, "primary")',
  },
  {
    title: "Tooltips on the side",
    code: 'root = Stack([a, b], "sm", "horizontal")\na = Tooltip("Shown below the button", first, "bottom")\nfirst = Button("Bottom", false, "outline")\nb = Tooltip("Shown after half a second", second, "right", 500)\nsecond = Button("Right, slower", false, "outline")',
  },
  {
    title: "Disabled tooltip",
    code: 'root = Tooltip("You need edit access to export", export, "top", 300, true)\nexport = Button("Export", false, "outline")',
  },
] as const;

// Positional args: Stepper(steps, value, orientation, interactive). `value` is a bare $variable holding a step id (or a string for a fixed step).
export const stepperExamples = [
  {
    title: "Onboarding progress with Back and Next",
    code: 'root = Stack([steps, buttons], "md")\n$step = "account"\nsteps = Stepper([{id: "account", label: "Account", description: "Your details"}, {id: "workspace", label: "Workspace", description: "Name your team"}, {id: "invite", label: "Invite", description: "Add teammates"}, {id: "done", label: "Done"}], $step)\nbuttons = Stack([back, next], "sm", "horizontal")\nback = Button("Back", false, "outline", "default", false, false, null, null, @Set($step, $step == "done" ? "invite" : $step == "invite" ? "workspace" : "account"))\nnext = Button("Next", false, "primary", "default", false, false, null, null, @Set($step, $step == "account" ? "workspace" : $step == "workspace" ? "invite" : "done"))',
  },
  {
    title: "Clickable vertical steps for a multi-step form",
    code: 'root = Stack([steps, status], "md")\n$step = "details"\nsteps = Stepper([{id: "details", label: "Details"}, {id: "shipping", label: "Shipping"}, {id: "payment", label: "Payment", disabled: true}, {id: "review", label: "Review"}], $step, "vertical", true)\nstatus = Text("You are on: " + $step, "muted")',
  },
  {
    title: "Fixed progress indicator",
    code: 'root = Stepper([{id: "cart", label: "Cart"}, {id: "checkout", label: "Checkout"}, {id: "confirm", label: "Confirmation"}], "checkout")',
  },
] as const;

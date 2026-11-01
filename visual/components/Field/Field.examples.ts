// Positional args: Field(label, control, description, error, required, disabled). The control is ONE component defined elsewhere; give it no label of its own.
export const fieldExamples = [
  {
    title: "Labelled input with help text",
    code: 'root = Field("Email", email, "We only use it to send receipts.", null, true)\n$email = ""\nemail = Input($email, "you@example.com")',
  },
  {
    title: "Field with an error that follows the value",
    code: 'root = Stack([field, summary], "sm")\n$email = ""\nfield = Field("Email", email, null, $email == "" ? "Enter your email address" : null, true)\nemail = Input($email, "you@example.com")\nsummary = Text($email == "" ? "Waiting for input." : "Thanks, " + $email, "muted", "caption")',
  },
  {
    title: "Fields for different controls",
    code: 'root = Card("Project settings", null, [nameField, planField, dueField, ownerField, notifyField], "default", "md")\n$name = ""\n$plan = "team"\n$due = ""\n$owner = ""\n$notify = true\nnameField = Field("Project name", name, null, null, true)\nname = Input($name, "Roadmap")\nplanField = Field("Plan", plan, "Billing starts after the trial.")\nplan = Select($plan, [{label: "Free", value: "free"}, {label: "Team", value: "team"}, {label: "Enterprise", value: "enterprise"}])\ndueField = Field("Due date", due)\ndue = DatePicker($due)\nownerField = Field("Owner", owner)\nowner = Combobox($owner, ["Ada Lovelace", "Grace Hopper", "Alan Turing"], null, false, "Search people")\nnotifyField = Field("Notifications", notify)\nnotify = Switch($notify, "Email me about changes")',
  },
  {
    title: "Disabled field",
    code: 'root = Field("Account ID", id, "Assigned automatically.", null, false, true)\n$id = "acct_4821"\nid = Input($id)',
  },
] as const;

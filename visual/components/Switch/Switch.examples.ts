// Positional args: Switch(checked, label, disabled, required). `checked` must be a bare boolean $variable to be writable.
export const switchExamples = [
  {
    title: "Settings switches",
    code: 'root = Card("Notifications", null, [email, push, summary], "default", "md")\n$email = true\n$push = false\nemail = Switch($email, "Email notifications")\npush = Switch($push, "Push notifications")\nsummary = Text($push ? "Push is on." : "Push is off.", "muted", "caption")',
  },
  {
    title: "Switch that enables a control",
    code: 'root = Stack([toggle, note], "sm")\n$weekly = false\ntoggle = Switch($weekly, "Weekly digest")\nnote = Text($weekly ? "You will get one email every Monday." : "No digest emails.", "muted")',
  },
  {
    title: "Disabled switch",
    code: 'root = Stack([locked, note], "sm")\n$sync = true\nlocked = Switch($sync, "Sync across devices", true)\nnote = Text("Disabled switches cannot be toggled or focused.", "muted", "caption")',
  },
] as const;

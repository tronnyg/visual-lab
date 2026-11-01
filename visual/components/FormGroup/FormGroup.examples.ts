// Positional args: FormGroup(legend, children, description, error, required, disabled, orientation). Children are the controls, each with its own label.
export const formGroupExamples = [
  {
    title: "Checkboxes in a group",
    code: 'root = FormGroup("Notify me by", [email, sms, push], "Choose any that apply.")\n$email = true\n$sms = false\n$push = false\nemail = Checkbox($email, "Email")\nsms = Checkbox($sms, "Text message")\npush = Checkbox($push, "Push notification")',
  },
  {
    title: "Group with a computed error",
    code: 'root = FormGroup("Contact methods", [email, phone], null, $email || $phone ? null : "Choose at least one", true)\n$email = false\n$phone = false\nemail = Checkbox($email, "Email")\nphone = Checkbox($phone, "Phone")',
  },
  {
    title: "Radio group and a switch together",
    code: 'root = FormGroup("Billing", [plan, invoice], "Applies from the next cycle.")\n$plan = "monthly"\n$invoice = true\nplan = RadioGroup($plan, ["monthly", "yearly"], "Billing period")\ninvoice = Switch($invoice, "Email me invoices")',
  },
  {
    title: "Horizontal switches",
    code: 'root = FormGroup("Alerts", [mail, chat], null, null, false, false, "horizontal")\n$mail = true\n$chat = false\nmail = Switch($mail, "Mail")\nchat = Switch($chat, "Chat")',
  },
  {
    title: "Disabled group",
    code: 'root = FormGroup("Team settings", [a, b], "Only admins can change these.", null, false, true)\n$a = true\n$b = false\na = Checkbox($a, "Public profile")\nb = Checkbox($b, "Allow guests")',
  },
] as const;

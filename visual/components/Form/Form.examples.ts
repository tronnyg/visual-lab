// Positional args: Form(children, submitLabel, action, disabled, label). The submit button appears only when there is an action.
// A @ToAssistant action reports the current $variable values; nothing is posted, and Reset is a Button with @Reset.
export const formExamples = [
  {
    title: "Contact form with validation",
    code: 'root = Form([nameField, emailField, topicField, messageField, reset], "Send message", @ToAssistant("Submit the contact form"), false, "Contact us")\n$name = ""\n$email = ""\n$topic = "support"\n$message = ""\nnameField = Field("Name", name, null, null, true)\nname = Input($name, "Your name")\nemailField = Field("Email", email, "We reply within two days.", null, true)\nemail = Input($email, "you@example.com")\ntopicField = Field("Topic", topic)\ntopic = Select($topic, [{label: "Support", value: "support"}, {label: "Sales", value: "sales"}, {label: "Other", value: "other"}])\nmessageField = Field("Message", message)\nmessage = Textarea($message, "How can we help?")\nreset = Button("Reset", false, "outline", "default", false, false, null, null, @Reset($name, $email, $topic, $message))',
  },
  {
    title: "Booking form with a grid, date, search and switch",
    code: 'root = Form([layout, terms], "Book", @ToAssistant("Book the appointment"), false, "Book an appointment")\n$guest = ""\n$date = ""\n$room = ""\n$remind = true\nlayout = Grid([guestField, dateField, roomField, remindField], 2)\nguestField = Field("Guest name", guest, null, null, true)\nguest = Input($guest, "Full name")\ndateField = Field("Date", date, "Choose a day in 2026.", null, true)\ndate = DatePicker($date, null, "2026-01-01", "2026-12-31")\nroomField = Field("Room", room)\nroom = Combobox($room, ["Garden room", "Library", "Studio", "Terrace"], null, false, "Search rooms")\nremindField = Field("Reminder", remind)\nremind = Switch($remind, "Email me a reminder")\n$agree = false\nterms = Switch($agree, "I accept the booking terms", false, true)',
  },
  {
    title: "Form that moves a stepper",
    code: 'root = Stack([steps, form], "md")\n$step = "details"\n$company = ""\nsteps = Stepper([{id: "details", label: "Details"}, {id: "review", label: "Review"}], $step)\nform = Form([companyField], "Continue", @Set($step, "review"), false, "Company details")\ncompanyField = Field("Company", company, "Shown on your invoices.", null, true)\ncompany = Input($company, "Acme Inc.")',
  },
  {
    title: "Validation only, no action",
    code: 'root = Form([field], null, null, false, "Newsletter")\n$email = ""\nfield = Field("Email", email, "Required controls are checked when you press Enter.", null, true)\nemail = Input($email, "you@example.com")',
  },
] as const;

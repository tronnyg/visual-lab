// Positional args: DatePicker(value, label, min, max, disabled, required, placeholder). `value` must be a bare $variable holding "YYYY-MM-DD" (or "").
export const datePickerExamples = [
  {
    title: "Appointment date",
    code: 'root = Stack([date, summary], "sm")\n$date = "2026-03-15"\ndate = DatePicker($date, "Appointment date")\nsummary = Text($date == "" ? "No date chosen." : "Booked for " + $date, "muted")',
  },
  {
    title: "Deadline that starts empty",
    code: 'root = Stack([deadline, status, clear], "sm")\n$due = ""\ndeadline = DatePicker($due, "Deadline")\nstatus = Text($due == "" ? "No deadline set." : "Due " + $due, "muted")\nclear = Button("Clear deadline", false, "outline", "default", false, false, null, null, @Reset($due))',
  },
  {
    title: "Date with minimum and maximum",
    code: 'root = Stack([date, note], "sm")\n$checkin = "2026-06-10"\ndate = DatePicker($checkin, "Check-in", "2026-06-01", "2026-08-31")\nnote = Text("Only dates from 2026-06-01 to 2026-08-31 can be chosen.", "muted", "caption")',
  },
] as const;

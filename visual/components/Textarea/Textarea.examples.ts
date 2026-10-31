// Positional args: Textarea(value, placeholder, disabled, label, rows). `value` must be a bare $variable to be writable.
export const textareaExamples = [
  {
    title: "Basic textarea",
    code: 'root = Stack([field, echo], "sm")\n$notes = ""\nfield = Textarea($notes, "Write your notes here", false, "Notes")\necho = Text("You wrote: " + $notes, "muted", "caption")',
  },
  {
    title: "Live preview of multiline text",
    code: 'root = Stack([field, preview], "sm")\n$message = "Dear team,\\n\\nThanks for your help."\nfield = Textarea($message, "Write a message", false, "Message", 5)\npreview = Card("Preview", $message)',
  },
  {
    title: "Resetting a textarea",
    code: 'root = Stack([field, clear], "sm")\n$bio = "Mathematician and writer."\nfield = Textarea($bio, null, false, "Bio", 4)\nclear = Button("Reset", false, "outline", "default", false, false, null, null, @Reset($bio))',
  },
  {
    title: "Two independent textareas",
    code: 'root = Stack([pros, cons, summary], "sm")\n$pros = ""\n$cons = ""\npros = Textarea($pros, "What went well?", false, "Pros", 3)\ncons = Textarea($cons, "What could improve?", false, "Cons", 3)\nsummary = Text("Pros: " + $pros + " | Cons: " + $cons, "muted")',
  },
  {
    title: "Disabled textarea",
    code: 'root = Stack([field, note], "sm")\n$terms = "These terms cannot be edited."\nfield = Textarea($terms, null, true, "Terms", 3)\nnote = Text("Disabled textareas cannot be edited or focused.", "muted", "caption")',
  },
] as const;

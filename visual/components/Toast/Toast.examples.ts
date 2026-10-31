// Positional args: Toast(items, position, label). Items are {id, title, description, variant, duration}; there is no action to remove one,
// so a Button shows a notification by replacing the array held in a variable (with a new id each time).
export const toastExamples = [
  {
    title: "Toast notifications",
    code: 'root = Toast([{id: "saved", title: "Changes saved", description: "Your profile was updated.", variant: "success"}, {id: "sync", title: "Sync paused", description: "Reconnect to continue.", variant: "warning"}], "bottom-right")',
  },
  {
    title: "Toast shown by a button",
    code: '$toasts = []\nroot = Stack([save, toast], "sm")\nsave = Button("Save", false, "primary", "default", false, false, null, null, @Set($toasts, [{id: "saved-1", title: "Changes saved", variant: "success"}]))\ntoast = Toast($toasts, "top-right")',
  },
  {
    title: "Error toast that stays until dismissed",
    code: 'root = Toast([{id: "upload", title: "Upload failed", description: "The file is larger than 10 MB.", variant: "error"}], "top-left")',
  },
] as const;

// Positional args: FileUpload(accept, multiple, maxFiles, maxSize, disabled, required, label). maxSize is in bytes.
// Chosen files stay in the browser: they cannot be bound to a $variable or passed to an action.
export const fileUploadExamples = [
  {
    title: "Single document with a size limit",
    code: 'root = Field("Résumé", upload, "PDF or Word, up to 5 MB.")\nupload = FileUpload(".pdf,.doc,.docx", false, null, 5242880)',
  },
  {
    title: "Several images with limits",
    code: 'root = Field("Photos", upload, null, null, true)\nupload = FileUpload("image/*", true, 4, 2097152, false, false, "Add photos")',
  },
  {
    title: "Disabled file chooser",
    code: 'root = Field("Attachment", upload, "Attachments are locked after submission.", null, false, true)\nupload = FileUpload(null, false, null, null, true)',
  },
] as const;

import {defineComponent} from "@openuidev/react-lang";
import {z} from "zod/v4";
import {FileUpload} from "./FileUpload";

// Positional order matters in OpenUI Lang: accept, multiple, maxFiles, maxSize, disabled, required, label.
// This is a deliberately narrow contract. The files a person chooses are browser-owned File objects: the OpenUI document, its $variables
// and its actions (@Set, @Reset, @ToAssistant, @OpenUrl) cannot carry them, so there is no value to bind, no event to react to and
// no upload. The control only lets the person choose and review files and tells them why a file was rejected.
const fileUploadProps = z.object({
  accept: z.string().optional().describe("Allowed file types as in the HTML accept attribute, comma-separated: \".pdf,.docx\", \"image/*\" or \"image/png\". Other files are rejected with a message"),
  multiple: z.boolean().optional().describe("Allow choosing several files. Default false"),
  maxFiles: z.number().optional().describe("Most files that can be chosen (with multiple)"),
  maxSize: z.number().optional().describe("Largest allowed file in BYTES, e.g. 2097152 for 2 MB"),
  disabled: z.boolean().optional().describe("Prevents choosing files. Default false"),
  required: z.boolean().optional().describe("Inside a Form, the form cannot be submitted until a file is chosen. Default false"),
  label: z.string().optional().describe("Text of the browse button. Default \"Choose file\" or \"Choose files\""),
});

export const fileUploadDefinition = defineComponent({
  name: "FileUpload",
  description: "A file chooser with validation messages: FileUpload(\".pdf,.docx\", false, null, 5242880, false, false, \"Choose résumé\"). The person picks files from their own device, sees their names and sizes, can remove them, and is told when a file has the wrong type, is too big or exceeds the count. Chosen files stay in the browser: they cannot be read by this document, bound to a $variable, shown in other components or sent anywhere, and nothing is uploaded, so never promise that they will be. Use it only where a file chooser is the interface. maxSize is in bytes. Put it in a Field to give it a label.",
  props: fileUploadProps,
  component: ({props}) => (
    <FileUpload
      accept={props.accept?.trim() ? props.accept : undefined}
      multiple={props.multiple === true}
      maxFiles={typeof props.maxFiles === "number" && props.maxFiles > 0 ? Math.floor(props.maxFiles) : undefined}
      maxSize={typeof props.maxSize === "number" && props.maxSize >= 0 ? props.maxSize : undefined}
      disabled={props.disabled === true}
      required={props.required === true}
      label={props.label?.trim() ? props.label : undefined}
    />
  ),
});

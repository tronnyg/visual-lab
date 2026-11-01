import {defineComponent} from "@openuidev/react-lang";
import {z} from "zod/v4";
import {Field} from "./Field";
import {panelContentSchema} from "../../shared/contentRefs";

// Positional order matters in OpenUI Lang: label, control, description, error, required, disabled.
// `control` is a typed reference to one registered component (see shared/contentRefs.ts), deferred by a getter like a panel's content.
// Field wires the label, description and error to the first input, select or textarea inside it in the DOM, so it works for any child
// the SDK renders, but a child that is a group of radios (RadioGroup) is not a single control: use FormGroup for that.
const fieldProps = z.object({
  label: z.string().describe("Visible label. It names the control inside"),
  get control(): z.ZodType {
    return panelContentSchema().describe("ONE component that is the control: Input, Textarea, Select, Combobox, DatePicker, Switch, Checkbox, Slider or FileUpload (or a Stack holding exactly one of them). Do not give it its own label");
  },
  description: z.string().optional().describe("Help text under the control"),
  error: z.string().optional().describe("Error message under the control, e.g. an expression such as $email == \"\" ? \"Enter your email\" : null. Null or empty shows nothing"),
  required: z.boolean().optional().describe("Marks the control required (asterisk and native required). Default false"),
  disabled: z.boolean().optional().describe("Disables the control and dims the label. Default false"),
});

export const fieldDefinition = defineComponent({
  name: "Field",
  description: "One labelled control with optional help text and error message: Field(\"Email\", email, \"We only use it for receipts\", null, true), where email = Input($email, \"you@example.com\"). The label is a real label for the control, and the description and error are announced with it. The control is ONE component defined elsewhere; give the control no label of its own. Use FormGroup instead for a set of related controls (radio buttons, several checkboxes). Field shows the error you give it; it does not validate.",
  props: fieldProps,
  component: ({props, renderNode}) => (
    <Field
      label={props.label}
      description={props.description?.trim() ? props.description : undefined}
      error={props.error?.trim() ? props.error : undefined}
      required={props.required === true}
      disabled={props.disabled === true}
    >
      {renderNode(props.control)}
    </Field>
  ),
});

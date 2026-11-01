import {defineComponent} from "@openuidev/react-lang";
import {z} from "zod/v4";
import {FormGroup, formGroupOrientations} from "./FormGroup";
import {panelContentSchema} from "../../shared/contentRefs";

// Positional order matters in OpenUI Lang: legend, children, description, error, required, disabled, orientation.
// Children are typed references to registered components, like Stack's (see shared/contentRefs.ts), deferred by a getter.
const formGroupProps = z.object({
  legend: z.string().describe("The group's visible name, announced when focus enters the group"),
  get children(): z.ZodArray<z.ZodType> {
    return z.array(panelContentSchema()).describe("The related controls, in order: RadioGroup, Checkbox, Switch, Input, ... Each keeps its own label");
  },
  description: z.string().optional().describe("Help text for the whole group"),
  error: z.string().optional().describe("Error for the whole group, e.g. an expression such as $a || $b ? null : \"Pick at least one\". Null or empty shows nothing"),
  required: z.boolean().optional().describe("Shows the group needs an answer (asterisk, and \"required\" for screen readers). Default false"),
  disabled: z.boolean().optional().describe("Disables every control inside. Default false"),
  orientation: z.enum(formGroupOrientations).optional().describe("vertical (default) or horizontal (a wrapping row)"),
});

export const formGroupDefinition = defineComponent({
  name: "FormGroup",
  description: "Related controls under one name, as a labelled group: FormGroup(\"Notify me by\", [email, sms, push], \"Choose any\"). Screen readers announce the legend when focus enters the group. Children are the controls (Checkbox, Switch, RadioGroup, Input, ...), each with its own label. Use FormGroup for several controls that answer one question, and Field for one control that needs a label above it. It groups and disables; it does not validate or lay out a grid (use Grid for that).",
  props: formGroupProps,
  component: ({props, renderNode}) => (
    <FormGroup
      legend={props.legend}
      description={props.description?.trim() ? props.description : undefined}
      error={props.error?.trim() ? props.error : undefined}
      required={props.required === true}
      disabled={props.disabled === true}
      orientation={props.orientation ?? undefined}
    >
      {renderNode(props.children)}
    </FormGroup>
  ),
});

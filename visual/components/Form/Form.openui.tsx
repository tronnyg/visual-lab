import {action, defineComponent, useFormName, useIsStreaming, useTriggerAction} from "@openuidev/react-lang";
import {z} from "zod/v4";
import {Form} from "./Form";
import {Button} from "../Button/Button";
import {panelContentSchema} from "../../shared/contentRefs";

// Positional order matters in OpenUI Lang: children, submitLabel, action, disabled, label.
// The only actions are the SDK's existing steps (@Set, @Reset, @ToAssistant, @OpenUrl), run through useTriggerAction exactly as Button,
// CommandPalette and DropdownMenu do. There is no submit language, no FormData and no request: when the browser's validation passes, the
// action runs, and a @ToAssistant step reports the current values of the document's $variables (the SDK's `formState`), as a Button would.
// Reset is an ordinary Button with @Reset($a, $b): a native reset cannot restore a $variable.
const formProps = z.object({
  get children(): z.ZodArray<z.ZodType> {
    return z.array(panelContentSchema()).describe("The form's contents in order: Field, FormGroup, Stack, Grid, Card, Input, Select, Switch, DatePicker, Combobox, Button, ...");
  },
  submitLabel: z.string().optional().describe("Text of the submit button. Default \"Submit\". The button is only shown when there is an action"),
  action: action().optional().describe("What happens when the form is submitted and every required or invalid control has been fixed, e.g. @ToAssistant(\"Create the account\") or @Set($step, \"done\"). Without it the form only validates and shows no submit button"),
  disabled: z.boolean().optional().describe("Disables every control inside. Default false"),
  label: z.string().optional().describe("Accessible name of the form, e.g. \"Contact us\""),
});

type ActionPlan = {steps: unknown[]};

export const formDefinition = defineComponent({
  name: "Form",
  description: "A form that checks required and invalid controls before it acts: Form([nameField, emailField, reset], \"Send\", @ToAssistant(\"Submit the contact form\"), false, \"Contact us\"). Children are Fields, FormGroups, Stacks and controls. Pressing Enter in a field or the submit button first runs the browser's own validation (required fields, DatePicker ranges, ...), and only when everything is valid runs the action, using the same steps as Button (@Set, @Reset, @ToAssistant, @OpenUrl). A @ToAssistant action reports the current values of the document's $variables; it does not send FormData, files or anything else, and nothing is posted to a server. Without an action the form shows no submit button and only validates. Add a reset with Button(\"Reset\", false, \"outline\", \"default\", false, false, null, null, @Reset($name, $email)). Use Stack for a plain group of controls that needs no validation.",
  props: formProps,
  component: ({props, renderNode}) => {
    const triggerAction = useTriggerAction();
    const formName = useFormName();
    const isStreaming = useIsStreaming();
    // The object check skips legacy string values, which triggerAction cannot handle. A plan with no steps would only send the label to the assistant.
    const rawAction: unknown = props.action;
    const plan = typeof rawAction === "object" && rawAction && Array.isArray((rawAction as ActionPlan).steps) && (rawAction as ActionPlan).steps.length ? rawAction as ActionPlan : undefined;
    const submitLabel = props.submitLabel?.trim() ? props.submitLabel : "Submit";
    return (
      <Form
        aria-label={props.label?.trim() ? props.label : undefined}
        disabled={props.disabled === true || isStreaming}
        onSubmit={() => { if (plan && !isStreaming) triggerAction(submitLabel, formName, plan as never); }}
      >
        {renderNode(props.children)}
        {plan && (
          <div className="vl-form__actions">
            <Button type="submit">{submitLabel}</Button>
          </div>
        )}
      </Form>
    );
  },
});

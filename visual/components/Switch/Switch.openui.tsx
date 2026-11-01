import {useId, type ChangeEvent} from "react";
import {defineComponent, reactive, useIsStreaming, useStateField} from "@openuidev/react-lang";
import {z} from "zod/v4";
import {Switch} from "./Switch";

// Positional order matters in OpenUI Lang: checked, label, disabled, required. The first three match Checkbox.
// `checked` is reactive(): a bare `$variable` stays a two-way binding instead of being evaluated to its current value.
const switchProps = z.object({
  // describe() goes inside reactive(): on the outer schema it would clone it and drop the reactive mark.
  checked: reactive(z.boolean().describe("A bare boolean $variable, e.g. $notifications. Toggling writes true/false to it. Expressions and literals are not writable")),
  label: z.string().describe("Visible text next to the switch. Clicking it toggles the switch"),
  disabled: z.boolean().optional().describe("Prevents toggling. Default false"),
  required: z.boolean().optional().describe("Inside a Form, the form cannot be submitted until the switch is on. Default false"),
});

export const switchDefinition = defineComponent({
  name: "Switch",
  description: "An on/off switch for a setting that applies immediately: Switch($notifications, \"Email notifications\"). The first argument must be a bare $variable declared with a boolean default (e.g. $notifications = true); toggling updates that variable and every expression that reads it, with no request to the assistant. Use one $variable per Switch. Expressions and literals render a read-only switch. Use Checkbox instead for a choice among several options or a box to acknowledge in a form.",
  props: switchProps,
  component: ({props}) => {
    // The name only keys the SDK's non-reactive fallback field. It is unique per instance so Switches never share state through it,
    // and setValue is never called unless the binding is reactive.
    const field = useStateField(useId(), props.checked);
    const isStreaming = useIsStreaming();
    const label = props.label?.trim() ? props.label : undefined;
    const common = {
      checked: field.value === true,
      onCheckedChange: (checked: boolean, _e: ChangeEvent<HTMLInputElement>) => { if (field.isReactive) field.setValue(checked); },
      disabled: props.disabled === true || isStreaming || !field.isReactive,
      required: props.required === true,
    };
    return label ? <Switch {...common} label={label} /> : <Switch {...common} aria-label="Switch" />;
  },
});

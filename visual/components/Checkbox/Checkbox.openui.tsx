import {useId, type ChangeEvent} from "react";
import {defineComponent, reactive, useIsStreaming, useStateField} from "@openuidev/react-lang";
import {z} from "zod/v4";
import {Checkbox} from "./Checkbox";

// Positional order matters in OpenUI Lang: checked, label, disabled.
// `checked` is reactive(): a bare `$variable` stays a two-way binding instead of being evaluated to its current value.
const checkboxProps = z.object({
  // describe() goes inside reactive(): on the outer schema it would clone it and drop the reactive mark.
  checked: reactive(z.boolean().describe("A bare boolean $variable, e.g. $agree. Toggling writes true/false to it. Expressions and literals are not writable")),
  label: z.string().describe("Visible text next to the box. Clicking it toggles the checkbox"),
  disabled: z.boolean().optional().describe("Prevents toggling. Default false"),
});

export const checkboxDefinition = defineComponent({
  name: "Checkbox",
  description: "A labeled checkbox. The first argument must be a bare $variable declared with a boolean default (e.g. $agree = false); toggling updates that variable and every expression that reads it, with no request to the assistant. Use one $variable per Checkbox. Expressions and literals render a read-only checkbox.",
  props: checkboxProps,
  component: ({props}) => {
    // The name only keys the SDK's non-reactive fallback field. It is unique per instance so Checkboxes never share state through it,
    // and setValue is never called unless the binding is reactive.
    const field = useStateField(useId(), props.checked);
    const isStreaming = useIsStreaming();
    const label = props.label?.trim() ? props.label : undefined;
    const common = {
      checked: field.value === true,
      onCheckedChange: (checked: boolean, _e: ChangeEvent<HTMLInputElement>) => { if (field.isReactive) field.setValue(checked); },
      disabled: props.disabled === true || isStreaming || !field.isReactive,
    };
    return label ? <Checkbox {...common} label={label} /> : <Checkbox {...common} aria-label="Checkbox" />;
  },
});

import {useId, type ChangeEvent} from "react";
import {defineComponent, reactive, useIsStreaming, useStateField} from "@openuidev/react-lang";
import {z} from "zod/v4";
import {Input} from "./Input";

// Positional order matters in OpenUI Lang: value, placeholder, disabled, label.
// `value` is reactive(): a bare `$variable` stays a two-way binding instead of being evaluated to its current text.
const inputProps = z.object({
  // describe() goes inside reactive(): on the outer schema it would clone it and drop the reactive mark.
  value: reactive(z.string().describe("A bare $variable, e.g. $name. Typing writes to it. Expressions and literals are not writable")),
  placeholder: z.string().optional().describe("Hint shown while empty"),
  disabled: z.boolean().optional().describe("Prevents editing. Default false"),
  label: z.string().optional().describe("Visible label above the field. Without it the placeholder is the accessible name"),
});

export const inputDefinition = defineComponent({
  name: "Input",
  description: "A single-line text field. The first argument must be a bare $variable declared with a default (e.g. $name = \"\"); typing updates that variable and every expression that reads it, with no request to the assistant. Use one $variable per Input: two Inputs on the same variable stay in sync. Expressions and literals render a read-only field. Use label for a visible label; otherwise placeholder is the accessible name.",
  props: inputProps,
  component: ({props}) => {
    // The name only keys the SDK's non-reactive fallback field. It is unique per instance so Inputs never share state through it,
    // and setValue is never called unless the binding is reactive.
    const field = useStateField(useId(), props.value);
    const isStreaming = useIsStreaming();
    const {placeholder, disabled} = props;
    const label = props.label?.trim() ? props.label : undefined;
    const common = {
      value: typeof field.value === "string" ? field.value : "",
      onChange: (e: ChangeEvent<HTMLInputElement>) => { if (field.isReactive) field.setValue(e.target.value); },
      placeholder: placeholder ?? undefined,
      disabled: disabled === true || isStreaming || !field.isReactive,
    };
    return label ? <Input {...common} label={label} /> : <Input {...common} aria-label={placeholder || "Text input"} />;
  },
});

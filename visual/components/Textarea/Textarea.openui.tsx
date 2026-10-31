import {useId, type ChangeEvent} from "react";
import {defineComponent, reactive, useIsStreaming, useStateField} from "@openuidev/react-lang";
import {z} from "zod/v4";
import {Textarea} from "./Textarea";

// Positional order matters in OpenUI Lang: value, placeholder, disabled, label, rows. The first four match Input.
// `value` is reactive(): a bare `$variable` stays a two-way binding instead of being evaluated to its current text.
const textareaProps = z.object({
  // describe() goes inside reactive(): on the outer schema it would clone it and drop the reactive mark.
  value: reactive(z.string().describe("A bare $variable, e.g. $notes. Typing writes to it. Expressions and literals are not writable")),
  placeholder: z.string().optional().describe("Hint shown while empty"),
  disabled: z.boolean().optional().describe("Prevents editing. Default false"),
  label: z.string().optional().describe("Visible label above the field. Without it the placeholder is the accessible name"),
  rows: z.number().optional().describe("Visible lines of text before scrolling, 1 to 20. Default 3. The user can still drag it taller"),
});

export const textareaDefinition = defineComponent({
  name: "Textarea",
  description: "A multiline text field. The first argument must be a bare $variable declared with a default (e.g. $notes = \"\"); typing updates that variable and every expression that reads it, with no request to the assistant. Use one $variable per Textarea. Expressions and literals render a read-only field. Use label for a visible label; otherwise placeholder is the accessible name.",
  props: textareaProps,
  component: ({props}) => {
    // The name only keys the SDK's non-reactive fallback field. It is unique per instance so Textareas never share state through it,
    // and setValue is never called unless the binding is reactive.
    const field = useStateField(useId(), props.value);
    const isStreaming = useIsStreaming();
    const {placeholder, disabled, rows} = props;
    const label = props.label?.trim() ? props.label : undefined;
    const common = {
      value: typeof field.value === "string" ? field.value : "",
      onChange: (e: ChangeEvent<HTMLTextAreaElement>) => { if (field.isReactive) field.setValue(e.target.value); },
      placeholder: placeholder ?? undefined,
      rows: typeof rows === "number" && Number.isFinite(rows) ? Math.min(20, Math.max(1, Math.round(rows))) : undefined,
      disabled: disabled === true || isStreaming || !field.isReactive,
    };
    return label ? <Textarea {...common} label={label} /> : <Textarea {...common} aria-label={placeholder || "Text area"} />;
  },
});

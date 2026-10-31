import {useId, type ChangeEvent} from "react";
import {defineComponent, reactive, useIsStreaming, useStateField} from "@openuidev/react-lang";
import {z} from "zod/v4";
import {RadioGroup, type RadioGroupOption} from "./RadioGroup";

// Positional order matters in OpenUI Lang: value, options, label, disabled.
// An option is a plain string (label and value are the same text) or {label, value} when they differ.
const optionSchema = z.union([
  z.string(),
  z.object({label: z.string(), value: z.string()}),
]);

// `value` is reactive(): a bare `$variable` stays a two-way binding instead of being evaluated to its current text.
const radioGroupProps = z.object({
  // describe() goes inside reactive(): on the outer schema it would clone it and drop the reactive mark.
  value: reactive(z.string().describe("A bare $variable holding the selected option's value, e.g. $plan. Choosing an option writes to it. Expressions and literals are not writable")),
  options: z.array(optionSchema).describe("The choices, in order: strings like [\"Free\", \"Pro\"] (label and value are the same text) or {label: \"Small\", value: \"sm\"} objects"),
  label: z.string().optional().describe("Visible group label above the options. Without it the accessible name is just \"Radio group\", so always provide one"),
  disabled: z.boolean().optional().describe("Prevents changing the selection. Default false"),
});

export const radioGroupDefinition = defineComponent({
  name: "RadioGroup",
  description: "A single-choice group of radio buttons. The first argument must be a bare $variable declared with a string default equal to one option's value (e.g. $plan = \"Free\"); choosing an option updates that variable and every expression that reads it, with no request to the assistant. Use one $variable per group. Expressions and literals render a read-only group. Use it for 2 to 5 visible choices; options are strings or {label, value} objects.",
  props: radioGroupProps,
  component: ({props}) => {
    // The name only keys the SDK's non-reactive fallback field. It is unique per instance so groups never share state through it,
    // and setValue is never called unless the binding is reactive.
    const field = useStateField(useId(), props.value);
    const isStreaming = useIsStreaming();
    const label = props.label?.trim() ? props.label : undefined;
    const options: RadioGroupOption[] = (props.options ?? []).map(o => typeof o === "string" ? {label: o, value: o} : {label: o.label, value: o.value});
    const common = {
      value: typeof field.value === "string" ? field.value : "",
      options,
      onValueChange: (value: string, _e: ChangeEvent<HTMLInputElement>) => { if (field.isReactive) field.setValue(value); },
      disabled: props.disabled === true || isStreaming || !field.isReactive,
    };
    return label ? <RadioGroup {...common} label={label} /> : <RadioGroup {...common} aria-label="Radio group" />;
  },
});

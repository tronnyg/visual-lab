import {useId, type ChangeEvent} from "react";
import {defineComponent, reactive, useIsStreaming, useStateField} from "@openuidev/react-lang";
import {z} from "zod/v4";
import {Select, type SelectOption} from "./Select";

// Positional order matters in OpenUI Lang: value, options, label, disabled, placeholder. The first four match RadioGroup.
// An option is a plain string (label and value are the same text) or {label, value} when they differ.
const optionSchema = z.union([
  z.string(),
  z.object({label: z.string(), value: z.string()}),
]);

// `value` is reactive(): a bare `$variable` stays a two-way binding instead of being evaluated to its current text.
const selectProps = z.object({
  // describe() goes inside reactive(): on the outer schema it would clone it and drop the reactive mark.
  value: reactive(z.string().describe("A bare $variable holding the selected option's value, e.g. $country. Choosing an option writes to it. Expressions and literals are not writable")),
  options: z.array(optionSchema).describe("The choices, in order: strings like [\"Red\", \"Green\"] (label and value are the same text) or {label: \"Small\", value: \"sm\"} objects"),
  label: z.string().optional().describe("Visible label above the select. Without it the accessible name is just \"Select\", so always provide one"),
  disabled: z.boolean().optional().describe("Prevents changing the selection. Default false"),
  placeholder: z.string().optional().describe("Text shown while the variable matches no option, e.g. $country = \"\" with \"Choose a country\". Without it the closed select is blank"),
});

export const selectDefinition = defineComponent({
  name: "Select",
  description: "A single-choice dropdown. The first argument must be a bare $variable declared with a string default (e.g. $country = \"Canada\", or \"\" to start with the placeholder); choosing an option updates that variable and every expression that reads it, with no request to the assistant. Use one $variable per Select. Expressions and literals render a read-only select. Use it for 5 or more choices; use RadioGroup for fewer. Options are strings or {label, value} objects.",
  props: selectProps,
  component: ({props}) => {
    // The name only keys the SDK's non-reactive fallback field. It is unique per instance so Selects never share state through it,
    // and setValue is never called unless the binding is reactive.
    const field = useStateField(useId(), props.value);
    const isStreaming = useIsStreaming();
    const label = props.label?.trim() ? props.label : undefined;
    const options: SelectOption[] = (props.options ?? []).map(o => typeof o === "string" ? {label: o, value: o} : {label: o.label, value: o.value});
    const common = {
      value: typeof field.value === "string" ? field.value : "",
      options,
      placeholder: props.placeholder ?? undefined,
      onValueChange: (value: string, _e: ChangeEvent<HTMLSelectElement>) => { if (field.isReactive) field.setValue(value); },
      disabled: props.disabled === true || isStreaming || !field.isReactive,
    };
    return label ? <Select {...common} label={label} /> : <Select {...common} aria-label="Select" />;
  },
});

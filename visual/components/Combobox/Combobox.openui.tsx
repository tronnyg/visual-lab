import {useId} from "react";
import {defineComponent, reactive, useIsStreaming, useStateField} from "@openuidev/react-lang";
import {z} from "zod/v4";
import {Combobox} from "./Combobox";
import type {ComboboxOption} from "./Combobox";

// Positional order matters in OpenUI Lang: value, options, label, disabled, placeholder, required, emptyMessage. The first four match Select.
// An option is a plain string (label and value are the same text) or {label, value, description, disabled}.
const optionSchema = z.union([
  z.string(),
  z.object({
    label: z.string(),
    value: z.string(),
    description: z.string().optional(),
    disabled: z.boolean().optional(),
  }),
]);

// `value` is reactive(): a bare `$variable` stays a two-way binding instead of being evaluated to its current text.
const comboboxProps = z.object({
  // describe() goes inside reactive(): on the outer schema it would clone it and drop the reactive mark.
  value: reactive(z.string().describe("A bare $variable holding the chosen option's value, e.g. $country. Choosing an option writes to it, \"\" when nothing is chosen. Expressions and literals are not writable")),
  options: z.array(optionSchema).describe("The choices, in order: strings like [\"Canada\", \"Chile\"] (label and value are the same text) or {label: \"United States\", value: \"us\", description: \"North America\"} objects. Plain strings and values must be unique"),
  label: z.string().optional().describe("Visible label above the field. Without it the accessible name is just \"Combobox\", so always provide one"),
  disabled: z.boolean().optional().describe("Prevents changing the selection. Default false"),
  placeholder: z.string().optional().describe("Hint shown while nothing is chosen, e.g. \"Search countries\""),
  required: z.boolean().optional().describe("Inside a Form, the form cannot be submitted until an option is chosen. Default false"),
  emptyMessage: z.string().optional().describe("Shown when the search matches nothing. Default \"No results\""),
});

export const comboboxDefinition = defineComponent({
  name: "Combobox",
  description: "A searchable single-choice list: Combobox($country, [\"Canada\", \"Chile\", \"China\"], \"Country\"). The first argument must be a bare $variable declared with a string default (e.g. $country = \"Canada\", or \"\" for none); choosing an option updates that variable and every expression that reads it, with no request to the assistant. The list filters by label and value as the user types. Use one $variable per Combobox. Expressions and literals render a read-only field. It searches the options you give it and never fetches data. Use Select for a short list (it is native and simplest) and Combobox when the list is long enough that searching helps.",
  props: comboboxProps,
  component: ({props}) => {
    // The name only keys the SDK's non-reactive fallback field. It is unique per instance so Comboboxes never share state through it,
    // and setValue is never called unless the binding is reactive.
    const field = useStateField(useId(), props.value);
    const isStreaming = useIsStreaming();
    const label = props.label?.trim() ? props.label : undefined;
    // Duplicate values would be duplicate React keys and ids, so only the first of each is kept.
    const seen = new Set<string>();
    const options: ComboboxOption[] = (props.options ?? []).flatMap((o): ComboboxOption[] => {
      const option = typeof o === "string" ? {label: o, value: o} : {label: o.label, value: o.value, description: o.description || undefined, disabled: o.disabled === true};
      if (seen.has(option.value)) return [];
      seen.add(option.value);
      return [option];
    });
    const common = {
      value: typeof field.value === "string" ? field.value : "",
      options,
      placeholder: props.placeholder ?? undefined,
      emptyMessage: props.emptyMessage ?? undefined,
      required: props.required === true,
      onValueChange: (value: string) => { if (field.isReactive) field.setValue(value); },
      disabled: props.disabled === true || isStreaming || !field.isReactive,
    };
    return label ? <Combobox {...common} label={label} /> : <Combobox {...common} aria-label="Combobox" />;
  },
});

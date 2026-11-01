import {useId} from "react";
import {defineComponent, reactive, useIsStreaming, useStateField} from "@openuidev/react-lang";
import {z} from "zod/v4";
import {DatePicker} from "./DatePicker";

// Positional order matters in OpenUI Lang: value, label, min, max, disabled, required, placeholder.
// The value is a calendar date as "YYYY-MM-DD" (not a timestamp), or "" for none. `value` is reactive(): a bare `$variable` stays a two-way binding.
const datePickerProps = z.object({
  // describe() goes inside reactive(): on the outer schema it would clone it and drop the reactive mark.
  value: reactive(z.string().describe("A bare $variable holding a date as YYYY-MM-DD, e.g. $date = \"2026-03-15\", or \"\" for no date. Picking or typing a date writes to it. Expressions and literals are not writable")),
  label: z.string().optional().describe("Visible label above the field. Without it the accessible name is just \"Date\", so always provide one"),
  min: z.string().optional().describe("Earliest selectable date, YYYY-MM-DD"),
  max: z.string().optional().describe("Latest selectable date, YYYY-MM-DD"),
  disabled: z.boolean().optional().describe("Prevents changing the date. Default false"),
  required: z.boolean().optional().describe("Inside a Form, the form cannot be submitted without a date. Default false"),
  placeholder: z.string().optional().describe("Hint shown while empty. Default YYYY-MM-DD"),
});

export const datePickerDefinition = defineComponent({
  name: "DatePicker",
  description: "Selects one calendar date: DatePicker($date, \"Appointment date\", \"2026-01-01\", \"2026-12-31\"). The first argument must be a bare $variable declared with a date string (e.g. $date = \"2026-03-15\", or \"\" for none) in the format YYYY-MM-DD; picking from the calendar or typing a date updates that variable and every expression that reads it, with no request to the assistant. Dates are calendar days, not timestamps and not times. min and max (YYYY-MM-DD) limit the choice. Use one $variable per DatePicker. Expressions and literals render a read-only field. Use Input for free text, and a date range or date-time is not supported.",
  props: datePickerProps,
  component: ({props}) => {
    // The name only keys the SDK's non-reactive fallback field. It is unique per instance so pickers never share state through it,
    // and setValue is never called unless the binding is reactive.
    const field = useStateField(useId(), props.value);
    const isStreaming = useIsStreaming();
    const label = props.label?.trim() ? props.label : undefined;
    const common = {
      value: typeof field.value === "string" ? field.value : "",
      onValueChange: (date: string) => { if (field.isReactive) field.setValue(date); },
      min: props.min ?? undefined,
      max: props.max ?? undefined,
      placeholder: props.placeholder ?? undefined,
      required: props.required === true,
      disabled: props.disabled === true || isStreaming || !field.isReactive,
    };
    return label ? <DatePicker {...common} label={label} /> : <DatePicker {...common} aria-label="Date" />;
  },
});

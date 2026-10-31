import {useId, type ChangeEvent} from "react";
import {defineComponent, reactive, useIsStreaming, useStateField} from "@openuidev/react-lang";
import {z} from "zod/v4";
import {Slider} from "./Slider";

// Positional order matters in OpenUI Lang: value, label, min, max, step, disabled.
// `value` is reactive(): a bare `$variable` stays a two-way binding instead of being evaluated to its current number.
const sliderProps = z.object({
  // describe() goes inside reactive(): on the outer schema it would clone it and drop the reactive mark.
  value: reactive(z.number().describe("A bare number $variable, e.g. $volume. Dragging writes a single number to it. Expressions and literals are not writable")),
  label: z.string().optional().describe("Visible label above the slider. Without it the accessible name is just \"Slider\", so always provide one"),
  min: z.number().optional().describe("Lowest value. Default 0"),
  max: z.number().optional().describe("Highest value. Default 100"),
  step: z.number().optional().describe("Increment between values. Default 1"),
  disabled: z.boolean().optional().describe("Prevents changing the value. Default false"),
});

export const sliderDefinition = defineComponent({
  name: "Slider",
  description: "A single-value numeric slider. The first argument must be a bare $variable declared with a number default (e.g. $volume = 40); dragging or using the arrow keys updates that variable and every expression that reads it immediately, with no request to the assistant. Use one $variable per Slider. Expressions and literals render a read-only slider. The current value is shown beside the label.",
  props: sliderProps,
  component: ({props}) => {
    // The name only keys the SDK's non-reactive fallback field. It is unique per instance so Sliders never share state through it,
    // and setValue is never called unless the binding is reactive.
    const field = useStateField(useId(), props.value);
    const isStreaming = useIsStreaming();
    const min = typeof props.min === "number" && Number.isFinite(props.min) ? props.min : 0;
    const max = typeof props.max === "number" && Number.isFinite(props.max) ? props.max : 100;
    const step = typeof props.step === "number" && Number.isFinite(props.step) && props.step > 0 ? props.step : undefined;
    const label = props.label?.trim() ? props.label : undefined;
    const common = {
      value: typeof field.value === "number" && Number.isFinite(field.value) ? field.value : min,
      min,
      max,
      step,
      onValueChange: (value: number, _e: ChangeEvent<HTMLInputElement>) => { if (field.isReactive) field.setValue(value); },
      disabled: props.disabled === true || isStreaming || !field.isReactive,
    };
    return label ? <Slider {...common} label={label} /> : <Slider {...common} aria-label="Slider" />;
  },
});

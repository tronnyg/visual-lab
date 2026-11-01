import {useId} from "react";
import {defineComponent, reactive, useIsStreaming, useStateField} from "@openuidev/react-lang";
import {z} from "zod/v4";
import {Stepper, stepperOrientations} from "./Stepper";
import type {StepperItem} from "./Stepper";

// Positional order matters in OpenUI Lang: steps, value, orientation, interactive.
// `value` is reactive(): a bare `$variable` stays a two-way binding; a string literal only picks the current step (read-only).
const stepperProps = z.object({
  steps: z.array(z.object({
    id: z.string().describe("Unique id for the step, e.g. \"account\""),
    label: z.string().describe("The step's name"),
    description: z.string().optional().describe("A short line under the name"),
    disabled: z.boolean().optional().describe("The step cannot be chosen when interactive. Default false"),
  })).describe("The steps in order: {id, label, description} objects, e.g. [{id: \"account\", label: \"Account\"}, {id: \"plan\", label: \"Plan\"}, {id: \"done\", label: \"Done\"}]"),
  // describe() goes inside reactive(): on the outer schema it would clone it and drop the reactive mark.
  value: reactive(z.string().optional().describe("The current step's id: a bare $variable (two-way, readable elsewhere) or a string. Skip with null to start at the first step")),
  orientation: z.enum(stepperOrientations).optional().describe("horizontal (default; stacks in a narrow space) or vertical"),
  interactive: z.boolean().optional().describe("Makes each enabled step a button that moves to it. Needs a bare $variable as value. Default false"),
});

type RawStep = {id?: unknown; label?: unknown; description?: unknown; disabled?: unknown};

// Skipped entries (null, or still streaming) are dropped. A repeated id gets a numeric suffix so every step keeps a distinct id.
function toSteps(input: unknown): StepperItem[] {
  if (!Array.isArray(input)) return [];
  const seen = new Set<string>();
  return (input as (RawStep | null | undefined)[]).flatMap((raw): StepperItem[] => {
    if (!raw || typeof raw.id !== "string" || typeof raw.label !== "string") return [];
    let id = raw.id;
    for (let n = 2; seen.has(id); n++) id = `${raw.id}-${n}`;
    seen.add(id);
    return [{id, label: raw.label, description: typeof raw.description === "string" && raw.description ? raw.description : undefined, disabled: raw.disabled === true}];
  });
}

export const stepperDefinition = defineComponent({
  name: "Stepper",
  description: "Progress through an ordered process: Stepper([{id: \"account\", label: \"Account\"}, {id: \"plan\", label: \"Plan\"}, {id: \"done\", label: \"Done\"}], $step, \"horizontal\", true). Steps before the current one show as completed. Pass a bare $variable declared with a step id (e.g. $step = \"account\") as value to read or set the current step elsewhere, for instance with Buttons using @Set($step, \"plan\"); a string only sets a fixed current step. interactive (needs a $variable) makes the steps clickable. It shows and navigates progress only: it never validates or advances by itself. Use Tabs for mutually exclusive views, not steps.",
  props: stepperProps,
  component: ({props}) => {
    // The name only keys the SDK's non-reactive fallback field. It is unique per instance so Steppers never share state through it,
    // and setValue is never called unless the binding is reactive.
    const field = useStateField(useId(), props.value);
    const isStreaming = useIsStreaming();
    const {orientation} = Object.fromEntries(Object.entries(props).filter(([, v]) => v != null)) as Partial<typeof props>;
    const current = typeof field.value === "string" ? field.value : undefined;
    return (
      <Stepper
        steps={toSteps(props.steps)}
        value={current ?? ""}
        orientation={orientation}
        interactive={props.interactive === true && field.isReactive && !isStreaming}
        onValueChange={next => { if (field.isReactive) field.setValue(next); }}
      />
    );
  },
});

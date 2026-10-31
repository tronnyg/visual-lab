import {defineComponent} from "@openuidev/react-lang";
import {z} from "zod/v4";
import {Progress} from "./Progress";

// Positional order matters in OpenUI Lang: value first (required), then max, then label.
// value is not wrapped in reactive(): Progress is display-only and never writes to a variable. Expressions such as $volume or
// $done / $total * 100 are evaluated by the renderer before they reach the component, and the bar follows the variable.
const progressProps = z.object({
  value: z.number().describe("Current value from 0 to max. May be an expression or a bare $variable, e.g. a Slider's. Out-of-range values are clamped"),
  max: z.number().optional().describe("Value at which the bar is full. Default 100"),
  label: z.string().optional().describe("Accessible name, not displayed, e.g. \"Upload progress\". Show visible text with a Text next to the bar"),
});

export const progressDefinition = defineComponent({
  name: "Progress",
  description: "A horizontal progress bar showing how far along something is, from 0 to a maximum (default 100), e.g. Progress($done, 100, \"Upload progress\"). It is display-only and changes whenever the variable it reads changes; it cannot be dragged. Progress draws no text of its own, so put a Text beside it for a visible label or percentage. Use Slider when the user should set the value.",
  props: progressProps,
  component: ({props}) => {
    // Skipped optional arguments (null, or an unresolved expression) must not reach the component, where defaults only apply to undefined.
    const {value, label, ...rest} = Object.fromEntries(Object.entries(props).filter(([, v]) => v != null)) as typeof props;
    // The name is announced by screen readers, so an unlabelled bar still gets a generic one.
    return <Progress {...rest} value={value} label={label?.trim() ? label : "Progress"} />;
  },
});

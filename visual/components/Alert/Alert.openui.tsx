import {defineComponent} from "@openuidev/react-lang";
import {z} from "zod/v4";
import {Alert, alertVariants} from "./Alert";

// Positional order matters in OpenUI Lang: message first (required), then title, then variant.
// message and title are not wrapped in reactive(): Alert is display-only. Expressions such as "Saved " + $count + " items" are
// evaluated by the renderer before they reach the component, and the alert updates when the variable changes.
const alertProps = z.object({
  message: z.union([z.string(), z.number()]).describe("The message. May be an expression, e.g. \"Saved \" + $count + \" items\""),
  title: z.string().optional().describe("Optional bold first line, kept short"),
  variant: z.enum(alertVariants).optional().describe("info, success, warning, danger. Default info"),
});

export const alertDefinition = defineComponent({
  name: "Alert",
  description: "A static, inline message that calls out information, a success, a warning or an error within the page, with an icon, an optional title and a message. Arguments are message, then title, then variant, e.g. Alert(\"Your changes are saved.\", \"Saved\", \"success\"). Alert is not announced to screen readers, has no dismiss button, timer or action, and is not a toast; use Text for ordinary sentences and Badge for a short label.",
  props: alertProps,
  component: ({props}) => {
    // Skipped optional arguments (null, or an unresolved expression) must not reach the component, where defaults only apply to undefined.
    const {message, ...rest} = Object.fromEntries(Object.entries(props).filter(([, v]) => v != null)) as typeof props;
    return <Alert {...rest}>{message}</Alert>;
  },
});

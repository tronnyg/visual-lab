import {defineComponent} from "@openuidev/react-lang";
import {z} from "zod/v4";
import {Badge, badgeVariants} from "./Badge";

// Positional order matters in OpenUI Lang: text first (required), then variant.
// `text` is not wrapped in reactive(): Badge is display-only. Expressions such as "Items: " + $count are evaluated
// by the renderer before they reach the component, and the badge updates when the variable changes.
const badgeProps = z.object({
  text: z.union([z.string(), z.number()]).describe("The label, kept short. May be an expression, e.g. $count + \" new\""),
  variant: z.enum(badgeVariants).optional().describe("default (solid accent), secondary (muted), outline, success, warning, danger. Default default"),
});

export const badgeDefinition = defineComponent({
  name: "Badge",
  description: "A small, non-interactive label for a short category or status, such as \"New\", \"Beta\" or \"Overdue\". Use the success, warning and danger variants for status and always put the meaning in the text, not only in the colour. Badge is not a button and cannot be clicked; use Button for actions, Text for sentences and Alert for messages.",
  props: badgeProps,
  component: ({props}) => {
    // Skipped optional arguments (null, or an unresolved expression) must not reach the component, where defaults only apply to undefined.
    const {text, ...rest} = Object.fromEntries(Object.entries(props).filter(([, v]) => v != null)) as typeof props;
    return <Badge {...rest}>{text}</Badge>;
  },
});

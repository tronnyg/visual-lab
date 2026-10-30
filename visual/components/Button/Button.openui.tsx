import type {ReactNode} from "react";
import {action, defineComponent, useFormName, useIsStreaming, useTriggerAction} from "@openuidev/react-lang";
import {z} from "zod/v4";
import {Button, buttonSizes, buttonVariants} from "./Button";
import {Icon, iconNames, type IconName} from "../Icon/Icon";

// Button shares the Icon component's icon vocabulary (a curated Lucide subset), so the two never drift apart.
// The original eight names (arrow-right, arrow-left, plus, check, download, external-link, trash, send) are all still valid.
export const buttonIcons = iconNames;

function icon(name: IconName | undefined): ReactNode {
  return name ? <Icon name={name} /> : undefined;
}

// Positional order matters in OpenUI Lang. `disabled` stays second so existing Button(label, disabled) boards keep working.
const buttonProps = z.object({
  label: z.string().describe("Visible button text"),
  disabled: z.boolean().optional().describe("Prevents interaction. Default false"),
  variant: z.enum(buttonVariants).optional().describe("Emphasis. Default primary"),
  size: z.enum(buttonSizes).optional().describe("Default default"),
  loading: z.boolean().optional().describe("Shows a spinner and ignores clicks. Default false"),
  fullWidth: z.boolean().optional().describe("Stretch to the container width. Default false"),
  leadingIcon: z.enum(buttonIcons).optional().describe("Icon before the label"),
  trailingIcon: z.enum(buttonIcons).optional().describe("Icon after the label"),
  action: action().optional().describe("What happens on click, e.g. @Set($count, $count + 1), @Reset($count) or @ToAssistant(\"message\"). Omit for a button that does nothing"),
});

export const buttonDefinition = defineComponent({
  name: "Button",
  description: "A button with a visible label. The action is the 9th and last argument, so earlier ones are filled with false/null. A Button with no action does nothing and does not message the assistant.",
  props: buttonProps,
  component: ({props}) => {
    const triggerAction = useTriggerAction();
    const formName = useFormName();
    const isStreaming = useIsStreaming();
    const {label, action: onActivate, leadingIcon, trailingIcon, ...rest} = props;
    return (
      <Button
        {...rest}
        leadingIcon={icon(leadingIcon)}
        trailingIcon={icon(trailingIcon)}
        // triggerAction without an action would emit a default continue_conversation event, so only wire it when one is given.
        // The object check skips legacy string values from the old actionId argument, which triggerAction cannot handle.
        onClick={typeof onActivate === "object" && onActivate && !isStreaming ? () => triggerAction(label, formName, onActivate) : undefined}
      >
        {label}
      </Button>
    );
  },
});

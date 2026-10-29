import type {ReactNode} from "react";
import {BuiltinActionType, defineComponent, useFormName, useIsStreaming, useTriggerAction} from "@openuidev/react-lang";
import {z} from "zod/v4";
import {Button, buttonSizes, buttonVariants} from "./Button";

// Allowlist of icons the model may request. Hand-written 24px stroke paths; there is no shared icon system yet.
const iconPaths = {
  "arrow-right": "M5 12h14M12 5l7 7-7 7",
  "arrow-left": "M19 12H5M12 19l-7-7 7-7",
  plus: "M12 5v14M5 12h14",
  check: "M20 6 9 17l-5-5",
  download: "M12 3v12M7 10l5 5 5-5M5 21h14",
  "external-link": "M14 4h6v6M20 4 10 14M18 14v5a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1h5",
  trash: "M4 7h16M10 11v6M14 11v6M6 7l1 13h10l1-13M9 7V4h6v3",
  send: "M22 2 11 13M22 2l-7 20-4-9-9-4z",
} as const;
export const buttonIcons = Object.keys(iconPaths) as [keyof typeof iconPaths, ...(keyof typeof iconPaths)[]];
type ButtonIcon = keyof typeof iconPaths;

function icon(name: ButtonIcon | undefined): ReactNode {
  if (!name || !(name in iconPaths)) return undefined;
  return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d={iconPaths[name]} /></svg>;
}

// The parser does not enforce string patterns, so the adapter re-checks the id before emitting.
const actionIdPattern = /^[a-z0-9][a-z0-9_-]{0,63}$/i;

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
  actionId: z.string().regex(actionIdPattern).optional().describe("Identifier reported to the agent when the button is clicked, e.g. show-explanation. Omit for a button that does nothing"),
});

export const buttonDefinition = defineComponent({
  name: "Button",
  description: "A button with a visible label. Give it an actionId so the agent is notified when the user clicks it.",
  props: buttonProps,
  component: ({props}) => {
    const triggerAction = useTriggerAction();
    const formName = useFormName();
    const isStreaming = useIsStreaming();
    const {label, actionId, leadingIcon, trailingIcon, ...rest} = props;
    return (
      <Button
        {...rest}
        leadingIcon={icon(leadingIcon)}
        trailingIcon={icon(trailingIcon)}
        onClick={actionId && actionIdPattern.test(actionId) && !isStreaming ? () => triggerAction(label, formName, {type: BuiltinActionType.ContinueConversation, params: {actionId}}) : undefined}
      >
        {label}
      </Button>
    );
  },
});

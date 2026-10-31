import {defineComponent} from "@openuidev/react-lang";
import {z} from "zod/v4";
import {Tooltip, tooltipPlacements} from "./Tooltip";
import {panelContentSchema} from "../../shared/contentRefs";

// Positional order matters in OpenUI Lang: text, trigger, placement, delay, disabled.
// `trigger` is a typed reference to one registered component (see shared/contentRefs.ts), deferred by a getter so Tooltip and the
// components it can wrap may import each other. A tooltip is supplementary text only, so there is no content reference and no state.
const tooltipProps = z.object({
  text: z.string().describe("The short tooltip text (plain text, one sentence at most)"),
  get trigger(): z.ZodType {
    return panelContentSchema().describe("The one component the tooltip describes, normally a Button");
  },
  placement: z.enum(tooltipPlacements).optional().describe("Preferred side: top (default), bottom, left, right. It flips if there is no room"),
  delay: z.number().optional().describe("Milliseconds the pointer must rest before it appears. Default 300. Keyboard focus shows it at once"),
  disabled: z.boolean().optional().describe("Never shows. Default false"),
});

export const tooltipDefinition = defineComponent({
  name: "Tooltip",
  description: "Short supplementary text shown when a control is hovered or keyboard-focused: Tooltip(text, trigger, placement, delay, disabled), e.g. Tooltip(\"Save your changes\", Button(\"Save\")). The trigger is ONE component defined elsewhere, normally a Button. The text is plain and brief and is never the only place essential information appears; it cannot hold buttons or links. There is nothing to click and nothing to bind. Use Popover for interactive content, Alert or Text for information everyone must see.",
  props: tooltipProps,
  component: ({props, renderNode}) => {
    const {placement, delay, disabled} = Object.fromEntries(Object.entries(props).filter(([, v]) => v != null)) as Partial<typeof props>;
    return <Tooltip content={props.text} placement={placement} delay={delay} disabled={disabled}>{renderNode(props.trigger)}</Tooltip>;
  },
});

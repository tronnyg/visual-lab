import {useId} from "react";
import {defineComponent, reactive, useStateField} from "@openuidev/react-lang";
import {z} from "zod/v4";
import {Popover, popoverAligns, popoverPlacements} from "./Popover";
import {panelContentSchema} from "../../shared/contentRefs";

// Positional order matters in OpenUI Lang: trigger, content, placement, align, open, closeOnOutsideClick, closeOnEscape.
// `trigger` and `content` are typed references to one registered component each (see shared/contentRefs.ts), deferred by getters so
// Popover and the components it can contain may import each other.
// `open` is reactive(): a bare `$variable` stays a two-way binding; true/false only picks the initial state.
const popoverProps = z.object({
  get trigger(): z.ZodType {
    return panelContentSchema().describe("The control that toggles the popover, normally a Button (it needs no action)");
  },
  get content(): z.ZodType {
    return panelContentSchema().describe("The one component shown in the popover. Wrap several components in a Stack");
  },
  placement: z.enum(popoverPlacements).optional().describe("Preferred side of the trigger: top, bottom (default), left, right. It flips if there is no room"),
  align: z.enum(popoverAligns).optional().describe("Alignment along that side: start, center (default), end"),
  // describe() goes inside reactive(): on the outer schema it would clone it and drop the reactive mark.
  open: reactive(z.boolean().optional().describe("A bare boolean $variable (two-way, readable elsewhere) or true/false for the initial state. Skip with null to start closed")),
  closeOnOutsideClick: z.boolean().optional().describe("Pressing outside closes it. Default true"),
  closeOnEscape: z.boolean().optional().describe("Escape closes it. Default true"),
});

export const popoverDefinition = defineComponent({
  name: "Popover",
  description: "Small interactive content that appears next to a trigger and stays until dismissed: Popover(trigger, content, placement, align, open, closeOnOutsideClick, closeOnEscape), e.g. Popover(Button(\"Filters\", false, \"outline\"), filters, \"bottom\", \"start\"). The trigger is normally a Button and needs no action; content is ONE component defined elsewhere (wrap several in a Stack), so it can hold inputs, checkboxes and buttons. It is not modal and does not trap focus; it closes on Escape or a press outside. Pass a bare boolean $variable as open to read or set it elsewhere, e.g. Button(\"Done\", false, \"primary\", \"default\", false, false, null, null, @Set($open, false)) inside the content. Use Tooltip for brief non-interactive text, Dialog for focused modal content, DropdownMenu for a list of actions.",
  props: popoverProps,
  component: ({props, renderNode}) => {
    // The name only keys the SDK's non-reactive fallback field. It is unique per instance so popovers never share state through it,
    // and setValue is never called unless the binding is reactive.
    const field = useStateField(useId(), props.open);
    const {placement, align, closeOnOutsideClick, closeOnEscape} = Object.fromEntries(Object.entries(props).filter(([, v]) => v != null)) as Partial<typeof props>;
    return (
      <Popover
        trigger={renderNode(props.trigger)}
        {...(field.isReactive ? {open: field.value === true} : {defaultOpen: field.value === true})}
        onOpenChange={next => { if (field.isReactive) field.setValue(next); }}
        placement={placement}
        align={align}
        closeOnOutsideClick={closeOnOutsideClick}
        closeOnEscape={closeOnEscape}
      >
        {renderNode(props.content)}
      </Popover>
    );
  },
});

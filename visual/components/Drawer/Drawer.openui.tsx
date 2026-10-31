import {useId} from "react";
import {defineComponent, reactive, useStateField} from "@openuidev/react-lang";
import {z} from "zod/v4";
import {Drawer, drawerSides} from "./Drawer";
import {panelContentSchema} from "../../shared/contentRefs";

// Positional order matters in OpenUI Lang: title, content, trigger, open, side, description, closeOnBackdrop, closeOnEscape.
// Like Dialog: `content` and `trigger` are typed references (see shared/contentRefs.ts) deferred by getters, and `open` is reactive().
const drawerProps = z.object({
  title: z.string().describe("The drawer's heading and accessible name"),
  get content(): z.ZodType {
    return panelContentSchema().describe("The one component shown in the drawer. Wrap several components in a Stack");
  },
  get trigger(): z.ZodType {
    return panelContentSchema().optional().describe("Optional Button (or other control) that opens the drawer. Skip with null when a Button elsewhere sets the open variable");
  },
  // describe() goes inside reactive(): on the outer schema it would clone it and drop the reactive mark.
  open: reactive(z.boolean().optional().describe("A bare boolean $variable (declared false) that a Button opens with @Set($open, true), or true/false for the initial state. Skip with null to start closed")),
  side: z.enum(drawerSides).optional().describe("Edge the panel slides from: right (default), left, top, bottom"),
  description: z.string().optional().describe("Supporting text under the title"),
  closeOnBackdrop: z.boolean().optional().describe("Clicking outside the drawer closes it. Default true"),
  closeOnEscape: z.boolean().optional().describe("Escape closes it. Default true"),
});

export const drawerDefinition = defineComponent({
  name: "Drawer",
  description: "A modal panel attached to an edge of the screen for supporting content such as details, filters or navigation: Drawer(title, content, trigger, open, side, description, closeOnBackdrop, closeOnEscape), e.g. Drawer(\"Filters\", filters, Button(\"Filters\", false, \"outline\"), false, \"right\", \"Narrow the results.\"). Content is ONE component defined elsewhere (wrap several in a Stack), scrolls when tall and keeps its state while closed. Open it with a trigger (a Button, which needs no action) or with a bare boolean $variable declared false as open, which a Button sets with @Set($open, true); a Button inside the content closes it with @Set($open, false). The page behind is inert while it is open. Use Dialog for centred content that needs a decision, Popover for small content beside its trigger.",
  props: drawerProps,
  component: ({props, renderNode}) => {
    // The name only keys the SDK's non-reactive fallback field. It is unique per instance so drawers never share state through it,
    // and setValue is never called unless the binding is reactive.
    const field = useStateField(useId(), props.open);
    const {side, description, closeOnBackdrop, closeOnEscape} = Object.fromEntries(Object.entries(props).filter(([, v]) => v != null)) as Partial<typeof props>;
    return (
      <Drawer
        title={props.title}
        trigger={props.trigger == null ? undefined : renderNode(props.trigger)}
        {...(field.isReactive ? {open: field.value === true} : {defaultOpen: field.value === true})}
        onOpenChange={next => { if (field.isReactive) field.setValue(next); }}
        side={side}
        description={description}
        closeOnBackdrop={closeOnBackdrop}
        closeOnEscape={closeOnEscape}
      >
        {renderNode(props.content)}
      </Drawer>
    );
  },
});

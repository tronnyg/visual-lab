import {useId} from "react";
import {defineComponent, reactive, useStateField} from "@openuidev/react-lang";
import {z} from "zod/v4";
import {Dialog} from "./Dialog";
import {panelContentSchema} from "../../shared/contentRefs";

// Positional order matters in OpenUI Lang: title, content, trigger, open, description, closeOnBackdrop, closeOnEscape, showCloseButton.
// `content` and `trigger` are typed references to one registered component each (see shared/contentRefs.ts). The getters defer those
// references so Dialog and the components it can contain may import each other.
// `open` is reactive(): a bare `$variable` stays a two-way binding (a Button elsewhere opens it with @Set); true/false only picks the initial state.
const dialogProps = z.object({
  title: z.string().describe("The dialog's heading and accessible name"),
  get content(): z.ZodType {
    return panelContentSchema().describe("The one component shown in the dialog. Wrap several components in a Stack");
  },
  get trigger(): z.ZodType {
    return panelContentSchema().optional().describe("Optional Button (or other control) that opens the dialog. Skip with null when a Button elsewhere sets the open variable");
  },
  // describe() goes inside reactive(): on the outer schema it would clone it and drop the reactive mark.
  open: reactive(z.boolean().optional().describe("A bare boolean $variable (declared false) that a Button opens with @Set($open, true), or true/false for the initial state. Skip with null to start closed")),
  description: z.string().optional().describe("Supporting text under the title"),
  closeOnBackdrop: z.boolean().optional().describe("Clicking outside the dialog closes it. Default true"),
  closeOnEscape: z.boolean().optional().describe("Escape closes it. Default true"),
  showCloseButton: z.boolean().optional().describe("Show the corner close button. Default true"),
});

export const dialogDefinition = defineComponent({
  name: "Dialog",
  description: "A modal pop-up that needs the user's attention: Dialog(title, content, trigger, open, description, closeOnBackdrop, closeOnEscape, showCloseButton), e.g. Dialog(\"Project settings\", form, Button(\"Settings\", false, \"outline\"), false, \"Changes apply to everyone.\"). Content is ONE component defined elsewhere (wrap several in a Stack) and keeps its state while closed. Either give a trigger (a Button that opens it), or declare $open = false, pass it as open and add Button(\"Open\", false, \"primary\", \"default\", false, false, null, null, @Set($open, true)); put a Button with @Set($open, false) inside the content to close it from within. A trigger Button needs no action. The page behind is inert while it is open. It is a container: confirm and cancel buttons are yours. Use Drawer for an edge panel, Popover for small contextual content next to its trigger, Alert for an inline message.",
  props: dialogProps,
  component: ({props, renderNode}) => {
    // The name only keys the SDK's non-reactive fallback field. It is unique per instance so dialogs never share state through it,
    // and setValue is never called unless the binding is reactive.
    const field = useStateField(useId(), props.open);
    const {description, closeOnBackdrop, closeOnEscape, showCloseButton} = Object.fromEntries(Object.entries(props).filter(([, v]) => v != null)) as Partial<typeof props>;
    return (
      <Dialog
        title={props.title}
        trigger={props.trigger == null ? undefined : renderNode(props.trigger)}
        {...(field.isReactive ? {open: field.value === true} : {defaultOpen: field.value === true})}
        onOpenChange={next => { if (field.isReactive) field.setValue(next); }}
        description={description}
        closeOnBackdrop={closeOnBackdrop}
        closeOnEscape={closeOnEscape}
        showCloseButton={showCloseButton}
      >
        {renderNode(props.content)}
      </Dialog>
    );
  },
});

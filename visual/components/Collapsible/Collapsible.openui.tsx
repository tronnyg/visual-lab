import {useId} from "react";
import {defineComponent, reactive, useStateField} from "@openuidev/react-lang";
import {z} from "zod/v4";
import {Collapsible, collapsibleVariants} from "./Collapsible";
import {panelContentSchema} from "../../shared/contentRefs";

// Positional order matters in OpenUI Lang: title, content, open, disabled, variant.
// `content` is a typed reference to one registered component (see shared/contentRefs.ts). The getter defers those references so
// Collapsible and the components it can contain may import each other.
// `open` is reactive(): a bare `$variable` stays a two-way binding; true/false only picks the initial state.
const collapsibleProps = z.object({
  title: z.string().describe("Text on the toggle button"),
  get content(): z.ZodType {
    return panelContentSchema().describe("The one component shown when open. Wrap several components in a Stack");
  },
  // describe() goes inside reactive(): on the outer schema it would clone it and drop the reactive mark.
  open: reactive(z.boolean().optional().describe("A bare boolean $variable (two-way, readable elsewhere) or true/false for the initial state. Skip with null to start closed")),
  disabled: z.boolean().optional().describe("The toggle cannot be used. Default false"),
  variant: z.enum(collapsibleVariants).optional().describe("plain (default) or bordered (boxed surface)"),
});

export const collapsibleDefinition = defineComponent({
  name: "Collapsible",
  description: "One optional detail region that a labeled button shows or hides: Collapsible(title, content, open, disabled, variant), e.g. Collapsible(\"Advanced options\", options, false, null, \"bordered\"). Content is ONE component defined elsewhere (wrap several in a Stack); it keeps its state while hidden. Pass a bare boolean $variable (declared with true or false) as open to read or set the state elsewhere, e.g. Text($open ? \"Shown\" : \"Hidden\"). Use Accordion for several related sections and Tabs for exclusive views.",
  props: collapsibleProps,
  component: ({props, renderNode}) => {
    // The name only keys the SDK's non-reactive fallback field. It is unique per instance so Collapsibles never share state through it,
    // and setValue is never called unless the binding is reactive.
    const field = useStateField(useId(), props.open);
    const {disabled, variant} = Object.fromEntries(Object.entries(props).filter(([, v]) => v != null)) as Partial<typeof props>;
    return (
      <Collapsible
        title={props.title}
        {...(field.isReactive ? {open: field.value === true} : {defaultOpen: field.value === true})}
        onOpenChange={next => { if (field.isReactive) field.setValue(next); }}
        disabled={disabled}
        variant={variant}
      >
        {renderNode(props.content)}
      </Collapsible>
    );
  },
});

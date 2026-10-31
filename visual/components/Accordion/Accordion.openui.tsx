import type {ReactNode} from "react";
import {defineComponent} from "@openuidev/react-lang";
import {z} from "zod/v4";
import {Accordion, type AccordionItem} from "./Accordion";
import {panelContentSchema} from "../../shared/contentRefs";

// Positional order matters in OpenUI Lang: items, type, open, collapsible.
// Each section's content is a typed reference to a registered component (see shared/contentRefs.ts). The getter defers those references
// so Accordion and the components it can contain may import each other.
// Open state is local: the OpenUI API sets which sections start open but does not bind it to a $variable (a multiple-open list is not a
// scalar the reactive mechanism handles cleanly, and nothing else needs to read it).
const accordionTypes = ["single", "multiple"] as const;

const accordionProps = z.object({
  get items(): z.ZodArray<z.ZodType> {
    return z.array(z.object({
      id: z.string().describe("Unique id for the section, e.g. \"billing\""),
      title: z.string().describe("Text on the section's header button"),
      content: panelContentSchema().describe("The one component shown when the section is open. Wrap several components in a Stack"),
      disabled: z.boolean().optional().describe("The section cannot be toggled. Default false"),
    })).describe("The sections in order: {id, title, content} objects, e.g. [{id: \"a\", title: \"Shipping\", content: shipping}]");
  },
  type: z.enum(accordionTypes).optional().describe("single (opening one closes the others) or multiple (any number open). Default single"),
  open: z.array(z.string()).optional().describe("Ids of the sections that start open, e.g. [\"a\"]. In single mode only the first is used. Default none"),
  collapsible: z.boolean().optional().describe("single mode only: whether the open section can be closed by clicking it. Default true"),
});

type RawItem = {id?: unknown; title?: unknown; content?: unknown; disabled?: unknown};

// Skipped entries (null, or still streaming) are dropped. A repeated id gets a numeric suffix so every section keeps a distinct id.
function toItems(input: unknown, renderNode: (node: never) => ReactNode): AccordionItem[] {
  if (!Array.isArray(input)) return [];
  const seen = new Set<string>();
  return (input as (RawItem | null | undefined)[]).flatMap((raw): AccordionItem[] => {
    if (!raw || typeof raw.id !== "string" || typeof raw.title !== "string") return [];
    let id = raw.id;
    for (let n = 2; seen.has(id); n++) id = `${raw.id}-${n}`;
    seen.add(id);
    return [{id, title: raw.title, content: renderNode(raw.content as never), disabled: raw.disabled === true}];
  });
}

export const accordionDefinition = defineComponent({
  name: "Accordion",
  description: "Grouped expandable sections with a header each, such as an FAQ or settings groups: Accordion(items, type, open, collapsible), e.g. Accordion([{id: \"ship\", title: \"Shipping\", content: shipText}, {id: \"ret\", title: \"Returns\", content: retText}], \"single\", [\"ship\"]). Each content is ONE component defined elsewhere (wrap several in a Stack); closed sections keep their state. Give each section a unique id. type single opens one at a time, multiple lets several stay open. Use Tabs for mutually exclusive views and Collapsible for a single optional region.",
  props: accordionProps,
  component: ({props, renderNode}) => {
    // Skipped optional arguments (null, or an unresolved expression) must not reach the component, where defaults only apply to undefined.
    const {type, open, collapsible} = Object.fromEntries(Object.entries(props).filter(([, v]) => v != null)) as Partial<typeof props>;
    const items = toItems(props.items, renderNode as (node: never) => ReactNode);
    const initial = (open ?? []).filter((id): id is string => typeof id === "string");
    // The mode decides the shape of the initial state, so a changed mode remounts the Accordion rather than reusing stale state.
    return type === "multiple"
      ? <Accordion key="multiple" type="multiple" items={items} defaultValue={initial} />
      : <Accordion key="single" items={items} defaultValue={initial[0] ?? null} collapsible={collapsible} />;
  },
});

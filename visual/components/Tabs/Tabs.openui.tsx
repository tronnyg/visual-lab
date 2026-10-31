import {useId, type ReactNode} from "react";
import {defineComponent, reactive, useStateField} from "@openuidev/react-lang";
import {z} from "zod/v4";
import {Tabs, tabsOrientations, tabsVariants, type TabItem} from "./Tabs";
import {panelContentSchema} from "../../shared/contentRefs";

// Positional order matters in OpenUI Lang: items, value, variant, orientation.
// Each tab's content is a typed reference to a registered component (see shared/contentRefs.ts), so panels hold real components.
// The getter defers those references so Tabs and the components it can contain may import each other.
// `value` is reactive(): a bare `$variable` stays a two-way binding; a string literal only picks the initial tab.
const tabsProps = z.object({
  get items(): z.ZodArray<z.ZodType> {
    return z.array(z.object({
      id: z.string().describe("Unique id for the tab, e.g. \"overview\""),
      label: z.string().describe("Text on the tab"),
      content: panelContentSchema().describe("The one component shown in this tab's panel. Wrap several components in a Stack"),
      disabled: z.boolean().optional().describe("The tab cannot be selected. Default false"),
    })).describe("The tabs in order: {id, label, content} objects, e.g. [{id: \"a\", label: \"Overview\", content: overview}]");
  },
  // describe() goes inside reactive(): on the outer schema it would clone it and drop the reactive mark.
  value: reactive(z.string().optional().describe("Selected tab id: a bare $variable (two-way, readable elsewhere) or a string for the initial tab. Skip with null to start on the first enabled tab")),
  variant: z.enum(tabsVariants).optional().describe("line (underline) or contained (pill track). Default line"),
  orientation: z.enum(tabsOrientations).optional().describe("horizontal or vertical (tabs beside the panel). Default horizontal"),
});

type RawItem = {id?: unknown; label?: unknown; content?: unknown; disabled?: unknown};

// Skipped entries (null, or still streaming) are dropped. A repeated id gets a numeric suffix so every tab keeps a distinct id.
function toItems(input: unknown, renderNode: (node: never) => ReactNode): TabItem[] {
  if (!Array.isArray(input)) return [];
  const seen = new Set<string>();
  return (input as (RawItem | null | undefined)[]).flatMap((raw): TabItem[] => {
    if (!raw || typeof raw.id !== "string" || typeof raw.label !== "string") return [];
    let id = raw.id;
    for (let n = 2; seen.has(id); n++) id = `${raw.id}-${n}`;
    seen.add(id);
    return [{id, label: raw.label, content: renderNode(raw.content as never), disabled: raw.disabled === true}];
  });
}

export const tabsDefinition = defineComponent({
  name: "Tabs",
  description: "Mutually exclusive views of related content, one visible at a time: Tabs(items, value, variant, orientation), e.g. Tabs([{id: \"overview\", label: \"Overview\", content: overviewText}, {id: \"data\", label: \"Data\", content: table}]). Each content is ONE component defined elsewhere (wrap several in a Stack); panels keep their state when hidden. Give each tab a unique id. Pass a $variable as value (declared with a tab id) to read or set the selected tab elsewhere, e.g. Text(\"Viewing: \" + $tab). Use Accordion for stacked expandable sections.",
  props: tabsProps,
  component: ({props, renderNode}) => {
    // The name only keys the SDK's non-reactive fallback field. It is unique per instance so Tabs never share state through it,
    // and setValue is never called unless the binding is reactive.
    const field = useStateField(useId(), props.value);
    const {variant, orientation} = Object.fromEntries(Object.entries(props).filter(([, v]) => v != null)) as Partial<typeof props>;
    const current = typeof field.value === "string" ? field.value : undefined;
    return (
      <Tabs
        items={toItems(props.items, renderNode as (node: never) => ReactNode)}
        {...(field.isReactive ? {value: current ?? ""} : {defaultValue: current})}
        onValueChange={next => { if (field.isReactive) field.setValue(next); }}
        variant={variant}
        orientation={orientation}
      />
    );
  },
});

import {defineComponent} from "@openuidev/react-lang";
import {z} from "zod/v4";
import {KeyValue, keyValueLayouts, type KeyValueItem} from "./KeyValue";

// Positional order matters in OpenUI Lang: items, then layout, dividers and emptyMessage.
// Values are text or numbers only: rich values (components, links) are a React-only capability.
const itemSchema = z.object({
  label: z.string().describe("The name of the fact, e.g. \"Status\""),
  value: z.union([z.string(), z.number()]).optional().describe("The fact: text or a number. Skip with null for no value"),
});

const keyValueProps = z.object({
  items: z.array(itemSchema).describe("Label/value pairs in order: {label: \"Status\", value: \"Active\"}"),
  layout: z.enum(keyValueLayouts).optional().describe("inline (label beside value; stacks in a narrow space) or stacked (label above value). Default inline"),
  dividers: z.boolean().optional().describe("Draw a line between pairs. Default false"),
  emptyMessage: z.string().optional().describe("Text shown when items is empty. Default \"No details\""),
});

export const keyValueDefinition = defineComponent({
  name: "KeyValue",
  description: "Label/value pairs for facts, metadata and property summaries: KeyValue(items, layout, dividers, emptyMessage), e.g. KeyValue([{label: \"Status\", value: \"Active\"}, {label: \"Owner\", value: \"Alex\"}]). Values are text or numbers. Use it for one set of facts about one thing; use Table for many records with the same columns, and Text for a single sentence.",
  props: keyValueProps,
  component: ({props}) => {
    const items: KeyValueItem[] = (props.items ?? []).filter(i => i != null).map(i => ({label: String(i.label ?? ""), value: i.value}));
    // Skipped optional arguments (null, or an unresolved expression) must not reach the component, where defaults only apply to undefined.
    const {layout, dividers, emptyMessage} = Object.fromEntries(Object.entries(props).filter(([, v]) => v != null)) as Partial<typeof props>;
    return <KeyValue items={items} layout={layout} dividers={dividers} emptyMessage={emptyMessage} />;
  },
});

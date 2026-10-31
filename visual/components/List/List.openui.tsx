import {defineComponent} from "@openuidev/react-lang";
import {z} from "zod/v4";
import {List, listDensities, listVariants, type ListItem} from "./List";

// Positional order matters in OpenUI Lang: items, then variant, start and density.
// An item is a plain string, or {content, items} when it has a nested list of strings. The schema is deliberately not recursive:
// the SDK cannot describe a self-referencing object schema in the prompt (it recurses forever), so OpenUI allows one nested level
// while the React List nests to any depth. Items are text only: rich item content is a React-only capability.
const itemSchema = z.union([
  z.string(),
  z.object({
    content: z.string().describe("The item text"),
    items: z.array(z.string()).optional().describe("A nested list of strings under this item"),
  }),
]);

const listProps = z.object({
  items: z.array(itemSchema).describe("The entries in order: strings like [\"One\", \"Two\"], or {content: \"One\", items: [\"Nested\"]} for an item with a nested list"),
  variant: z.enum(listVariants).optional().describe("unordered (bullets) or ordered (numbers). Default unordered"),
  start: z.number().optional().describe("First number of an ordered list. Default 1"),
  density: z.enum(listDensities).optional().describe("default or compact (tighter spacing). Default default"),
});

type ItemInput = string | {content: string; items?: string[]};

// Skipped entries (null, or an unresolved expression) are dropped rather than rendered as empty bullets.
function toItems(input: unknown): ListItem[] {
  if (!Array.isArray(input)) return [];
  return (input as (ItemInput | null | undefined)[]).flatMap((entry): ListItem[] => {
    if (typeof entry === "string") return [{content: entry}];
    if (entry && typeof entry === "object" && typeof entry.content === "string") return [{content: entry.content, items: toItems(entry.items)}];
    return [];
  });
}

export const listDefinition = defineComponent({
  name: "List",
  description: "A bulleted or numbered list of short text items: List(items, variant, start, density), e.g. List([\"Prepare materials\", \"Review results\"], \"ordered\"). An item with a nested list is an object {content: \"Phase 1\", items: [\"Task\", \"Task\"]}, one nested level only. Use ordered for steps in a sequence and unordered for unranked points. Items are plain text: use Markdown for links, bold text or other rich content, and Table for rows of data.",
  props: listProps,
  component: ({props}) => {
    // Skipped optional arguments (null, or an unresolved expression) must not reach the component, where defaults only apply to undefined.
    const {variant, start, density} = Object.fromEntries(Object.entries(props).filter(([, v]) => v != null)) as Partial<typeof props>;
    return <List items={toItems(props.items)} variant={variant} start={start} density={density} />;
  },
});

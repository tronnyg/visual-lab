import {defineComponent} from "@openuidev/react-lang";
import {z} from "zod/v4";
import {Markdown} from "./Markdown";

// `source` is not wrapped in reactive(): that is for two-way input bindings. Expressions such as "Count: " + $count are
// evaluated by the renderer before they reach the component, exactly as for Text.value.
const markdownProps = z.object({
  source: z.string().describe("Markdown text: headings, **bold**, lists, tables, `code`, fenced code blocks, blockquotes, links and ![alt](https://...) images. Raw HTML is ignored. May be an expression, e.g. \"Total: \" + $count"),
});

export const markdownDefinition = defineComponent({
  name: "Markdown",
  description: "Rich formatted content from a Markdown string: explanations, documents, lists, tables, code blocks, quotes, links and images. Use Markdown for multi-paragraph or structured content; use Text for single labels, headings, short values and reactive text; use Stack and Card for layout and grouping. Typography and spacing are automatic.",
  props: markdownProps,
  component: ({props}) => <Markdown source={String(props.source ?? "")} />,
});

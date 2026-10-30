import {defineComponent} from "@openuidev/react-lang";
import {z} from "zod/v4";
import {Text, textAligns, textLineHeights, textPresets, textSizes, textTones, textWeights, textWraps, type TextElement} from "./Text";

// `label` is left out: without a form control to point at (no htmlFor) it carries no meaning.
const openuiElements = ["h1", "h2", "h3", "h4", "h5", "h6", "p", "span", "strong", "em"] as const satisfies readonly TextElement[];

// Positional order matters in OpenUI Lang. value, tone and preset keep the positions of the original Text(value, tone, size),
// whose size values (body, title, heading) are now presets, so existing boards keep working.
// `value` is not wrapped in reactive(): that is for two-way input bindings. Expressions such as "Count: " + $count are
// evaluated by the renderer before they reach the component, and the text updates when the variable changes.
const textProps = z.object({
  value: z.union([z.string(), z.number()]).describe("The text. May be an expression, e.g. \"Count: \" + $count"),
  tone: z.enum(textTones).optional().describe("Colour. Default default"),
  preset: z.enum(textPresets).optional().describe("Visual style: title and heading for headings, body for paragraphs, subheading, label, caption, overline (uppercase), code (monospace). Default body"),
  as: z.enum(openuiElements).optional().describe("HTML element. Does not change appearance, so pair a heading element with a preset. Default p"),
  size: z.enum(textSizes).optional().describe("Overrides the preset's font size"),
  weight: z.enum(textWeights).optional().describe("Overrides the preset's font weight"),
  align: z.enum(textAligns).optional().describe("Text alignment"),
  italic: z.boolean().optional().describe("Default false"),
  underline: z.boolean().optional().describe("Default false"),
  strikethrough: z.boolean().optional().describe("Default false"),
  highlight: z.boolean().optional().describe("Marker-style background. Default false"),
  lineHeight: z.enum(textLineHeights).optional().describe("Overrides the preset's line height"),
  wrap: z.enum(textWraps).optional().describe("nowrap never wraps; balance evens out headline lines. Default wrap"),
  preserveWhitespace: z.boolean().optional().describe("Keep line breaks and spaces in the text. Default false"),
  truncate: z.boolean().optional().describe("One line with an ellipsis on overflow. Default false"),
  lineClamp: z.union([z.literal(1), z.literal(2), z.literal(3), z.literal(4), z.literal(5), z.literal(6)]).optional().describe("Limit to this many lines (1-6) with an ellipsis"),
});

export const textDefinition = defineComponent({
  name: "Text",
  description: "A piece of text: headings, paragraphs, labels and captions. Plain text only; use the value expression for dynamic text.",
  props: textProps,
  component: ({props}) => {
    // Skipped optional arguments (null, or an unresolved expression) must not reach the component, where defaults only apply to undefined.
    const {value, ...rest} = Object.fromEntries(Object.entries(props).filter(([, v]) => v != null)) as typeof props;
    return <Text {...rest}>{value}</Text>;
  },
});

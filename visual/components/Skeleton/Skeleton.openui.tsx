import {defineComponent} from "@openuidev/react-lang";
import {z} from "zod/v4";
import {Skeleton, skeletonVariants} from "./Skeleton";

// Positional order matters in OpenUI Lang: variant, width, height, lines, animated. Presentational: no state, no children, no actions.
// width/height are a number (pixels) or a CSS length string such as "60%". Anything else is dropped so a bad value cannot reach the style attribute.
const length = z.union([z.number(), z.string()]);
const skeletonProps = z.object({
  variant: z.enum(skeletonVariants).optional().describe("text (default), rectangle or circle"),
  width: length.optional().describe("Pixels as a number, or a CSS length like \"60%\" or \"12rem\". Default full width (40 for a circle)"),
  height: length.optional().describe("Same units as width. For text it is the height of each line. Default 14 for text, 96 for a rectangle, the width for a circle"),
  lines: z.number().optional().describe("Number of text lines, 1 to 20 (text only). The last line is shorter. Default 1"),
  animated: z.boolean().optional().describe("A subtle pulse, off for users who prefer reduced motion. Default true"),
});

const safeLength = (value: unknown): string | number | undefined => {
  if (typeof value === "number" && Number.isFinite(value) && value >= 0) return value;
  return typeof value === "string" && /^\d*\.?\d+(px|%|rem|em|vw|vh|ch)?$/.test(value.trim()) ? value.trim() : undefined;
};

export const skeletonDefinition = defineComponent({
  name: "Skeleton",
  description: "A decorative loading placeholder shaped like the content that is coming: Skeleton(variant, width, height, lines, animated), e.g. Skeleton(\"text\", null, null, 3) for a paragraph, Skeleton(\"circle\", 48) for an avatar, Skeleton(\"rectangle\", \"100%\", 160) for an image. Compose several in a Stack, Grid or Card to sketch a layout. It shows no text and is hidden from screen readers, so also say that content is loading in a visible Text near it. It tracks no state and does not switch to the real content by itself: show the Skeleton or the content with the data you have. Use Spinner for an indeterminate wait without a known layout and Progress when the amount done is known.",
  props: skeletonProps,
  component: ({props}) => {
    const {variant, animated, lines} = Object.fromEntries(Object.entries(props).filter(([, v]) => v != null)) as Partial<typeof props>;
    return <Skeleton variant={variant} width={safeLength(props.width)} height={safeLength(props.height)} lines={lines} animated={animated} />;
  },
});

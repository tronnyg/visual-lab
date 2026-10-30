import {defineComponent} from "@openuidev/react-lang";
import {z} from "zod/v4";
import {Divider, dividerOrientations, dividerSpacings, dividerTones} from "./Divider";

// Positional order matters in OpenUI Lang. All arguments are optional; skip one you do not need with null.
const dividerProps = z.object({
  orientation: z.enum(dividerOrientations).optional().describe("horizontal (a line across the available width) or vertical (a line between items in a horizontal Stack). Default horizontal"),
  tone: z.enum(dividerTones).optional().describe("Line strength: subtle, default, strong. Default subtle"),
  spacing: z.enum(dividerSpacings).optional().describe("Margin around the line, not its thickness: none, xs, sm, md, lg. Default sm"),
  decorative: z.boolean().optional().describe("true hides the divider from assistive technology; false exposes it as a separator. Default true"),
});

export const dividerDefinition = defineComponent({
  name: "Divider",
  description: "A thin line that separates sections of content, horizontal by default or vertical between items in a horizontal Stack. Use Divider only to separate; use Stack gap for plain spacing, Card for visual grouping and Text for headings.",
  props: dividerProps,
  component: ({props}) => {
    // Skipped optional arguments (null, or an unresolved expression) must not reach the component, where defaults only apply to undefined.
    const clean = Object.fromEntries(Object.entries(props).filter(([, v]) => v != null)) as typeof props;
    return <Divider {...clean} />;
  },
});

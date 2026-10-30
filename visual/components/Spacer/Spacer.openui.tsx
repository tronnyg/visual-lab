import {defineComponent} from "@openuidev/react-lang";
import {z} from "zod/v4";
import {Spacer, spacerSizes} from "./Spacer";

// Positional order matters in OpenUI Lang. The single argument is optional; skip it with null.
const spacerProps = z.object({
  size: z.enum(spacerSizes).optional().describe("Fixed space along the parent's direction: xs, sm, md, lg, xl; or grow to fill the remaining room (in a horizontal Stack with width full). Default md"),
});

export const spacerDefinition = defineComponent({
  name: "Spacer",
  description: "Intentional empty space inside a Stack or Card. Use Spacer only for flexible separation between selected siblings (size grow, e.g. a title on the left and actions on the right of a full-width horizontal Stack) or for intentional extra spacing at one point (a fixed size). Spacer adds to the parent's gap. Do NOT use it for ordinary spacing: use Stack gap for that, and Stack justify to distribute a whole row or column.",
  props: spacerProps,
  component: ({props}) => {
    // Skipped optional arguments (null, or an unresolved expression) must not reach the component, where defaults only apply to undefined.
    const clean = Object.fromEntries(Object.entries(props).filter(([, v]) => v != null)) as typeof props;
    return <Spacer {...clean} />;
  },
});

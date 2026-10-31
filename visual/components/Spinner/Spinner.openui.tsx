import {defineComponent} from "@openuidev/react-lang";
import {z} from "zod/v4";
import {Spinner, spinnerSizes} from "./Spinner";

// Positional order matters in OpenUI Lang. Both arguments are optional; skip size with null to give only a label.
const spinnerProps = z.object({
  size: z.enum(spinnerSizes).optional().describe("sm 16px, md 24px, lg 32px. Default md"),
  label: z.string().optional().describe("Accessible loading message, not displayed, e.g. \"Loading results\". Set it when the spinner is the only sign of loading; leave it out when visible text beside it already says so"),
});

export const spinnerDefinition = defineComponent({
  name: "Spinner",
  description: "A small animated loading indicator for waiting of unknown length, e.g. Spinner(\"md\", \"Loading results\"). It is purely presentational: it spins forever and does not track or end any loading state, so only show it when the content really is loading. Use Progress when the amount done is known. Arguments are size, then label.",
  props: spinnerProps,
  component: ({props}) => {
    // Skipped optional arguments (null, or an unresolved expression) must not reach the component, where defaults only apply to undefined.
    const clean = Object.fromEntries(Object.entries(props).filter(([, v]) => v != null)) as typeof props;
    return <Spinner {...clean} />;
  },
});

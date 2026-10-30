import {defineComponent} from "@openuidev/react-lang";
import {z} from "zod/v4";
import {Icon, iconNames, iconSizes, iconTones} from "./Icon";

// Positional order matters in OpenUI Lang: name first (required), then the optional arguments.
// name is a closed allowlist, so arbitrary SVG, HTML or icon URLs cannot be requested.
const iconProps = z.object({
  name: z.enum(iconNames).describe(`Icon to draw: ${iconNames.join(", ")}`),
  size: z.enum(iconSizes).optional().describe("xs 12px, sm 14px, md 16px, lg 20px, xl 24px. Default md"),
  tone: z.enum(iconTones).optional().describe("Colour: default, muted, accent, success, warning, danger. Default inherits the surrounding text colour"),
  label: z.string().optional().describe("Accessible name. Set it only when the icon conveys meaning by itself with no nearby text; without it the icon is decorative and hidden from assistive technology"),
});

export const iconDefinition = defineComponent({
  name: "Icon",
  description: "A standalone interface icon from a fixed set of common navigation, action, status and content icons, with size and semantic tone presets. Use Icon beside Text or inside Stack and Card for status, emphasis and wayfinding; Button has its own leadingIcon and trailingIcon for icons inside buttons; use Image for pictures.",
  props: iconProps,
  component: ({props}) => {
    // Skipped optional arguments (null, or an unresolved expression) must not reach the component, where defaults only apply to undefined.
    const {name, ...rest} = Object.fromEntries(Object.entries(props).filter(([, v]) => v != null)) as typeof props;
    return <Icon {...rest} name={name} />;
  },
});

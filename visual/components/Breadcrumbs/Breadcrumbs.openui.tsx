import {defineComponent} from "@openuidev/react-lang";
import {z} from "zod/v4";
import {Breadcrumbs, type BreadcrumbItem} from "./Breadcrumbs";
import {isBoardHref, isExternalHref} from "../../shared/links";

// Positional order matters in OpenUI Lang: items, separator.
// Crumbs are literal links, rendered as ordinary anchors. There is no navigation action: the SDK's @OpenUrl only reports an event to
// the host (the board records it and does not navigate), so a crumb that should go somewhere needs a real href.
const breadcrumbsProps = z.object({
  items: z.array(z.object({
    label: z.string().describe("Text of the crumb"),
    href: z.string().optional().describe("Link: a full https:// URL, mailto:, tel: or a #anchor. Skip for a crumb that is not a link, such as the current page"),
    current: z.boolean().optional().describe("Marks the current page. Default: the last crumb is current"),
  })).describe("The path from the top of the hierarchy to the current page, in order: {label, href} objects, e.g. [{label: \"Docs\", href: \"https://example.com/docs\"}, {label: \"Install\"}]"),
  separator: z.string().optional().describe("Text between crumbs. Default /"),
});

type RawItem = {label?: unknown; href?: unknown; current?: unknown};

// Skipped entries (null, or still streaming) are dropped. A link the board cannot follow safely (relative path, javascript:, ...) becomes plain text.
function toItems(input: unknown): BreadcrumbItem[] {
  if (!Array.isArray(input)) return [];
  return (input as (RawItem | null | undefined)[]).flatMap((raw): BreadcrumbItem[] => {
    if (!raw || typeof raw.label !== "string") return [];
    const href = typeof raw.href === "string" && isBoardHref(raw.href) ? raw.href : undefined;
    return [{label: raw.label, href, current: raw.current === true, external: href !== undefined && isExternalHref(href)}];
  });
}

export const breadcrumbsDefinition = defineComponent({
  name: "Breadcrumbs",
  description: "The hierarchical path to the current page, as links: Breadcrumbs(items, separator), e.g. Breadcrumbs([{label: \"Home\", href: \"https://example.com\"}, {label: \"Docs\", href: \"https://example.com/docs\"}, {label: \"Install\"}]). The last crumb is the current page and normally has no href. Links must be full https:// URLs, mailto:, tel: or #anchors; web links open in a new tab. Use NavigationMenu for a set of destinations and Tabs for views on one page.",
  props: breadcrumbsProps,
  component: ({props}) => {
    // Skipped optional arguments (null, or an unresolved expression) must not reach the component, where defaults only apply to undefined.
    const {separator} = Object.fromEntries(Object.entries(props).filter(([, v]) => v != null)) as Partial<typeof props>;
    return <Breadcrumbs items={toItems(props.items)} separator={separator} />;
  },
});

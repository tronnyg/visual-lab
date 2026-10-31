import {defineComponent} from "@openuidev/react-lang";
import {z} from "zod/v4";
import {NavigationMenu, navigationOrientations, type NavigationItem} from "./NavigationMenu";
import {isBoardHref, isExternalHref} from "../../shared/links";

// Positional order matters in OpenUI Lang: items, activeId, orientation, label.
// Destinations are literal links, rendered as ordinary anchors. There is no navigation action: the SDK's @OpenUrl only reports an event
// to the host (the board records it and does not navigate), so a destination that should go somewhere needs a real href.
// activeId is plain metadata: the page that is current is decided by the program, not by clicking.
const navigationMenuProps = z.object({
  items: z.array(z.object({
    id: z.string().describe("Unique id for the destination, e.g. \"docs\""),
    label: z.string().describe("Text of the link"),
    href: z.string().optional().describe("Link: a full https:// URL, mailto:, tel: or a #anchor. Without one the item is plain text"),
    disabled: z.boolean().optional().describe("Shown dimmed and not followable. Default false"),
  })).describe("The destinations in order: {id, label, href} objects, e.g. [{id: \"home\", label: \"Home\", href: \"https://example.com\"}]"),
  activeId: z.string().optional().describe("The id of the destination for the current page. Skip with null for none"),
  orientation: z.enum(navigationOrientations).optional().describe("horizontal (a row) or vertical (a column). Default horizontal"),
  label: z.string().optional().describe("Accessible name of the menu, e.g. \"Main\" or \"Settings\". Give each menu on a board a different one. Default Navigation"),
});

type RawItem = {id?: unknown; label?: unknown; href?: unknown; disabled?: unknown};

// Skipped entries (null, or still streaming) are dropped. A link the board cannot follow safely (relative path, javascript:, ...) becomes plain text.
function toItems(input: unknown): NavigationItem[] {
  if (!Array.isArray(input)) return [];
  return (input as (RawItem | null | undefined)[]).flatMap((raw): NavigationItem[] => {
    if (!raw || typeof raw.id !== "string" || typeof raw.label !== "string") return [];
    const href = typeof raw.href === "string" && isBoardHref(raw.href) ? raw.href : undefined;
    return [{id: raw.id, label: raw.label, href, disabled: raw.disabled === true, external: href !== undefined && isExternalHref(href)}];
  });
}

export const navigationMenuDefinition = defineComponent({
  name: "NavigationMenu",
  description: "A set of destinations to move between, as links: NavigationMenu(items, activeId, orientation, label), e.g. NavigationMenu([{id: \"home\", label: \"Home\", href: \"https://example.com\"}, {id: \"docs\", label: \"Docs\", href: \"https://example.com/docs\"}], \"home\", \"horizontal\", \"Main\"). activeId marks the destination for the current page. Links must be full https:// URLs, mailto:, tel: or #anchors; web links open in a new tab. Flat list only: no dropdowns or submenus (use several menus under Text headings for sections). Use Breadcrumbs for the path to the current page and Tabs for views on one page.",
  props: navigationMenuProps,
  component: ({props}) => {
    // Skipped optional arguments (null, or an unresolved expression) must not reach the component, where defaults only apply to undefined.
    const {activeId, orientation, label} = Object.fromEntries(Object.entries(props).filter(([, v]) => v != null)) as Partial<typeof props>;
    return <NavigationMenu items={toItems(props.items)} activeId={activeId} orientation={orientation} aria-label={label?.trim() ? label : undefined} />;
  },
});

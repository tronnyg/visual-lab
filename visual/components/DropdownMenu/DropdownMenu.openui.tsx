import {action, defineComponent, useFormName, useIsStreaming, useTriggerAction} from "@openuidev/react-lang";
import {z} from "zod/v4";
import {DropdownMenu, dropdownMenuAligns, dropdownMenuPlacements} from "./DropdownMenu";
import type {DropdownMenuItem} from "./DropdownMenu";
import {panelContentSchema} from "../../shared/contentRefs";
import {isBoardHref} from "../../shared/links";

// Positional order matters in OpenUI Lang: items, trigger, placement, align.
// Choosing an item runs the action written on it, using only the SDK's existing action steps (@Set, @Reset, @ToAssistant, @OpenUrl, ...)
// through useTriggerAction, exactly as CommandPalette and Button do; an item with an `href` is a real link. There is no menu language of
// its own: an item with neither an action nor a link is shown disabled rather than looking interactive and doing nothing.
// `trigger` is a typed reference to one registered component (see shared/contentRefs.ts), deferred by a getter.
const dropdownMenuProps = z.object({
  items: z.array(z.object({
    id: z.string().describe("Unique id for the item, e.g. \"rename\""),
    label: z.string().describe("The item's text"),
    disabled: z.boolean().optional().describe("Shown dimmed and cannot be chosen. Default false"),
    separatorBefore: z.boolean().optional().describe("Draw a separator line above this item. Default false"),
    group: z.string().optional().describe("Heading for a run of consecutive items with the same group, e.g. \"Danger zone\""),
    action: action().optional().describe("What happens when it is chosen, e.g. @Set($status, \"archived\") or @ToAssistant(\"Summarize the board\")"),
    href: z.string().optional().describe("A link to go to when chosen: a full https:// URL (opens in a new tab), mailto:, tel: or #anchor. Used when there is no action"),
  })).describe("The items in order: {id, label, action} objects, e.g. [{id: \"rename\", label: \"Rename\", action: @Set($mode, \"rename\")}, {id: \"delete\", label: \"Delete\", separatorBefore: true, action: @ToAssistant(\"Delete this\")}]"),
  get trigger(): z.ZodType {
    return panelContentSchema().describe("The control that opens the menu, normally a Button (it needs no action)");
  },
  placement: z.enum(dropdownMenuPlacements).optional().describe("Preferred side of the trigger: top, bottom (default), left, right. It flips if there is no room"),
  align: z.enum(dropdownMenuAligns).optional().describe("Alignment along that side: start (default), center, end"),
});

type RawItem = {id?: unknown; label?: unknown; disabled?: unknown; separatorBefore?: unknown; group?: unknown; action?: unknown; href?: unknown};
type ActionPlan = {steps: unknown[]};

interface Resolved {
  item: DropdownMenuItem;
  plan?: ActionPlan;
}

// Skipped entries (null, or still streaming) are dropped. A repeated id gets a numeric suffix so every item keeps a distinct id.
function resolve(input: unknown): Resolved[] {
  if (!Array.isArray(input)) return [];
  const seen = new Set<string>();
  return (input as (RawItem | null | undefined)[]).flatMap((raw): Resolved[] => {
    if (!raw || typeof raw.id !== "string" || typeof raw.label !== "string") return [];
    let id = raw.id;
    for (let n = 2; seen.has(id); n++) id = `${raw.id}-${n}`;
    seen.add(id);
    // The object check skips legacy string values, which triggerAction cannot handle. A plan with no steps would only send the label to the assistant.
    const plan = typeof raw.action === "object" && raw.action && Array.isArray((raw.action as ActionPlan).steps) && (raw.action as ActionPlan).steps.length ? raw.action as ActionPlan : undefined;
    const href = !plan && typeof raw.href === "string" && isBoardHref(raw.href) ? raw.href : undefined;
    return [{
      item: {
        id,
        label: raw.label,
        // Nothing to run and nowhere to go: show it, but do not let it look chosen.
        disabled: raw.disabled === true || (!plan && !href),
        separatorBefore: raw.separatorBefore === true,
        group: typeof raw.group === "string" ? raw.group : undefined,
        href,
      },
      plan,
    }];
  });
}

export const dropdownMenuDefinition = defineComponent({
  name: "DropdownMenu",
  description: "A menu of actions that opens from a button: DropdownMenu(items, trigger, placement, align), e.g. DropdownMenu([{id: \"rename\", label: \"Rename\", action: @Set($mode, \"rename\")}, {id: \"docs\", label: \"Help\", href: \"https://example.com/help\"}, {id: \"delete\", label: \"Delete\", separatorBefore: true, action: @ToAssistant(\"Delete this project\")}], Button(\"Actions\", false, \"outline\")). Each item is {id, label, disabled, separatorBefore, group, action, href}; choosing one runs its action (the same @-steps as Button: @Set, @Reset, @ToAssistant, @OpenUrl) or follows its href, then closes the menu. The trigger is ONE component defined elsewhere, normally a Button, and needs no action. @OpenUrl only reports the link to the host and does not navigate on the board, so give an item href (a full https:// URL, mailto:, tel: or #anchor) to really go somewhere. An item with neither an action nor an href is shown disabled, so always give one. It has no submenus and no checked items. Use NavigationMenu for links that should always be visible, Select for choosing a value, and Popover for arbitrary interactive content.",
  props: dropdownMenuProps,
  component: ({props, renderNode}) => {
    const triggerAction = useTriggerAction();
    const formName = useFormName();
    const isStreaming = useIsStreaming();
    const {placement, align} = Object.fromEntries(Object.entries(props).filter(([, v]) => v != null)) as Partial<typeof props>;
    const resolved = resolve(props.items);
    const byId = new Map(resolved.map(r => [r.item.id, r]));

    // Link items are real anchors that the browser follows; only actions need running here.
    function onSelect(id: string) {
      const chosen = byId.get(id);
      if (!chosen?.plan || isStreaming) return;
      triggerAction(chosen.item.label, formName, chosen.plan as never);
    }

    return (
      <DropdownMenu items={resolved.map(r => r.item)} trigger={renderNode(props.trigger)} onSelect={onSelect} placement={placement} align={align} />
    );
  },
});

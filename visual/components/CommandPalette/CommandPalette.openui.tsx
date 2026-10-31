import {useId} from "react";
import {action, defineComponent, reactive, useFormName, useIsStreaming, useStateField, useTriggerAction} from "@openuidev/react-lang";
import {z} from "zod/v4";
import {CommandPalette, type CommandItem} from "./CommandPalette";
import {isBoardHref, isExternalHref} from "../../shared/links";

// Positional order matters in OpenUI Lang: commands, open, placeholder, emptyMessage, shortcut.
// Choosing a command runs the action written on it, using only the SDK's existing action steps (@Set, @Reset, @ToAssistant, @OpenUrl, ...)
// through useTriggerAction, exactly as Button does. There is no command language of its own: a command with neither an action nor a link
// is shown disabled rather than looking interactive and doing nothing.
// `open` is reactive(): a bare `$variable` is the way to open the palette from a Button (@Set($palette, true)).
const commandPaletteProps = z.object({
  commands: z.array(z.object({
    id: z.string().describe("Unique id for the command, e.g. \"new-file\""),
    label: z.string().describe("The command's name"),
    description: z.string().optional().describe("Secondary text under the label. Searched too"),
    group: z.string().optional().describe("Heading to list the command under, e.g. \"Navigation\""),
    keywords: z.array(z.string()).optional().describe("Extra search words that are not shown, e.g. synonyms"),
    disabled: z.boolean().optional().describe("Shown dimmed and cannot be chosen. Default false"),
    action: action().optional().describe("What happens when it is chosen, e.g. @Set($theme, \"dark\") or @ToAssistant(\"Summarize the board\")"),
    href: z.string().optional().describe("A link to go to when chosen: a full https:// URL (opens in a new tab), mailto:, tel: or #anchor. Used when there is no action"),
  })).describe("The commands in order: {id, label, action} objects, e.g. [{id: \"dark\", label: \"Dark theme\", group: \"Appearance\", action: @Set($theme, \"dark\")}]"),
  // describe() goes inside reactive(): on the outer schema it would clone it and drop the reactive mark.
  open: reactive(z.boolean().optional().describe("A bare boolean $variable (declared false) that a Button opens with @Set($palette, true), or true/false for the initial state. Skip with null to start closed")),
  placeholder: z.string().optional().describe("Placeholder of the search field. Default Search commands…"),
  emptyMessage: z.string().optional().describe("Text shown when nothing matches. Default No results found."),
  shortcut: z.boolean().optional().describe("true lets Cmd/Ctrl+K open the palette. Default false"),
});

type RawCommand = {id?: unknown; label?: unknown; description?: unknown; group?: unknown; keywords?: unknown; disabled?: unknown; action?: unknown; href?: unknown};
type ActionPlan = {steps: unknown[]};

interface Resolved {
  item: CommandItem;
  plan?: ActionPlan;
  href?: string;
}

// Skipped entries (null, or still streaming) are dropped. A repeated id gets a numeric suffix so every command keeps a distinct id.
function resolve(input: unknown): Resolved[] {
  if (!Array.isArray(input)) return [];
  const seen = new Set<string>();
  return (input as (RawCommand | null | undefined)[]).flatMap((raw): Resolved[] => {
    if (!raw || typeof raw.id !== "string" || typeof raw.label !== "string") return [];
    let id = raw.id;
    for (let n = 2; seen.has(id); n++) id = `${raw.id}-${n}`;
    seen.add(id);
    // The object check skips legacy string values, which triggerAction cannot handle. A plan with no steps would only send the label to the assistant.
    const plan = typeof raw.action === "object" && raw.action && Array.isArray((raw.action as ActionPlan).steps) && (raw.action as ActionPlan).steps.length ? raw.action as ActionPlan : undefined;
    const href = !plan && typeof raw.href === "string" && isBoardHref(raw.href) ? raw.href : undefined;
    const keywords = Array.isArray(raw.keywords) ? raw.keywords.filter((k): k is string => typeof k === "string") : undefined;
    return [{
      item: {
        id,
        label: raw.label,
        description: typeof raw.description === "string" ? raw.description : undefined,
        group: typeof raw.group === "string" ? raw.group : undefined,
        keywords,
        // Nothing to run and nowhere to go: show it, but do not let it look chosen.
        disabled: raw.disabled === true || (!plan && !href),
      },
      plan,
      href,
    }];
  });
}

export const commandPaletteDefinition = defineComponent({
  name: "CommandPalette",
  description: "A searchable list of commands in a pop-up, each running an existing action when chosen: CommandPalette(commands, open, placeholder, emptyMessage, shortcut), e.g. CommandPalette([{id: \"dark\", label: \"Dark theme\", group: \"Appearance\", action: @Set($theme, \"dark\")}, {id: \"docs\", label: \"Open docs\", group: \"Go to\", href: \"https://example.com/docs\"}], $palette). Declare $palette = false and add a Button(\"Commands\", false, \"outline\", \"default\", false, false, null, null, @Set($palette, true)) to open it; set shortcut to true so Cmd/Ctrl+K opens it too. Each command needs an action (@Set, @Reset, @ToAssistant, @OpenUrl) or an href; one with neither is shown disabled. @OpenUrl only reports the link to the host and does not navigate on the board, so use href to actually go somewhere. Searches label, description and keywords. Use NavigationMenu for always-visible links.",
  props: commandPaletteProps,
  component: ({props}) => {
    // The name only keys the SDK's non-reactive fallback field. It is unique per instance so palettes never share state through it,
    // and setValue is never called unless the binding is reactive.
    const field = useStateField(useId(), props.open);
    const triggerAction = useTriggerAction();
    const formName = useFormName();
    const isStreaming = useIsStreaming();
    const {placeholder, emptyMessage, shortcut} = Object.fromEntries(Object.entries(props).filter(([, v]) => v != null)) as Partial<typeof props>;
    const resolved = resolve(props.commands);
    const byId = new Map(resolved.map(r => [r.item.id, r]));

    function onSelect(id: string) {
      const chosen = byId.get(id);
      if (!chosen || isStreaming) return;
      if (chosen.plan) triggerAction(chosen.item.label, formName, chosen.plan as never);
      else if (chosen.href) {
        // Literal links, as in Breadcrumbs: web links leave the board in a new tab; an anchor moves within the page.
        if (isExternalHref(chosen.href)) window.open(chosen.href, "_blank", "noopener,noreferrer");
        else window.location.assign(chosen.href);
      }
    }

    return (
      <CommandPalette
        commands={resolved.map(r => r.item)}
        {...(field.isReactive ? {open: field.value === true} : {defaultOpen: field.value === true})}
        onOpenChange={next => { if (field.isReactive) field.setValue(next); }}
        onSelect={onSelect}
        placeholder={placeholder}
        emptyMessage={emptyMessage}
        shortcut={shortcut === true}
      />
    );
  },
});

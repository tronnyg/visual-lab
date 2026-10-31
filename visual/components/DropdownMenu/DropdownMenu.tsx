import {useId, useLayoutEffect, useRef, useState} from "react";
import type {ComponentPropsWithoutRef, KeyboardEvent, MouseEvent, PointerEvent as ReactPointerEvent, ReactNode, Ref} from "react";
import {useControllableState} from "../../shared/useControllableState";
import {AnchoredPanel} from "../../shared/AnchoredPanel";
import type {OverlayAlign, OverlaySide} from "../../shared/AnchoredPanel";
import {TriggerSlot} from "../../shared/TriggerSlot";
import {useEscapeDismiss, useOutsideDismiss} from "../../shared/dismiss";
import {idPart} from "../../shared/idPart";
import {isExternalHref, isSafeHref} from "../../shared/links";

export const dropdownMenuPlacements = ["top", "bottom", "left", "right"] as const;
export const dropdownMenuAligns = ["start", "center", "end"] as const;
export type DropdownMenuPlacement = OverlaySide;
export type DropdownMenuAlign = OverlayAlign;

export interface DropdownMenuItem {
  /** Unique within `items`. Passed to `onSelect`. */
  id: string;
  label: string;
  /** Shown dimmed, skipped by the arrow keys and cannot be chosen. */
  disabled?: boolean;
  /** Draws a separator line above this item. */
  separatorBefore?: boolean;
  /** Heading for a run of consecutive items with the same group; the run becomes a labelled `group`. */
  group?: string;
  /** Makes the item a link that the browser follows (http, https, mailto, tel, relative or `#anchor`; other schemes are not links). */
  href?: string;
}

interface DropdownMenuOwnProps {
  /** The menu's items, in order. Ids must be unique. */
  items: readonly DropdownMenuItem[];
  /** The element that opens the menu, usually a button. Plain text becomes a button. */
  trigger: ReactNode;
  /** Called with the item's id when the user chooses an enabled item (link items too). The menu then closes. */
  onSelect?: (id: string) => void;
  /** Preferred side of the trigger. It flips when there is not enough room. Defaults to `bottom`. */
  placement?: DropdownMenuPlacement;
  /** Alignment along that side. Defaults to `start`. */
  align?: DropdownMenuAlign;
  /** Whether the menu is open. Makes the component controlled. */
  open?: boolean;
  /** Whether the menu starts open when uncontrolled. Defaults to `false`. */
  defaultOpen?: boolean;
  /** Called with the new state when the user opens or closes the menu, never on first render. */
  onOpenChange?: (open: boolean) => void;
  /** Accessible name of the menu. Defaults to the trigger's accessible name or text. */
  label?: string;
  ref?: Ref<HTMLDivElement>;
}

export type DropdownMenuProps = DropdownMenuOwnProps & Omit<ComponentPropsWithoutRef<"div">, keyof DropdownMenuOwnProps | "children">;

type Intent = "first" | "last" | "menu";
type Entry = {kind: "item"; item: DropdownMenuItem} | {kind: "separator"; key: string};
interface Section { group?: string; entries: Entry[] }

// Consecutive items with the same group form a section; a change of group starts a new one.
function buildSections(items: readonly DropdownMenuItem[]): Section[] {
  const sections: Section[] = [];
  items.forEach((item, index) => {
    let section = sections[sections.length - 1];
    if (!section || section.group !== item.group) { section = {group: item.group, entries: []}; sections.push(section); }
    if (item.separatorBefore && index > 0) section.entries.push({kind: "separator", key: `separator-${item.id}`});
    section.entries.push({kind: "item", item});
  });
  return sections;
}

/**
 * A menu of actions opened from a button, following the WAI-ARIA menu button pattern: the trigger has `aria-haspopup="menu"` and
 * `aria-expanded`; the popup is `role="menu"` of `menuitem`s with roving focus (one item is focused at a time, Arrow Up/Down move with
 * wrap-around, Home/End jump, a typed letter jumps to a matching item, disabled items are skipped). Enter or Space chooses; Escape
 * closes and returns focus to the trigger; Tab or a press elsewhere closes. Opening with the keyboard focuses the first item (Arrow Up:
 * the last); opening with the pointer focuses the menu itself, so arrow keys work without a highlighted item. This is an application
 * menu, not site navigation: use NavigationMenu for destinations that should always be visible.
 */
export function DropdownMenu({items, trigger, onSelect, placement = "bottom", align = "start", open, defaultOpen, onOpenChange, label, className, id, ref, onKeyDown, ...rest}: DropdownMenuProps) {
  const baseId = useId();
  const menuId = id ?? `${baseId}-menu`;
  const [isOpen, setOpen] = useControllableState<boolean>({value: open, defaultValue: defaultOpen ?? false, onChange: onOpenChange});
  const [anchor, setAnchor] = useState<HTMLElement | null>(null);
  const [name, setName] = useState<string | undefined>();
  const menuRef = useRef<HTMLDivElement | null>(null);
  const openIntent = useRef<Intent>("menu");
  const typed = useRef({text: "", timer: undefined as ReturnType<typeof setTimeout> | undefined});

  const enabledItems = () => Array.from(menuRef.current?.querySelectorAll<HTMLElement>('[role="menuitem"]:not([aria-disabled="true"])') ?? []);

  const closeAndFocusTrigger = () => { setOpen(false); anchor?.focus(); };
  useEscapeDismiss(isOpen, closeAndFocusTrigger);
  useOutsideDismiss(isOpen, () => [anchor, menuRef.current], () => setOpen(false));

  // The menu's name and the first focus. The panel is displayed by the time this runs, so it can take focus in the frame it opens.
  useLayoutEffect(() => {
    if (!isOpen) return;
    setName(label ?? anchor?.getAttribute("aria-label") ?? anchor?.textContent?.trim() ?? undefined);
    const enabled = enabledItems();
    const target = openIntent.current === "first" ? enabled[0] : openIntent.current === "last" ? enabled[enabled.length - 1] : undefined;
    (target ?? menuRef.current)?.focus({preventScroll: true});
    openIntent.current = "menu";
  }, [isOpen]);

  function move(to: "next" | "previous" | "first" | "last") {
    const enabled = enabledItems();
    if (!enabled.length) return;
    const current = enabled.indexOf(document.activeElement as HTMLElement);
    const index = to === "first" ? 0 : to === "last" ? enabled.length - 1 : to === "next" ? (current + 1) % enabled.length : (current <= 0 ? enabled.length : current) - 1;
    enabled[index].focus({preventScroll: true});
  }

  function onMenuKeyDown(event: KeyboardEvent<HTMLDivElement>) {
    onKeyDown?.(event);
    if (event.defaultPrevented || event.nativeEvent.isComposing) return;
    const key = event.key;
    if (key === "ArrowDown") { event.preventDefault(); move("next"); }
    else if (key === "ArrowUp") { event.preventDefault(); move("previous"); }
    else if (key === "Home") { event.preventDefault(); move("first"); }
    else if (key === "End") { event.preventDefault(); move("last"); }
    // Tab needs no handling: the items are not tab stops, so it moves on to whatever follows the menu in the DOM, which is whatever follows the
    // trigger, and the focus leaving closes the menu. Shift+Tab would only land on the trigger, so it closes there.
    else if (key === "Tab" && event.shiftKey) { event.preventDefault(); closeAndFocusTrigger(); }
    else if (key === " " && event.target instanceof HTMLAnchorElement) { event.preventDefault(); event.target.click(); }
    else if (key.length === 1 && key !== " " && !event.ctrlKey && !event.metaKey && !event.altKey) {
      // Type-ahead: the typed prefix picks the next enabled item whose label starts with it.
      clearTimeout(typed.current.timer);
      typed.current.text += key.toLowerCase();
      typed.current.timer = setTimeout(() => { typed.current.text = ""; }, 600);
      const enabled = enabledItems();
      const current = enabled.indexOf(document.activeElement as HTMLElement);
      // The first letter starts after the focused item, so repeating a letter cycles; more letters refine from the focused item.
      const start = typed.current.text.length === 1 ? current + 1 : Math.max(current, 0);
      const ordered = [...enabled.slice(start), ...enabled.slice(0, start)];
      ordered.find(element => element.textContent?.trim().toLowerCase().startsWith(typed.current.text))?.focus({preventScroll: true});
    }
  }

  function choose(item: DropdownMenuItem, event?: MouseEvent) {
    if (item.disabled) { event?.preventDefault(); return; }
    onSelect?.(item.id);
    setOpen(false);
    anchor?.focus();
  }

  const sections = buildSections(items);
  return (
    <>
      <TriggerSlot
        triggerAttrs={{"aria-haspopup": "menu", "aria-expanded": String(isOpen), "aria-controls": isOpen ? menuId : undefined}}
        onTriggerElement={setAnchor}
        onPointerDown={() => { openIntent.current = "menu"; }}
        onKeyDown={event => {
          if (event.defaultPrevented || event.target !== anchor) return;
          if (event.key === "ArrowDown" || event.key === "ArrowUp") {
            event.preventDefault();
            openIntent.current = event.key === "ArrowDown" ? "first" : "last";
            if (!isOpen) setOpen(true);
            else { const enabled = enabledItems(); (event.key === "ArrowDown" ? enabled[0] : enabled[enabled.length - 1])?.focus({preventScroll: true}); }
          } else if (event.key === "Enter" || event.key === " ") openIntent.current = "first";
        }}
        onClick={() => setOpen(!isOpen)}
      >
        {trigger}
      </TriggerSlot>
      {isOpen && (
        <AnchoredPanel
          {...rest}
          id={menuId}
          ref={node => { menuRef.current = node; if (typeof ref === "function") ref(node); else if (ref) ref.current = node; }}
          anchor={anchor}
          open
          side={placement}
          align={align}
          role="menu"
          tabIndex={-1}
          aria-label={name}
          className={className ? `vl-menu ${className}` : "vl-menu"}
          onKeyDown={onMenuKeyDown}
        >
          {sections.map((section, index) => {
            const headingId = `${baseId}-group-${index}`;
            const entries = section.entries.map(entry => entry.kind === "separator"
              ? <div key={entry.key} role="separator" className="vl-menu__separator" />
              : <MenuItem key={entry.item.id} item={entry.item} id={`${baseId}-item-${idPart(entry.item.id)}`} onChoose={choose} />);
            return section.group
              ? (
                <div key={`group-${index}`} role="group" aria-labelledby={headingId} className="vl-menu__group">
                  <div id={headingId} role="presentation" className="vl-menu__heading">{section.group}</div>
                  {entries}
                </div>
              )
              : <div key={`section-${index}`} role="presentation" className="vl-menu__group">{entries}</div>;
          })}
        </AnchoredPanel>
      )}
    </>
  );
}

function MenuItem({item, id, onChoose}: {item: DropdownMenuItem; id: string; onChoose: (item: DropdownMenuItem, event?: MouseEvent) => void}) {
  // Hovering highlights by moving focus, so the pointer and the keyboard share one highlight.
  const common = {
    id,
    role: "menuitem" as const,
    tabIndex: -1,
    className: "vl-menu__item",
    "aria-disabled": item.disabled ? true : undefined,
    // A disabled item neither takes focus from the pointer nor lets the menu lose it.
    onMouseDown: (event: MouseEvent<HTMLElement>) => { if (item.disabled) event.preventDefault(); },
    onPointerMove: (event: ReactPointerEvent<HTMLElement>) => { if (!item.disabled && document.activeElement !== event.currentTarget) event.currentTarget.focus({preventScroll: true}); },
  };
  if (item.href && !item.disabled && isSafeHref(item.href)) {
    const external = isExternalHref(item.href);
    return (
      <a {...common} href={item.href} target={external ? "_blank" : undefined} rel={external ? "noopener noreferrer" : undefined} onClick={event => onChoose(item, event)}>{item.label}</a>
    );
  }
  return <button {...common} type="button" onClick={event => onChoose(item, event)}>{item.label}</button>;
}

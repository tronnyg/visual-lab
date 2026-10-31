import {useId, useRef} from "react";
import type {ComponentPropsWithoutRef, KeyboardEvent, ReactNode, Ref} from "react";
import {useControllableState} from "../../shared/useControllableState";
import {idPart} from "../../shared/idPart";

export const tabsVariants = ["line", "contained"] as const;
export const tabsOrientations = ["horizontal", "vertical"] as const;

export type TabsVariant = (typeof tabsVariants)[number];
export type TabsOrientation = (typeof tabsOrientations)[number];

export interface TabItem {
  /** Unique within the Tabs. Identifies the tab in `value`, `defaultValue` and `onValueChange`. */
  id: string;
  /** Text on the tab button. */
  label: string;
  /** The panel's content. It stays mounted while the tab is inactive. */
  content: ReactNode;
  /** The tab cannot be selected or focused. */
  disabled?: boolean;
}

interface TabsOwnProps {
  /** The tabs, in order. Ids must be unique. */
  items: readonly TabItem[];
  /** Selected tab id. Makes the component controlled. */
  value?: string;
  /** Initially selected tab id when uncontrolled. */
  defaultValue?: string;
  /** Called with the new id when the user selects a tab (not on first render). */
  onValueChange?: (value: string) => void;
  /** `line` draws an underline under the active tab; `contained` puts the tabs in a muted track. Defaults to `line`. */
  variant?: TabsVariant;
  /** `vertical` stacks the tabs beside the panel and uses Up/Down arrows. Defaults to `horizontal`. */
  orientation?: TabsOrientation;
  /** Accessible name for the tab list. */
  "aria-label"?: string;
  "aria-labelledby"?: string;
  ref?: Ref<HTMLDivElement>;
}

export type TabsProps = TabsOwnProps & Omit<ComponentPropsWithoutRef<"div">, keyof TabsOwnProps | "children">;

// The selected tab is the requested one if it exists and is enabled, otherwise the first enabled tab. A disabled or unknown value never selects anything.
function resolveSelected(items: readonly TabItem[], value: string | undefined): string | undefined {
  const match = items.find(item => item.id === value && !item.disabled);
  return (match ?? items.find(item => !item.disabled))?.id;
}

/**
 * WAI-ARIA tabs with automatic activation: arrow keys move focus and select, Home/End jump to the ends, disabled tabs are skipped.
 * Every panel stays mounted so inactive content keeps its state; inactive panels use `hidden`, which removes them from the tab order
 * and the accessibility tree.
 */
export function Tabs({items, value, defaultValue, onValueChange, variant, orientation, className, id, ref, "aria-label": ariaLabel, "aria-labelledby": ariaLabelledBy, ...rest}: TabsProps) {
  const generatedId = useId();
  const baseId = id ?? generatedId;
  const [requested, select] = useControllableState<string | undefined>({value, defaultValue, onChange: next => { if (next !== undefined) onValueChange?.(next); }});
  const tabRefs = useRef(new Map<string, HTMLButtonElement>());
  const selected = resolveSelected(items, requested);
  const vertical = orientation === "vertical";
  const tabId = (item: TabItem) => `${baseId}-tab-${idPart(item.id)}`;
  const panelId = (item: TabItem) => `${baseId}-panel-${idPart(item.id)}`;

  function move(event: KeyboardEvent<HTMLDivElement>) {
    const enabled = items.filter(item => !item.disabled);
    if (!enabled.length) return;
    const origin = (event.target as HTMLElement).closest("[role=tab]")?.getAttribute("data-tab-id");
    const current = enabled.findIndex(item => item.id === origin);
    const prev = vertical ? "ArrowUp" : "ArrowLeft";
    const next = vertical ? "ArrowDown" : "ArrowRight";
    let target: TabItem | undefined;
    if (event.key === next) target = enabled[(current + 1) % enabled.length];
    else if (event.key === prev) target = enabled[(current - 1 + enabled.length) % enabled.length];
    else if (event.key === "Home") target = enabled[0];
    else if (event.key === "End") target = enabled[enabled.length - 1];
    if (!target) return;
    event.preventDefault();
    tabRefs.current.get(target.id)?.focus();
    if (target.id !== selected) select(target.id);
  }

  return (
    <div
      {...rest}
      ref={ref}
      id={id}
      className={className ? `vl-tabs ${className}` : "vl-tabs"}
      data-variant={variant ?? "line"}
      data-orientation={vertical ? "vertical" : "horizontal"}
    >
      {items.length > 0 && (
        // The keydown handler only reacts to key events bubbling up from the tab buttons.
        <div className="vl-tabs__list" role="tablist" aria-orientation={vertical ? "vertical" : "horizontal"} aria-label={ariaLabel} aria-labelledby={ariaLabelledBy} onKeyDown={move}>
          {items.map(item => (
            <button
              key={item.id}
              ref={node => { if (node) tabRefs.current.set(item.id, node); else tabRefs.current.delete(item.id); }}
              type="button"
              role="tab"
              id={tabId(item)}
              className="vl-tabs__tab"
              data-tab-id={item.id}
              aria-selected={item.id === selected}
              aria-controls={panelId(item)}
              tabIndex={item.id === selected ? 0 : -1}
              disabled={item.disabled}
              onClick={() => { if (item.id !== selected) select(item.id); }}
            >
              {item.label}
            </button>
          ))}
        </div>
      )}
      {items.map(item => (
        <div key={item.id} className="vl-tabs__panel" role="tabpanel" id={panelId(item)} aria-labelledby={tabId(item)} tabIndex={item.id === selected ? 0 : undefined} hidden={item.id !== selected}>
          {item.content}
        </div>
      ))}
    </div>
  );
}

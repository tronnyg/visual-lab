import {useId, useRef} from "react";
import type {ComponentPropsWithoutRef, KeyboardEvent, ReactNode, Ref} from "react";
import {useControllableState} from "../../shared/useControllableState";
import {idPart} from "../../shared/idPart";

export interface AccordionItem {
  /** Unique within the Accordion. Identifies the section in `value`, `defaultValue` and `onValueChange`. */
  id: string;
  /** Text on the section's trigger button. */
  title: string;
  /** The section's content. It stays mounted while the section is collapsed. */
  content: ReactNode;
  /** The trigger cannot be toggled or focused. */
  disabled?: boolean;
}

export const accordionHeadingLevels = [2, 3, 4, 5, 6] as const;
export type AccordionHeadingLevel = (typeof accordionHeadingLevels)[number];

interface AccordionBaseProps {
  /** The sections, in order. Ids must be unique. */
  items: readonly AccordionItem[];
  /** Heading level of each section's trigger, so the outline fits the page. Defaults to 3. */
  headingLevel?: AccordionHeadingLevel;
  ref?: Ref<HTMLDivElement>;
}

/** At most one section is open. */
interface AccordionSingleProps {
  type?: "single";
  /** The open section's id, or `null` for none. Makes the component controlled. */
  value?: string | null;
  /** The initially open section when uncontrolled. */
  defaultValue?: string | null;
  /** Called with the newly open section's id, or `null` when the open one is closed (not on first render). */
  onValueChange?: (value: string | null) => void;
  /** Whether the open section can be closed by clicking it again. Defaults to `true`; `false` keeps one section open once any is. */
  collapsible?: boolean;
}

/** Any number of sections can be open. */
interface AccordionMultipleProps {
  type: "multiple";
  /** The open sections' ids. Makes the component controlled. */
  value?: readonly string[];
  /** The initially open sections when uncontrolled. */
  defaultValue?: readonly string[];
  /** Called with the full list of open ids after the user toggles a section (not on first render). */
  onValueChange?: (value: string[]) => void;
}

export type AccordionProps = AccordionBaseProps & (AccordionSingleProps | AccordionMultipleProps) & Omit<ComponentPropsWithoutRef<"div">, keyof AccordionBaseProps | "children">;

/**
 * Expandable sections. Triggers are native buttons inside headings (`aria-expanded`, `aria-controls`); Enter and Space are native, and
 * Up/Down/Home/End move between enabled triggers. Every panel stays mounted, so collapsed content keeps its state; collapsed panels use
 * `hidden`, which removes them from the tab order and the accessibility tree.
 */
export function Accordion(props: AccordionProps) {
  // The two modes share one implementation, so the union is read through a loose view of its members.
  const {items, headingLevel, className, id, ref, type, value, defaultValue, onValueChange, collapsible: collapsibleProp, ...rest} = props as AccordionBaseProps & {
    type?: "single" | "multiple";
    value?: string | null | readonly string[];
    defaultValue?: string | null | readonly string[];
    onValueChange?: (value: never) => void;
    collapsible?: boolean;
  } & Omit<ComponentPropsWithoutRef<"div">, "children">;
  const multiple = type === "multiple";
  const collapsible = multiple || collapsibleProp !== false;
  const generatedId = useId();
  const baseId = id ?? generatedId;
  const triggers = useRef(new Map<string, HTMLButtonElement>());

  // Both modes keep a list of open ids; single mode just never holds more than one.
  const asList = (v: string | null | readonly string[] | undefined): string[] | undefined => v === undefined ? undefined : v === null ? [] : typeof v === "string" ? [v] : [...v];
  const [openIds, setOpenIds] = useControllableState<string[]>({
    value: asList(value),
    defaultValue: asList(defaultValue) ?? [],
    onChange: list => (onValueChange as ((value: string[] | string | null) => void) | undefined)?.(multiple ? list : list[0] ?? null),
  });
  const known = new Set(items.map(item => item.id));
  const open = new Set(openIds.filter(openId => known.has(openId)));

  function toggle(item: AccordionItem) {
    if (open.has(item.id)) {
      if (multiple) setOpenIds([...open].filter(openId => openId !== item.id));
      else if (collapsible) setOpenIds([]);
    } else {
      setOpenIds(multiple ? [...open, item.id] : [item.id]);
    }
  }

  function move(event: KeyboardEvent<HTMLDivElement>) {
    const origin = (event.target as HTMLElement).closest("[data-accordion-trigger]")?.getAttribute("data-accordion-trigger");
    if (origin == null) return;
    const enabled = items.filter(item => !item.disabled);
    const current = enabled.findIndex(item => item.id === origin);
    let target: AccordionItem | undefined;
    if (event.key === "ArrowDown") target = enabled[(current + 1) % enabled.length];
    else if (event.key === "ArrowUp") target = enabled[(current - 1 + enabled.length) % enabled.length];
    else if (event.key === "Home") target = enabled[0];
    else if (event.key === "End") target = enabled[enabled.length - 1];
    if (!target) return;
    event.preventDefault();
    triggers.current.get(target.id)?.focus();
  }

  const Heading = `h${headingLevel ?? 3}` as "h3";
  // The region landmark helps screen reader users, but many of them are noise (APG advises against it beyond about six panels).
  const landmarks = items.length <= 6;
  return (
    <div {...rest} ref={ref} id={id} className={className ? `vl-accordion ${className}` : "vl-accordion"} onKeyDown={move}>
      {items.map(item => {
        const isOpen = open.has(item.id);
        const triggerId = `${baseId}-trigger-${idPart(item.id)}`;
        const panelId = `${baseId}-panel-${idPart(item.id)}`;
        return (
          <div key={item.id} className="vl-accordion__item" data-state={isOpen ? "open" : "closed"}>
            <Heading className="vl-accordion__heading">
              <button
                ref={node => { if (node) triggers.current.set(item.id, node); else triggers.current.delete(item.id); }}
                type="button"
                id={triggerId}
                className="vl-accordion__trigger"
                data-accordion-trigger={item.id}
                aria-expanded={isOpen}
                aria-controls={panelId}
                disabled={item.disabled}
                onClick={() => toggle(item)}
              >
                <span className="vl-accordion__title">{item.title}</span>
                <span className="vl-accordion__chevron" aria-hidden="true" />
              </button>
            </Heading>
            <div className="vl-accordion__panel" id={panelId} role={landmarks ? "region" : undefined} aria-labelledby={landmarks ? triggerId : undefined} hidden={!isOpen}>
              <div className="vl-accordion__content">{item.content}</div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

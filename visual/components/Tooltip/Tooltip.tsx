import {useEffect, useId, useRef, useState} from "react";
import type {ComponentPropsWithoutRef, FocusEvent, PointerEvent, ReactNode, Ref} from "react";
import {AnchoredPanel} from "../../shared/AnchoredPanel";
import type {OverlaySide} from "../../shared/AnchoredPanel";
import {TriggerSlot} from "../../shared/TriggerSlot";
import {useEscapeDismiss} from "../../shared/dismiss";

export const tooltipPlacements = ["top", "bottom", "left", "right"] as const;
export type TooltipPlacement = OverlaySide;

// Leaving the trigger waits this long before hiding, so the pointer can cross the gap to the tooltip (WCAG 1.4.13 "hoverable") without flicker.
const hideDelay = 100;

interface TooltipOwnProps {
  /** The tooltip text. Plain text only: a tooltip never holds interactive content. */
  content: string;
  /** The element the tooltip describes: usually a button or link. Plain text becomes a button. */
  children: ReactNode;
  /** Preferred side. It flips when there is not enough room. Defaults to `top`. */
  placement?: TooltipPlacement;
  /** Milliseconds the pointer must rest on the trigger before the tooltip appears. Keyboard focus shows it at once. Defaults to `300`. */
  delay?: number;
  /** The tooltip never appears and the trigger is not described by it. */
  disabled?: boolean;
  ref?: Ref<HTMLDivElement>;
}

export type TooltipProps = TooltipOwnProps & Omit<ComponentPropsWithoutRef<"div">, keyof TooltipOwnProps | "children">;

/**
 * Short supplementary text for a control, shown on hover or keyboard focus. The trigger is described by it (`aria-describedby`) and keeps
 * its own role and focus; the tooltip is `role="tooltip"`, never takes focus and is not needed to understand the page. Escape hides it,
 * leaving the trigger or blurring hides it, and the pointer may move onto the tooltip without it disappearing. Touch does nothing special:
 * there is no persistent touch interaction, the trigger just works. Use Popover for interactive content.
 */
export function Tooltip({content, children, placement = "top", delay = 300, disabled, className, id, ref, ...rest}: TooltipProps) {
  const generatedId = useId();
  const tooltipId = id ?? `${generatedId}-tooltip`;
  const [open, setOpen] = useState(false);
  const [anchor, setAnchor] = useState<HTMLElement | null>(null);
  const timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  // True from a pointer press until the click is over: the focus that a press causes must not show the tooltip.
  const pressing = useRef(false);
  const visible = open && !disabled;

  const clear = () => { clearTimeout(timer.current); timer.current = undefined; };
  const show = () => { clear(); setOpen(true); };
  const hide = () => { clear(); setOpen(false); };
  const hideSoon = () => { clear(); timer.current = setTimeout(() => setOpen(false), hideDelay); };
  useEffect(() => clear, []);
  useEffect(() => { if (disabled) hide(); }, [disabled]);
  useEscapeDismiss(visible, hide);

  function onPointerEnter(event: PointerEvent) {
    if (disabled || event.pointerType === "touch") return;
    clear();
    if (open) return;
    timer.current = setTimeout(() => setOpen(true), delay);
  }
  function onFocus(event: FocusEvent) {
    if (disabled || pressing.current) return;
    // Only keyboard-style focus: a control focused by a click should not keep a tooltip over itself.
    if (event.target instanceof Element && !event.target.matches(":focus-visible")) return;
    show();
  }

  return (
    <>
      <TriggerSlot
        triggerAttrs={{"aria-describedby": disabled ? undefined : tooltipId}}
        onTriggerElement={setAnchor}
        onPointerEnter={onPointerEnter}
        onPointerLeave={event => { if (event.pointerType !== "touch") hideSoon(); }}
        onPointerDown={() => { pressing.current = true; hide(); }}
        onPointerUp={() => { setTimeout(() => { pressing.current = false; }, 0); }}
        onPointerCancel={() => { pressing.current = false; }}
        onFocus={onFocus}
        onBlur={hide}
      >
        {children}
      </TriggerSlot>
      <AnchoredPanel
        {...rest}
        id={tooltipId}
        ref={ref}
        role="tooltip"
        anchor={anchor}
        open={visible}
        side={placement}
        gap={8}
        className={className ? `vl-tooltip ${className}` : "vl-tooltip"}
        onPointerEnter={clear}
        onPointerLeave={hideSoon}
      >
        {content}
      </AnchoredPanel>
    </>
  );
}

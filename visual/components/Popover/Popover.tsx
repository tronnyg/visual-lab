import {useId, useRef, useState} from "react";
import type {ComponentPropsWithoutRef, ReactNode, Ref} from "react";
import {useControllableState} from "../../shared/useControllableState";
import {AnchoredPanel} from "../../shared/AnchoredPanel";
import type {OverlayAlign, OverlaySide} from "../../shared/AnchoredPanel";
import {TriggerSlot} from "../../shared/TriggerSlot";
import {useEscapeDismiss, useOutsideDismiss} from "../../shared/dismiss";

export const popoverPlacements = ["top", "bottom", "left", "right"] as const;
export const popoverAligns = ["start", "center", "end"] as const;
export type PopoverPlacement = OverlaySide;
export type PopoverAlign = OverlayAlign;

interface PopoverOwnProps {
  /** Whether the popover is open. Makes the component controlled. */
  open?: boolean;
  /** Whether the popover starts open when uncontrolled. Defaults to `false`. */
  defaultOpen?: boolean;
  /** Called with the new state when the user toggles the trigger or dismisses the popover (Escape, outside press, focus leaving), never on first render. */
  onOpenChange?: (open: boolean) => void;
  /** The element that toggles the popover, usually a button. Plain text becomes a button. */
  trigger: ReactNode;
  /** The popover's content. It is mounted only while the popover is open. */
  children: ReactNode;
  /** Preferred side of the trigger. It flips when there is not enough room. Defaults to `bottom`. */
  placement?: PopoverPlacement;
  /** Alignment along that side. Defaults to `center`. */
  align?: PopoverAlign;
  /** Whether a press or focus outside the trigger and popover closes it. Defaults to `true`. */
  closeOnOutsideClick?: boolean;
  /** Whether Escape closes it. Defaults to `true`. */
  closeOnEscape?: boolean;
  /** Accessible name for the popover's content, for when it holds a group of controls. Optional. */
  label?: string;
  ref?: Ref<HTMLDivElement>;
}

export type PopoverProps = PopoverOwnProps & Omit<ComponentPropsWithoutRef<"div">, keyof PopoverOwnProps>;

/**
 * Contextual, interactive content next to its trigger, as a disclosure: the trigger is a button with `aria-expanded` and `aria-controls`,
 * and the content is a non-modal panel placed in the DOM right after the trigger, so Tab leads from the trigger into it and on. Focus
 * is never moved or trapped; Escape closes it and returns focus to the trigger when it was inside. It sits in the browser's top layer
 * (no portal, never clipped), is positioned with collision handling, and follows scrolling and resizing.
 */
export function Popover({open, defaultOpen, onOpenChange, trigger, children, placement = "bottom", align = "center", closeOnOutsideClick = true, closeOnEscape = true, label, className, id, ref, ...rest}: PopoverProps) {
  const generatedId = useId();
  const panelId = id ?? `${generatedId}-popover`;
  const [isOpen, setOpen] = useControllableState<boolean>({value: open, defaultValue: defaultOpen ?? false, onChange: onOpenChange});
  const [anchor, setAnchor] = useState<HTMLElement | null>(null);
  const panelRef = useRef<HTMLDivElement | null>(null);

  // Closing from inside the popover would drop focus into the page; put it back on the trigger.
  const close = () => {
    if (panelRef.current?.contains(document.activeElement)) anchor?.focus();
    setOpen(false);
  };
  useEscapeDismiss(isOpen && closeOnEscape, close);
  useOutsideDismiss(isOpen && closeOnOutsideClick, () => [anchor, panelRef.current], () => setOpen(false));

  return (
    <>
      <TriggerSlot
        triggerAttrs={{"aria-expanded": String(isOpen), "aria-controls": isOpen ? panelId : undefined}}
        onTriggerElement={setAnchor}
        onClick={() => setOpen(!isOpen)}
      >
        {trigger}
      </TriggerSlot>
      {isOpen && (
        <AnchoredPanel
          {...rest}
          id={panelId}
          ref={node => { panelRef.current = node; if (typeof ref === "function") ref(node); else if (ref) ref.current = node; }}
          anchor={anchor}
          open
          side={placement}
          align={align}
          role={label ? "group" : undefined}
          aria-label={label}
          className={className ? `vl-popover ${className}` : "vl-popover"}
        >
          {children}
        </AnchoredPanel>
      )}
    </>
  );
}

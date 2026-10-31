import {useEffect, useLayoutEffect, useRef, useState} from "react";
import type {ComponentPropsWithoutRef, Ref} from "react";

export const toastVariants = ["default", "success", "warning", "error"] as const;
export const toastPositions = ["top-right", "top-left", "bottom-right", "bottom-left"] as const;
export type ToastVariant = (typeof toastVariants)[number];
export type ToastPosition = (typeof toastPositions)[number];

export interface ToastItem {
  /** Unique within `items`. It identifies the notification across renders: reusing an id shows no new notification. */
  id: string;
  /** The notification's headline. */
  title: string;
  /** Supporting text under the title. */
  description?: string;
  /** Tone and announcement: `error` is announced assertively and stays until dismissed; the others are polite. Defaults to `default`. */
  variant?: ToastVariant;
  /** Milliseconds before it dismisses itself, `0` for never. Defaults to 5000 (8000 for `warning`, never for `error`). */
  duration?: number;
}

interface ToastOwnProps {
  /** The notifications to show, in order. The list is yours: add and remove items to show and hide them. */
  items: readonly ToastItem[];
  /** Called with the item's id when it is dismissed by the button or its timer. The toast also hides itself, so a static list works without this. */
  onDismiss?: (id: string) => void;
  /** Which corner of the viewport the stack is in. Defaults to `bottom-right`. */
  position?: ToastPosition;
  /** Accessible name of the notification region. Defaults to `Notifications`. */
  label?: string;
  ref?: Ref<HTMLElement>;
}

export type ToastProps = ToastOwnProps & Omit<ComponentPropsWithoutRef<"section">, keyof ToastOwnProps | "children">;

const defaultDuration: Record<ToastVariant, number> = {default: 5000, success: 5000, warning: 8000, error: 0};
const variantName: Record<ToastVariant, string | undefined> = {default: undefined, success: "Success", warning: "Warning", error: "Error"};

/**
 * Temporary, non-blocking notifications from a declarative list. The region is a fixed-position stack in a manual `popover` (the browser's
 * top layer, so no z-index) and stays in the DOM even when empty, because a live region must exist before text is added to it to be
 * announced reliably. New notifications are announced politely and never take focus; `error` uses `role="alert"`. Each dismisses with its
 * button or after `duration`; the timer pauses while the pointer or focus is on it and keeps the time left. There is no global store: what
 * is shown is exactly `items`.
 */
export function Toast({items, onDismiss, position = "bottom-right", label, className, ref, ...rest}: ToastProps) {
  const viewportRef = useRef<HTMLElement | null>(null);
  const [dismissed, setDismissed] = useState<ReadonlySet<string>>(new Set());

  // Shown for as long as the component is mounted. Declared as a popover only to reach the top layer.
  useLayoutEffect(() => {
    const viewport = viewportRef.current;
    if (viewport && !viewport.matches(":popover-open")) viewport.showPopover();
  }, []);

  // An id that left the list may be used again later and must then show again.
  useEffect(() => {
    setDismissed(previous => {
      const ids = new Set(items.map(item => item.id));
      const kept = [...previous].filter(id => ids.has(id));
      return kept.length === previous.size ? previous : new Set(kept);
    });
  }, [items]);

  const dismiss = (id: string) => {
    setDismissed(previous => new Set(previous).add(id));
    onDismiss?.(id);
  };
  const visible = items.filter(item => !dismissed.has(item.id));

  return (
    <section
      {...rest}
      ref={node => { viewportRef.current = node; if (typeof ref === "function") ref(node); else if (ref) ref.current = node; }}
      popover="manual"
      aria-label={label ?? "Notifications"}
      data-position={position}
      className={className ? `vl-toast-viewport ${className}` : "vl-toast-viewport"}
    >
      <div className="vl-toast-list" aria-live="polite" aria-relevant="additions text">
        {visible.map(item => <ToastCard key={item.id} item={item} onDismiss={dismiss} />)}
      </div>
    </section>
  );
}

function ToastCard({item, onDismiss}: {item: ToastItem; onDismiss: (id: string) => void}) {
  const variant = item.variant ?? "default";
  const duration = item.duration ?? defaultDuration[variant];
  const [hovered, setHovered] = useState(false);
  const [focused, setFocused] = useState(false);
  const paused = hovered || focused;
  const remaining = useRef(duration);
  const dismissRef = useRef(onDismiss);
  dismissRef.current = onDismiss;

  // One timer per running period. Pausing clears it and keeps the time that was left, so nothing is dismissed while the user is reading
  // it, and a remount (Strict Mode) never leaves two timers.
  useEffect(() => {
    if (duration <= 0 || paused) return;
    const started = Date.now();
    const timer = setTimeout(() => dismissRef.current(item.id), Math.max(0, remaining.current));
    return () => {
      clearTimeout(timer);
      remaining.current -= Date.now() - started;
    };
  }, [duration, paused, item.id]);

  const name = variantName[variant];
  return (
    <div
      className="vl-toast"
      data-variant={variant}
      role={variant === "error" ? "alert" : undefined}
      onPointerEnter={() => setHovered(true)}
      onPointerLeave={() => setHovered(false)}
      onFocus={() => setFocused(true)}
      onBlur={event => { if (!event.currentTarget.contains(event.relatedTarget)) setFocused(false); }}
    >
      <div className="vl-toast__body">
        <div className="vl-toast__title">{name && <span className="vl-toast__kind">{name}: </span>}{item.title}</div>
        {item.description && <div className="vl-toast__description">{item.description}</div>}
      </div>
      <button type="button" className="vl-toast__dismiss" aria-label={`Dismiss: ${item.title}`} onClick={() => onDismiss(item.id)}><span aria-hidden="true" /></button>
    </div>
  );
}

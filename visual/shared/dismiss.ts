import {useEffect, useRef} from "react";

// Open overlays that answer Escape, in the order they opened. Only the last one reacts, so one key press closes one layer:
// a tooltip before the popover it sits in, a popover before the dialog around it.
const escapeStack: symbol[] = [];

/**
 * While `active`, Escape calls `onEscape` if this is the topmost open overlay. The listener is on the document in the capture phase, so
 * it runs before a modal dialog's own handler, and it prevents the key's default so that handler (and the browser) leave the layer below alone.
 */
export function useEscapeDismiss(active: boolean, onEscape: () => void) {
  const callback = useRef(onEscape);
  callback.current = onEscape;
  useEffect(() => {
    if (!active) return;
    const token = Symbol("escape");
    escapeStack.push(token);
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key !== "Escape" || event.defaultPrevented || event.isComposing || escapeStack[escapeStack.length - 1] !== token) return;
      event.preventDefault();
      callback.current();
    };
    document.addEventListener("keydown", onKeyDown, true);
    return () => {
      document.removeEventListener("keydown", onKeyDown, true);
      escapeStack.splice(escapeStack.indexOf(token), 1);
    };
  }, [active]);
}

/**
 * While `active`, a press or focus landing outside every element returned by `inside` calls `onDismiss`. The trigger belongs inside, so
 * pressing it toggles the overlay instead of closing it on pointer-down and reopening it on click.
 */
export function useOutsideDismiss(active: boolean, inside: () => (Element | null | undefined)[], onDismiss: (cause: "pointer" | "focus") => void) {
  const insideRef = useRef(inside);
  insideRef.current = inside;
  const callback = useRef(onDismiss);
  callback.current = onDismiss;
  useEffect(() => {
    if (!active) return;
    const outside = (target: EventTarget | null) => target instanceof Node && !insideRef.current().some(element => element?.contains(target));
    const onPointerDown = (event: PointerEvent) => { if (outside(event.target)) callback.current("pointer"); };
    const onFocusIn = (event: FocusEvent) => { if (outside(event.target)) callback.current("focus"); };
    document.addEventListener("pointerdown", onPointerDown, true);
    document.addEventListener("focusin", onFocusIn, true);
    return () => {
      document.removeEventListener("pointerdown", onPointerDown, true);
      document.removeEventListener("focusin", onFocusIn, true);
    };
  }, [active]);
}

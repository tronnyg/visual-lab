import {useLayoutEffect, useRef} from "react";
import type {HTMLAttributes, ReactNode} from "react";
import {Button} from "../components/Button/Button";

const interactive = 'button, a[href], input, select, textarea, summary, [tabindex], [role="button"]';

/** The control inside a trigger slot: the first interactive element, or the slot's first element when nothing is interactive. */
function findTrigger(slot: HTMLElement): HTMLElement | null {
  const first = slot.firstElementChild as HTMLElement | null;
  if (!first) return null;
  return first.matches(interactive) ? first : first.querySelector<HTMLElement>(interactive) ?? first;
}

export interface TriggerSlotProps extends Omit<HTMLAttributes<HTMLSpanElement>, "children"> {
  /** What the user activates: usually a button or link. Plain text becomes a button. */
  children: ReactNode;
  /** ARIA attributes (`aria-expanded`, `aria-haspopup`, ...) to keep on the trigger control itself. `undefined` removes one. */
  triggerAttrs?: Record<string, string | undefined>;
  /** Called with the trigger control whenever it changes, for positioning an overlay against it. */
  onTriggerElement?: (element: HTMLElement | null) => void;
}

/**
 * Lets any element act as an overlay's trigger without a Slot/cloneElement system: the slot is `display: contents`, so it has no box,
 * and listens for the trigger's bubbling events. The slot's props are plain event handlers. The ARIA state is written to the real
 * control (the first interactive element inside) in a layout effect, which is the only DOM access here; it is removed again on
 * every change and on unmount. This works for React children and for the nodes the OpenUI renderer returns, which cannot be given props.
 */
export function TriggerSlot({children, triggerAttrs, onTriggerElement, ...rest}: TriggerSlotProps) {
  const slotRef = useRef<HTMLSpanElement>(null);
  const lastElement = useRef<HTMLElement | null>(null);
  const callback = useRef(onTriggerElement);
  callback.current = onTriggerElement;

  // Runs after every commit: the trigger's own markup can change (streamed OpenUI, state in the child) without this component re-rendering.
  useLayoutEffect(() => {
    const element = slotRef.current && findTrigger(slotRef.current);
    if (element !== lastElement.current) {
      lastElement.current = element;
      callback.current?.(element);
    }
    if (!element || !triggerAttrs) return;
    const applied = Object.entries(triggerAttrs).flatMap(([name, value]) => {
      if (value === undefined) return [];
      element.setAttribute(name, value);
      return [name];
    });
    return () => applied.forEach(name => element.removeAttribute(name));
  });

  return (
    <span {...rest} ref={slotRef} className={rest.className ? `vl-trigger-slot ${rest.className}` : "vl-trigger-slot"}>
      {typeof children === "string" || typeof children === "number" ? <Button variant="outline">{children}</Button> : children}
    </span>
  );
}

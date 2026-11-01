import {useEffect, useRef} from "react";
import type {RefObject} from "react";

/**
 * Calls `onReset` when the form that owns the element is reset and nothing cancelled the reset. Native controls restore themselves;
 * this is for state kept in React (an uncontrolled date, selection or file list) so it returns to its default with them.
 * The listener is on the document, in the bubble phase, so it runs after the form's own React `onReset` handlers have had the chance to cancel the event.
 */
export function useFormReset(ref: RefObject<(HTMLElement & {form?: HTMLFormElement | null}) | null>, onReset: () => void) {
  const callback = useRef(onReset);
  callback.current = onReset;
  useEffect(() => {
    const onDocumentReset = (event: Event) => {
      const form = ref.current?.form ?? ref.current?.closest("form");
      if (form && event.target === form && !event.defaultPrevented) callback.current();
    };
    document.addEventListener("reset", onDocumentReset);
    return () => document.removeEventListener("reset", onDocumentReset);
  }, [ref]);
}

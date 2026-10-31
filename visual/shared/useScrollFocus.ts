import {useEffect, useState} from "react";
import type {RefObject} from "react";

/** A region that scrolls must be reachable by keyboard (WCAG 2.1.1). Returns true only while the element actually overflows, so short content gets no pointless tab stop. */
export function useScrollFocus(ref: RefObject<HTMLElement | null>): boolean {
  const [scrollable, setScrollable] = useState(false);
  useEffect(() => {
    const element = ref.current;
    if (!element) return;
    const measure = () => setScrollable(element.scrollHeight > element.clientHeight || element.scrollWidth > element.clientWidth);
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(element);
    for (const child of Array.from(element.children)) observer.observe(child);
    return () => observer.disconnect();
  }, [ref]);
  return scrollable;
}

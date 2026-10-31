import {useLayoutEffect, useRef} from "react";
import type {ComponentPropsWithoutRef, Ref} from "react";
import {autoUpdate, flip, offset, shift, size, useFloating} from "@floating-ui/react-dom";

export const overlaySides = ["top", "bottom", "left", "right"] as const;
export const overlayAligns = ["start", "center", "end"] as const;
export type OverlaySide = (typeof overlaySides)[number];
export type OverlayAlign = (typeof overlayAligns)[number];

interface AnchoredPanelOwnProps {
  /** The element the panel is positioned against. Nothing is shown until it is known. */
  anchor: HTMLElement | null;
  /** Whether the panel is shown. The element stays in the DOM, hidden, so a trigger can reference it with `aria-describedby`. */
  open: boolean;
  /** Preferred side. The panel flips to the opposite side when there is not enough room. Defaults to `bottom`. */
  side?: OverlaySide;
  /** Alignment along that side. Defaults to `center`. */
  align?: OverlayAlign;
  /** Space between the anchor and the panel in px. Defaults to `6`. */
  gap?: number;
  ref?: Ref<HTMLDivElement>;
}

export type AnchoredPanelProps = AnchoredPanelOwnProps & Omit<ComponentPropsWithoutRef<"div">, keyof AnchoredPanelOwnProps>;

/**
 * A floating panel positioned against an anchor with Floating UI (flip, shift and size keep it inside the viewport, and it follows
 * scrolling in any ancestor, resizing and layout shifts). It is a manual `popover`, shown with `showPopover()`: the browser puts it in the
 * top layer, so it is never clipped by an ancestor's overflow, needs no portal or z-index, and, being rendered next to its trigger,
 * stays inside an open modal dialog (an element outside a modal dialog would be inert). Manual means the browser adds no light dismiss;
 * the owner decides when the panel closes. The available space is published as `--vl-available-width` and `--vl-available-height`.
 */
export function AnchoredPanel({anchor, open, side = "bottom", align = "center", gap = 6, ref, style, className, children, ...rest}: AnchoredPanelProps) {
  const panelRef = useRef<HTMLDivElement | null>(null);

  // Declared before useFloating so the panel is displayed before Floating UI first measures it.
  useLayoutEffect(() => {
    const panel = panelRef.current;
    if (!panel) return;
    const shown = panel.matches(":popover-open");
    if (open && !shown) panel.showPopover();
    else if (!open && shown) panel.hidePopover();
    // The size limits belong to one opening: a stale limit would stop the next one from seeing that it does not fit and flipping.
    if (!open) { panel.style.removeProperty("--vl-available-width"); panel.style.removeProperty("--vl-available-height"); }
  }, [open]);

  const {refs, floatingStyles, placement, isPositioned} = useFloating({
    open,
    placement: align === "center" ? side : `${side}-${align}`,
    strategy: "fixed",
    elements: {reference: anchor},
    middleware: [
      offset(gap),
      flip({padding: 8}),
      shift({padding: 8}),
      // Not measured while closed (a hidden panel has no size, so the limits would be wrong).
      ...(open ? [size({
        padding: 8,
        apply({availableWidth, availableHeight, elements}) {
          elements.floating.style.setProperty("--vl-available-width", `${Math.max(0, availableWidth)}px`);
          elements.floating.style.setProperty("--vl-available-height", `${Math.max(0, availableHeight)}px`);
        },
      })] : []),
    ],
    whileElementsMounted: open ? autoUpdate : undefined,
  });

  const setPanel = (node: HTMLDivElement | null) => {
    panelRef.current = node;
    refs.setFloating(node);
    if (typeof ref === "function") ref(node); else if (ref) ref.current = node;
  };

  return (
    <div
      {...rest}
      ref={setPanel}
      popover="manual"
      data-side={placement.split("-")[0]}
      className={className ? `vl-anchored ${className}` : "vl-anchored"}
      // Hidden until the first position is known, so it never flashes at the top-left corner.
      style={{...floatingStyles, ...(open && !isPositioned ? {visibility: "hidden"} : null), ...style}}
    >
      {children}
    </div>
  );
}

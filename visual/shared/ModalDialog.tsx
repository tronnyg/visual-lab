import {useCallback, useEffect, useId, useRef} from "react";
import type {ComponentPropsWithoutRef, ReactNode, Ref} from "react";
import {useScrollFocus} from "./useScrollFocus";

interface ModalDialogOwnProps {
  open: boolean;
  /** Asked to change the state: Escape, backdrop, the close button, or the browser closing the dialog itself. */
  onOpenChange: (open: boolean) => void;
  title: string;
  description?: string;
  children?: ReactNode;
  /** Defaults to `true`. */
  closeOnBackdrop?: boolean;
  /** Defaults to `true`. */
  closeOnEscape?: boolean;
  /** Defaults to `true`. */
  showCloseButton?: boolean;
  ref?: Ref<HTMLDialogElement>;
}

export type ModalDialogProps = ModalDialogOwnProps & Omit<ComponentPropsWithoutRef<"dialog">, keyof ModalDialogOwnProps | "open">;

/**
 * The modal lifecycle shared by Dialog and Drawer: a native `<dialog>` opened with `showModal()` from an effect, so the browser provides
 * the top layer, the inert page behind it, the focus trap and Escape handling. This adds what the browser does not: state in step
 * with the element, optional dismissal by Escape and backdrop, focus return, and the labelled header and close button.
 * The content stays mounted while closed (the closed dialog is `display: none`), so state inside it survives.
 */
export function ModalDialog({open, onOpenChange, title, description, children, closeOnBackdrop = true, closeOnEscape = true, showCloseButton = true, className, ref, onClick, onKeyDown, onMouseDown, ...rest}: ModalDialogProps) {
  const baseId = useId();
  const dialogRef = useRef<HTMLDialogElement | null>(null);
  const bodyRef = useRef<HTMLDivElement>(null);
  const previousFocus = useRef<HTMLElement | null>(null);
  const pressedBackdrop = useRef(false);
  const openRef = useRef(open);
  openRef.current = open;
  const scrollable = useScrollFocus(bodyRef);

  const setDialog = useCallback((node: HTMLDialogElement | null) => {
    dialogRef.current = node;
    if (typeof ref === "function") ref(node); else if (ref) ref.current = node;
  }, [ref]);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    if (open && !dialog.open) {
      previousFocus.current = document.activeElement instanceof HTMLElement ? document.activeElement : null;
      dialog.showModal();
    } else if (!open && dialog.open) {
      dialog.close();
      // The browser returns focus to the opener itself; this covers browsers that do not focus a button on click.
      const target = previousFocus.current;
      if (target?.isConnected && (!document.activeElement || document.activeElement === document.body)) target.focus();
    }
  }, [open]);

  return (
    <dialog
      {...rest}
      ref={setDialog}
      aria-labelledby={rest["aria-labelledby"] ?? `${baseId}-title`}
      aria-describedby={rest["aria-describedby"] ?? (description ? `${baseId}-description` : undefined)}
      className={className ? `vl-modal ${className}` : "vl-modal"}
      // Escape is handled on the key itself so a nested overlay that already used it (defaultPrevented) keeps the dialog open, and so a
      // repeated Escape cannot make Chromium close the dialog behind the parent's back. `cancel` is left for other close requests.
      onKeyDown={event => {
        onKeyDown?.(event);
        if (event.key !== "Escape" || event.defaultPrevented || event.nativeEvent.isComposing) return;
        event.preventDefault();
        if (closeOnEscape && openRef.current) onOpenChange(false);
      }}
      onCancel={event => { event.preventDefault(); if (closeOnEscape && openRef.current) onOpenChange(false); }}
      // The browser closed it anyway (a repeated Escape, a form with method=dialog): report it, and reopen if the parent kept it open.
      onClose={() => {
        const dialog = dialogRef.current;
        if (!openRef.current || !dialog || dialog.open) return;
        onOpenChange(false);
        requestAnimationFrame(() => { if (openRef.current && dialogRef.current && !dialogRef.current.open) dialogRef.current.showModal(); });
      }}
      // A click on the dialog element itself, outside its panel, is a click on the backdrop. It only counts when the press started there too,
      // so selecting text or dragging a slider out of the panel does not dismiss.
      onMouseDown={event => { onMouseDown?.(event); pressedBackdrop.current = event.target === event.currentTarget; }}
      onClick={event => {
        onClick?.(event);
        const pressed = pressedBackdrop.current;
        pressedBackdrop.current = false;
        if (closeOnBackdrop && pressed && event.target === event.currentTarget) onOpenChange(false);
      }}
    >
      <div className="vl-modal__panel" data-closable={showCloseButton ? "true" : undefined}>
        <div className="vl-modal__header">
          <h2 id={`${baseId}-title`} className="vl-modal__title">{title}</h2>
          {description && <p id={`${baseId}-description`} className="vl-modal__description">{description}</p>}
        </div>
        <div ref={bodyRef} className="vl-modal__body" tabIndex={scrollable ? 0 : undefined}>{children}</div>
        {/* After the content, so the first thing to receive focus is the content's first control rather than Close. */}
        {showCloseButton && <button type="button" className="vl-modal__close" aria-label="Close" onClick={() => onOpenChange(false)}><span aria-hidden="true" /></button>}
      </div>
    </dialog>
  );
}

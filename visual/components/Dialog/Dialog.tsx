import type {ComponentPropsWithoutRef, ReactNode, Ref} from "react";
import {useControllableState} from "../../shared/useControllableState";
import {ModalDialog} from "../../shared/ModalDialog";
import {TriggerSlot} from "../../shared/TriggerSlot";

interface DialogOwnProps {
  /** Whether the dialog is open. Makes the component controlled. */
  open?: boolean;
  /** Whether the dialog starts open when uncontrolled. Defaults to `false`. */
  defaultOpen?: boolean;
  /** Called with the new state when the user opens (trigger) or dismisses the dialog (close button, Escape, backdrop), never on first render. */
  onOpenChange?: (open: boolean) => void;
  /** An element that opens the dialog, usually a button. Plain text becomes a button. Omit it to open the dialog only through `open`. */
  trigger?: ReactNode;
  /** The dialog's accessible name and visible heading. */
  title: string;
  /** Supporting text under the title; also the accessible description. */
  description?: string;
  /** The dialog's content. It stays mounted while the dialog is closed. */
  children: ReactNode;
  /** Whether a click outside the panel dismisses the dialog. Defaults to `true`. */
  closeOnBackdrop?: boolean;
  /** Whether Escape dismisses the dialog. Defaults to `true`. */
  closeOnEscape?: boolean;
  /** Whether the corner close button is shown. Defaults to `true`. */
  showCloseButton?: boolean;
  ref?: Ref<HTMLDialogElement>;
}

export type DialogProps = DialogOwnProps & Omit<ComponentPropsWithoutRef<"dialog">, keyof DialogOwnProps | "open">;

/**
 * Modal content that needs the user's attention, in a native `<dialog>` opened with `showModal()`: the browser makes the page behind it
 * inert, traps focus, handles Escape and puts it in the top layer, so there is no portal or z-index. Focus moves into the dialog when it
 * opens and returns to the element that had it when it closes. It is a container, not a workflow: confirm and cancel buttons are yours.
 */
export function Dialog({open, defaultOpen, onOpenChange, trigger, title, description, children, closeOnBackdrop, closeOnEscape, showCloseButton, className, ref, ...rest}: DialogProps) {
  const [isOpen, setOpen] = useControllableState<boolean>({value: open, defaultValue: defaultOpen ?? false, onChange: onOpenChange});
  return (
    <>
      {trigger != null && <TriggerSlot triggerAttrs={{"aria-haspopup": "dialog"}} onClick={() => { if (!isOpen) setOpen(true); }}>{trigger}</TriggerSlot>}
      <ModalDialog
        {...rest}
        ref={ref}
        className={className ? `vl-dialog ${className}` : "vl-dialog"}
        open={isOpen}
        onOpenChange={setOpen}
        title={title}
        description={description}
        closeOnBackdrop={closeOnBackdrop}
        closeOnEscape={closeOnEscape}
        showCloseButton={showCloseButton}
      >
        {children}
      </ModalDialog>
    </>
  );
}

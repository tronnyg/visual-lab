import type {ComponentPropsWithoutRef, ReactNode, Ref} from "react";
import {useControllableState} from "../../shared/useControllableState";
import {ModalDialog} from "../../shared/ModalDialog";
import {TriggerSlot} from "../../shared/TriggerSlot";

export const drawerSides = ["left", "right", "top", "bottom"] as const;
export type DrawerSide = (typeof drawerSides)[number];

interface DrawerOwnProps {
  /** Whether the drawer is open. Makes the component controlled. */
  open?: boolean;
  /** Whether the drawer starts open when uncontrolled. Defaults to `false`. */
  defaultOpen?: boolean;
  /** Called with the new state when the user opens (trigger) or dismisses the drawer (close button, Escape, backdrop), never on first render. */
  onOpenChange?: (open: boolean) => void;
  /** An element that opens the drawer, usually a button. Plain text becomes a button. Omit it to open the drawer only through `open`. */
  trigger?: ReactNode;
  /** The drawer's accessible name and visible heading. */
  title: string;
  /** Supporting text under the title; also the accessible description. */
  description?: string;
  /** The drawer's content. It stays mounted while the drawer is closed and scrolls when it is taller than the drawer. */
  children: ReactNode;
  /** The edge the panel is attached to. Defaults to `right`. */
  side?: DrawerSide;
  /** Whether a click outside the panel dismisses the drawer. Defaults to `true`. */
  closeOnBackdrop?: boolean;
  /** Whether Escape dismisses the drawer. Defaults to `true`. */
  closeOnEscape?: boolean;
  /** Whether the corner close button is shown. Defaults to `true`. */
  showCloseButton?: boolean;
  ref?: Ref<HTMLDialogElement>;
}

export type DrawerProps = DrawerOwnProps & Omit<ComponentPropsWithoutRef<"dialog">, keyof DrawerOwnProps | "open">;

/**
 * A modal panel attached to an edge of the viewport. It is the same container as Dialog (a native `<dialog>` opened with `showModal()`:
 * inert page, focus trap, Escape, top layer, focus return) with a different presentation, not a different accessibility model.
 * Use Dialog for centred content that needs a decision; use a Drawer for supporting content such as details, filters or navigation.
 */
export function Drawer({open, defaultOpen, onOpenChange, trigger, title, description, children, side = "right", closeOnBackdrop, closeOnEscape, showCloseButton, className, ref, ...rest}: DrawerProps) {
  const [isOpen, setOpen] = useControllableState<boolean>({value: open, defaultValue: defaultOpen ?? false, onChange: onOpenChange});
  return (
    <>
      {trigger != null && <TriggerSlot triggerAttrs={{"aria-haspopup": "dialog"}} onClick={() => { if (!isOpen) setOpen(true); }}>{trigger}</TriggerSlot>}
      <ModalDialog
        {...rest}
        ref={ref}
        data-side={side}
        className={className ? `vl-drawer ${className}` : "vl-drawer"}
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

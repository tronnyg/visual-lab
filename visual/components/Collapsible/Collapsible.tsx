import {useId} from "react";
import type {ComponentPropsWithoutRef, ReactNode, Ref} from "react";
import {useControllableState} from "../../shared/useControllableState";

export const collapsibleVariants = ["plain", "bordered"] as const;
export type CollapsibleVariant = (typeof collapsibleVariants)[number];

interface CollapsibleOwnProps {
  /** Text on the built-in trigger button. */
  title: string;
  /** The region's content. It stays mounted while collapsed. */
  children?: ReactNode;
  /** Whether the region is open. Makes the component controlled. */
  open?: boolean;
  /** Whether the region starts open when uncontrolled. Defaults to `false`. */
  defaultOpen?: boolean;
  /** Called with the new state when the user toggles the trigger (not on first render). */
  onOpenChange?: (open: boolean) => void;
  /** The trigger cannot be toggled or focused. */
  disabled?: boolean;
  /** `plain` is a bare trigger and region; `bordered` puts them in a bordered surface. Defaults to `plain`. */
  variant?: CollapsibleVariant;
  ref?: Ref<HTMLDivElement>;
}

export type CollapsibleProps = CollapsibleOwnProps & Omit<ComponentPropsWithoutRef<"div">, keyof CollapsibleOwnProps>;

/**
 * One labeled region that a native button shows and hides (`aria-expanded`, `aria-controls`; Enter and Space are native).
 * The content stays mounted when collapsed, so it keeps its state; the collapsed region uses `hidden`, which removes it from the
 * tab order and the accessibility tree.
 */
export function Collapsible({title, children, open, defaultOpen, onOpenChange, disabled, variant, className, id, ref, ...rest}: CollapsibleProps) {
  const generatedId = useId();
  const baseId = id ?? generatedId;
  const [isOpen, setOpen] = useControllableState<boolean>({value: open, defaultValue: defaultOpen ?? false, onChange: onOpenChange});
  const triggerId = `${baseId}-trigger`;
  const panelId = `${baseId}-panel`;
  return (
    <div {...rest} ref={ref} id={id} className={className ? `vl-collapsible ${className}` : "vl-collapsible"} data-variant={variant ?? "plain"} data-state={isOpen ? "open" : "closed"}>
      <button type="button" id={triggerId} className="vl-collapsible__trigger" aria-expanded={isOpen} aria-controls={panelId} disabled={disabled} onClick={() => setOpen(!isOpen)}>
        <span className="vl-collapsible__title">{title}</span>
        <span className="vl-collapsible__chevron" aria-hidden="true" />
      </button>
      <div id={panelId} className="vl-collapsible__panel" role="region" aria-labelledby={triggerId} hidden={!isOpen}>
        <div className="vl-collapsible__content">{children}</div>
      </div>
    </div>
  );
}

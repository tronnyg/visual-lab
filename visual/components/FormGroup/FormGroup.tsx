import {useId} from "react";
import type {ComponentPropsWithoutRef, ReactNode, Ref} from "react";
import {Icon} from "../Icon/Icon";

export const formGroupOrientations = ["vertical", "horizontal"] as const;
export type FormGroupOrientation = (typeof formGroupOrientations)[number];

interface FormGroupOwnProps {
  /** The group's visible name: the `<legend>` of a native `<fieldset>`. */
  legend: string;
  /** Help text for the whole group. The group is described by it. */
  description?: string;
  /** Error for the whole group. The group is described by it, with an icon and the text "Error:" so it does not rely on colour. */
  error?: string;
  /** Shows that the group needs an answer: an asterisk (hidden from assistive technology) and "required" in the legend's accessible text. It does not set `required` on the controls inside. */
  required?: boolean;
  /** Disables every control inside, natively (`<fieldset disabled>`). */
  disabled?: boolean;
  /** Direction of the controls: one under another, or in a wrapping row. Defaults to `vertical`. */
  orientation?: FormGroupOrientation;
  /** The related controls. */
  children: ReactNode;
  ref?: Ref<HTMLFieldSetElement>;
}

export type FormGroupProps = FormGroupOwnProps & Omit<ComponentPropsWithoutRef<"fieldset">, keyof FormGroupOwnProps>;

/**
 * Related controls under one name: a native `<fieldset>` with a `<legend>`, so assistive technology announces the group when focus enters it,
 * and `disabled` disables every control inside without any script. The description and error are the fieldset's `aria-describedby`.
 * It is semantic grouping, not a layout engine: the controls sit in a vertical column or a wrapping row. A control with its own
 * label inside, such as a Checkbox or Switch, keeps it; use Field around a single control that needs a label above it.
 */
export function FormGroup({legend, description, error, required, disabled, orientation = "vertical", children, className, id, ref, "aria-describedby": describedBy, ...rest}: FormGroupProps) {
  const baseId = useId();
  const descriptionId = `${id ?? baseId}-description`;
  const errorId = `${id ?? baseId}-error`;
  const describedby = [describedBy, description ? descriptionId : undefined, error ? errorId : undefined].filter(Boolean).join(" ") || undefined;
  return (
    <fieldset {...rest} id={id} ref={ref} disabled={disabled} aria-describedby={describedby} className={className ? `vl-form-group ${className}` : "vl-form-group"} data-invalid={error ? true : undefined}>
      <legend className="vl-form-group__legend">
        {legend}
        {required && (
          <>
            <span className="vl-form-group__required" aria-hidden="true"> *</span>
            <span className="vl-form-group__sr"> (required)</span>
          </>
        )}
      </legend>
      {description && <p id={descriptionId} className="vl-form-group__description">{description}</p>}
      <div className="vl-form-group__items" data-orientation={orientation}>{children}</div>
      {/* Always present so its id and live region are stable; the message is announced when it appears. */}
      <div id={errorId} className="vl-form-group__error" aria-live="polite">
        {error && (
          <>
            <Icon name="alert-circle" size="sm" />
            <span><span className="vl-form-group__sr">Error: </span>{error}</span>
          </>
        )}
      </div>
    </fieldset>
  );
}

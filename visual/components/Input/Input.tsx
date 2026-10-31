import {useId} from "react";
import type {ChangeEventHandler, ComponentPropsWithRef} from "react";

interface InputOwnProps {
  /** Current text. The input is controlled: it shows exactly this value. */
  value: string;
  /** Called with the native change event; read the new text from `event.target.value`. */
  onChange?: ChangeEventHandler<HTMLInputElement>;
}

// A visible label, or an explicit accessible name, is required by the types.
type InputLabelProps =
  | {label: string; "aria-label"?: string; "aria-labelledby"?: string}
  | {label?: undefined; "aria-label": string; "aria-labelledby"?: string}
  | {label?: undefined; "aria-label"?: string; "aria-labelledby": string};

export type InputProps = InputOwnProps &
  InputLabelProps &
  Omit<ComponentPropsWithRef<"input">, "value" | "defaultValue" | "onChange" | "type" | "children" | "aria-label" | "aria-labelledby">;

// `className` and `style` apply to the wrapper (the root element); every other prop goes to the native <input>.
export function Input({label, className, style, id, ref, ...rest}: InputProps) {
  const generatedId = useId();
  const inputId = id ?? generatedId;
  // A blank label renders nothing, so it must not count as the field's name: fall back to the placeholder.
  const visibleLabel = label?.trim() ? label : undefined;
  const ariaLabel = rest["aria-label"] ?? (!visibleLabel && !rest["aria-labelledby"] ? rest.placeholder : undefined);
  return (
    <div className={className ? `vl-input ${className}` : "vl-input"} style={style}>
      {visibleLabel && <label className="vl-input__label" htmlFor={inputId}>{visibleLabel}</label>}
      <input {...rest} aria-label={ariaLabel} ref={ref} id={inputId} type="text" className="vl-input__control" />
    </div>
  );
}

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

export function Input({label, className, id, ref, ...rest}: InputProps) {
  const generatedId = useId();
  const inputId = id ?? generatedId;
  return (
    <div className={className ? `vl-input ${className}` : "vl-input"}>
      {label && <label className="vl-input__label" htmlFor={inputId}>{label}</label>}
      <input {...rest} ref={ref} id={inputId} type="text" className="vl-input__control" />
    </div>
  );
}

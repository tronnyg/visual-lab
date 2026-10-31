import type {ChangeEvent, ComponentPropsWithRef} from "react";

interface CheckboxOwnProps {
  /** Current state. The checkbox is controlled: it shows exactly this value. */
  checked: boolean;
  /** Called with the new state when the user toggles the checkbox. */
  onCheckedChange?: (checked: boolean, event: ChangeEvent<HTMLInputElement>) => void;
}

// A visible label, or an explicit accessible name, is required by the types.
type CheckboxLabelProps =
  | {label: string; "aria-label"?: string; "aria-labelledby"?: string}
  | {label?: undefined; "aria-label": string; "aria-labelledby"?: string}
  | {label?: undefined; "aria-label"?: string; "aria-labelledby": string};

export type CheckboxProps = CheckboxOwnProps &
  CheckboxLabelProps &
  Omit<ComponentPropsWithRef<"input">, "checked" | "defaultChecked" | "value" | "defaultValue" | "onChange" | "type" | "children" | "aria-label" | "aria-labelledby">;

// The wrapper is a <label>, so clicking the text toggles the native checkbox. `className` and `style` apply to the wrapper;
// every other prop goes to the native <input type="checkbox">.
export function Checkbox({label, className, style, onCheckedChange, ref, ...rest}: CheckboxProps) {
  // A blank label renders nothing, so it must not count as the field's name: callers then need aria-label/aria-labelledby.
  const visibleLabel = label?.trim() ? label : undefined;
  return (
    <label className={className ? `vl-checkbox ${className}` : "vl-checkbox"} style={style}>
      <input {...rest} ref={ref} type="checkbox" className="vl-checkbox__control" onChange={e => onCheckedChange?.(e.target.checked, e)} />
      {visibleLabel && <span className="vl-checkbox__label">{visibleLabel}</span>}
    </label>
  );
}

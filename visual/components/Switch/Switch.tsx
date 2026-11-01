import type {ChangeEvent, ComponentPropsWithRef} from "react";

interface SwitchOwnProps {
  /** Current state. Makes the switch controlled: it shows exactly this value and only changes when the parent updates it. */
  checked?: boolean;
  /** Initial state when uncontrolled. The browser keeps the state and restores it when the form is reset. */
  defaultChecked?: boolean;
  /** Called with the new state when the user toggles the switch, never on first render. */
  onCheckedChange?: (checked: boolean, event: ChangeEvent<HTMLInputElement>) => void;
}

// A visible label, or an explicit accessible name, is required by the types.
type SwitchLabelProps =
  | {label: string; "aria-label"?: string; "aria-labelledby"?: string}
  | {label?: undefined; "aria-label": string; "aria-labelledby"?: string}
  | {label?: undefined; "aria-label"?: string; "aria-labelledby": string};

export type SwitchProps = SwitchOwnProps &
  SwitchLabelProps &
  Omit<ComponentPropsWithRef<"input">, "checked" | "defaultChecked" | "defaultValue" | "onChange" | "type" | "role" | "children" | "aria-label" | "aria-labelledby">;

/**
 * An on/off control for a setting that takes effect immediately. It is a native `<input type="checkbox" role="switch">`, so Space,
 * label clicks, `disabled`, `required`, `name`/`value` and form reset all come from the browser: a checked switch submits
 * `name=value` (`on` unless `value` is set) and an unchecked one submits nothing, exactly like a checkbox. Use Checkbox for choices
 * in a list or an acknowledgement that is submitted with a form. `className` and `style` apply to the wrapping `<label>`; every other prop goes to the input.
 */
export function Switch({label, className, style, onCheckedChange, checked, defaultChecked, ref, ...rest}: SwitchProps) {
  // A blank label renders nothing, so it must not count as the control's name: callers then need aria-label/aria-labelledby.
  const visibleLabel = label?.trim() ? label : undefined;
  const controlled = checked !== undefined;
  return (
    <label className={className ? `vl-switch ${className}` : "vl-switch"} style={style}>
      <input
        {...rest}
        ref={ref}
        type="checkbox"
        role="switch"
        className="vl-switch__control"
        {...(controlled ? {checked} : {defaultChecked})}
        onChange={event => onCheckedChange?.(event.target.checked, event)}
      />
      {visibleLabel && <span className="vl-switch__label">{visibleLabel}</span>}
    </label>
  );
}

import {useId} from "react";
import type {ChangeEvent, ComponentPropsWithRef} from "react";

export interface RadioGroupOption {
  /** Text shown next to the radio. */
  label: string;
  /** Value reported to `onValueChange` and compared with the group's `value`. */
  value: string;
  /** Disables just this option. */
  disabled?: boolean;
}

interface RadioGroupOwnProps {
  /** Selected option's value. The group is controlled; a value that matches no option leaves every radio unchecked. */
  value: string;
  /** Called with the chosen option's value. */
  onValueChange?: (value: string, event: ChangeEvent<HTMLInputElement>) => void;
  /** The choices, in display order. */
  options: readonly RadioGroupOption[];
  /** Shared `name` of the radios. Defaults to a generated id, so groups never collide. */
  name?: string;
}

// A visible group label (the <legend>), or an explicit accessible name, is required by the types.
type RadioGroupLabelProps =
  | {label: string; "aria-label"?: string; "aria-labelledby"?: string}
  | {label?: undefined; "aria-label": string; "aria-labelledby"?: string}
  | {label?: undefined; "aria-label"?: string; "aria-labelledby": string};

export type RadioGroupProps = RadioGroupOwnProps &
  RadioGroupLabelProps &
  Omit<ComponentPropsWithRef<"fieldset">, "onChange" | "children" | "name" | "aria-label" | "aria-labelledby">;

// A <fieldset> with a <legend> around native radios that share one name, so arrow-key navigation, Tab behavior and label clicks are
// native. `className`, `style`, `disabled` and every other prop go to the <fieldset> (the root element); `disabled` there disables
// every radio natively.
export function RadioGroup({label, value, onValueChange, options, name, className, ref, ...rest}: RadioGroupProps) {
  const generatedName = useId();
  const groupName = name ?? generatedName;
  // A blank label renders nothing, so it must not count as the group's name: callers then need aria-label/aria-labelledby.
  const legend = label?.trim() ? label : undefined;
  return (
    <fieldset {...rest} ref={ref} className={className ? `vl-radio-group ${className}` : "vl-radio-group"}>
      {legend && <legend className="vl-radio-group__legend">{legend}</legend>}
      <div className="vl-radio-group__options">
        {options.map(option => (
          <label key={option.value} className="vl-radio">
            <input
              type="radio"
              className="vl-radio__control"
              name={groupName}
              value={option.value}
              checked={option.value === value}
              disabled={option.disabled}
              onChange={e => { if (e.target.checked) onValueChange?.(option.value, e); }}
            />
            <span className="vl-radio__label">{option.label}</span>
          </label>
        ))}
      </div>
    </fieldset>
  );
}

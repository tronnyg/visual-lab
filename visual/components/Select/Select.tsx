import {useId} from "react";
import type {ChangeEvent, ComponentPropsWithRef} from "react";

export interface SelectOption {
  /** Text shown in the list and in the closed control. */
  label: string;
  /** Value reported to `onValueChange` and compared with the select's `value`. */
  value: string;
  /** Disables just this option. */
  disabled?: boolean;
}

interface SelectOwnProps {
  /** Selected option's value. The select is controlled. */
  value: string;
  /** Called with the chosen option's value. */
  onValueChange?: (value: string, event: ChangeEvent<HTMLSelectElement>) => void;
  /** The choices, in display order. */
  options: readonly SelectOption[];
  /** Shown, and not selectable, while `value` matches no option. Without it the closed control is blank. */
  placeholder?: string;
}

// A visible label, or an explicit accessible name, is required by the types.
type SelectLabelProps =
  | {label: string; "aria-label"?: string; "aria-labelledby"?: string}
  | {label?: undefined; "aria-label": string; "aria-labelledby"?: string}
  | {label?: undefined; "aria-label"?: string; "aria-labelledby": string};

export type SelectProps = SelectOwnProps &
  SelectLabelProps &
  Omit<ComponentPropsWithRef<"select">, "value" | "defaultValue" | "onChange" | "children" | "multiple" | "size" | "aria-label" | "aria-labelledby">;

// A native <select>: the browser provides the popup, keyboard handling and typeahead. `className` and `style` apply to the wrapper
// (the root element); every other prop goes to the <select>.
export function Select({label, value, onValueChange, options, placeholder, className, style, id, ref, ...rest}: SelectProps) {
  const generatedId = useId();
  const selectId = id ?? generatedId;
  // A blank label renders nothing, so it must not count as the field's name: callers then need aria-label/aria-labelledby.
  const visibleLabel = label?.trim() ? label : undefined;
  // Without a matching option the browser would silently display the first one while `value` says otherwise.
  const hasSelection = options.some(option => option.value === value);
  return (
    <div className={className ? `vl-select ${className}` : "vl-select"} style={style}>
      {visibleLabel && <label className="vl-select__label" htmlFor={selectId}>{visibleLabel}</label>}
      <div className="vl-select__field">
        <select
          {...rest}
          ref={ref}
          id={selectId}
          className="vl-select__control"
          value={hasSelection ? value : ""}
          onChange={e => onValueChange?.(e.target.value, e)}
        >
          {!hasSelection && <option value="" disabled hidden>{placeholder ?? ""}</option>}
          {options.map(option => <option key={option.value} value={option.value} disabled={option.disabled}>{option.label}</option>)}
        </select>
      </div>
    </div>
  );
}

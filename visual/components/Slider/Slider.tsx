import {useId} from "react";
import type {ChangeEvent, ComponentPropsWithRef, CSSProperties} from "react";

interface SliderOwnProps {
  /** Current value. The slider is controlled: it shows exactly this value. */
  value: number;
  /** Called with the new number on every change, including while dragging. */
  onValueChange?: (value: number, event: ChangeEvent<HTMLInputElement>) => void;
  /** Lowest value. Default 0. */
  min?: number;
  /** Highest value. Default 100. */
  max?: number;
  /** Increment between values. Default 1. */
  step?: number;
}

// A visible label, or an explicit accessible name, is required by the types.
type SliderLabelProps =
  | {label: string; "aria-label"?: string; "aria-labelledby"?: string}
  | {label?: undefined; "aria-label": string; "aria-labelledby"?: string}
  | {label?: undefined; "aria-label"?: string; "aria-labelledby": string};

export type SliderProps = SliderOwnProps &
  SliderLabelProps &
  Omit<ComponentPropsWithRef<"input">, "value" | "defaultValue" | "onChange" | "type" | "children" | "min" | "max" | "step" | "aria-label" | "aria-labelledby">;

// `className` and `style` apply to the wrapper (the root element); every other prop goes to the native <input type="range">.
// The current value is shown next to the label; it is hidden from assistive tech because the range input already announces it.
export function Slider({label, className, style, id, value, onValueChange, min = 0, max = 100, step, ref, ...rest}: SliderProps) {
  const generatedId = useId();
  const inputId = id ?? generatedId;
  // A blank label renders nothing, so it must not count as the field's name: callers then need aria-label/aria-labelledby.
  const visibleLabel = label?.trim() ? label : undefined;
  // The filled part of the track is drawn from this CSS variable, since native range inputs have no portable "filled" selector.
  const span = max - min;
  const fraction = span > 0 ? Math.min(1, Math.max(0, (value - min) / span)) : 0;
  return (
    <div className={className ? `vl-slider ${className}` : "vl-slider"} style={style}>
      <div className="vl-slider__header">
        {visibleLabel && <label className="vl-slider__label" htmlFor={inputId}>{visibleLabel}</label>}
        <span className="vl-slider__value" aria-hidden="true">{value}</span>
      </div>
      <input
        {...rest}
        ref={ref}
        id={inputId}
        type="range"
        className="vl-slider__control"
        value={value}
        min={min}
        max={max}
        step={step}
        style={{"--vl-slider-fraction": fraction} as CSSProperties}
        onChange={e => onValueChange?.(e.target.valueAsNumber, e)}
      />
    </div>
  );
}

import type {ComponentPropsWithoutRef, Ref} from "react";

interface ProgressOwnProps {
  /** Current value, from 0 to `max`. Values outside that range are clamped; a non-number counts as 0. */
  value: number;
  /** Value at which the bar is full. Must be greater than 0, otherwise it falls back to 100. Defaults to 100. */
  max?: number;
  /** Accessible name, e.g. "Upload progress". Not displayed. Without a name (here, `aria-label` or `aria-labelledby`) the bar is announced as an unlabelled progress bar. */
  label?: string;
  ref?: Ref<HTMLProgressElement>;
}

export type ProgressProps = ProgressOwnProps & Omit<ComponentPropsWithoutRef<"progress">, keyof ProgressOwnProps | "children">;

/** A determinate progress bar built on the native `<progress>` element, which already exposes the progressbar role, value and range. */
export function Progress({value, max, label, className, ...rest}: ProgressProps) {
  const safeMax = typeof max === "number" && Number.isFinite(max) && max > 0 ? max : 100;
  const safeValue = typeof value === "number" && Number.isFinite(value) ? Math.min(Math.max(value, 0), safeMax) : 0;
  return (
    <progress
      {...rest}
      className={className ? `vl-progress ${className}` : "vl-progress"}
      value={safeValue}
      max={safeMax}
      aria-label={label || rest["aria-label"]}
    />
  );
}

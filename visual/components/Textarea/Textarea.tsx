import {useId} from "react";
import type {ChangeEventHandler, ComponentPropsWithRef} from "react";

interface TextareaOwnProps {
  /** Current text. The textarea is controlled: it shows exactly this value. */
  value: string;
  /** Called with the native change event; read the new text from `event.target.value`. */
  onChange?: ChangeEventHandler<HTMLTextAreaElement>;
}

// A visible label, or an explicit accessible name, is required by the types.
type TextareaLabelProps =
  | {label: string; "aria-label"?: string; "aria-labelledby"?: string}
  | {label?: undefined; "aria-label": string; "aria-labelledby"?: string}
  | {label?: undefined; "aria-label"?: string; "aria-labelledby": string};

export type TextareaProps = TextareaOwnProps &
  TextareaLabelProps &
  Omit<ComponentPropsWithRef<"textarea">, "value" | "defaultValue" | "onChange" | "children" | "aria-label" | "aria-labelledby">;

// `className` and `style` apply to the wrapper (the root element); every other prop goes to the native <textarea>.
export function Textarea({label, className, style, id, rows = 3, ref, ...rest}: TextareaProps) {
  const generatedId = useId();
  const textareaId = id ?? generatedId;
  // A blank label renders nothing, so it must not count as the field's name: fall back to the placeholder.
  const visibleLabel = label?.trim() ? label : undefined;
  const ariaLabel = rest["aria-label"] ?? (!visibleLabel && !rest["aria-labelledby"] ? rest.placeholder : undefined);
  return (
    <div className={className ? `vl-textarea ${className}` : "vl-textarea"} style={style}>
      {visibleLabel && <label className="vl-textarea__label" htmlFor={textareaId}>{visibleLabel}</label>}
      <textarea {...rest} aria-label={ariaLabel} ref={ref} id={textareaId} rows={rows} className="vl-textarea__control" />
    </div>
  );
}

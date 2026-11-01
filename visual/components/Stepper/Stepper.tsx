import type {ComponentPropsWithoutRef, Ref} from "react";
import {useControllableState} from "../../shared/useControllableState";
import {Icon} from "../Icon/Icon";

export const stepperOrientations = ["horizontal", "vertical"] as const;
export type StepperOrientation = (typeof stepperOrientations)[number];

export interface StepperItem {
  /** Unique within `steps`. Passed to `onValueChange` and compared with `value`. */
  id: string;
  label: string;
  /** A short line under the label. */
  description?: string;
  /** The step cannot be chosen when the stepper is interactive. */
  disabled?: boolean;
}

interface StepperOwnProps {
  /** The steps, in order. Ids must be unique. */
  steps: readonly StepperItem[];
  /** The current step's id. Makes the stepper controlled. An id that matches no step shows the first step as current. */
  value?: string;
  /** The current step when uncontrolled. Defaults to the first step. */
  defaultValue?: string;
  /** Called with the step's id when the user chooses a step. Only when `interactive`. Never on first render. */
  onValueChange?: (id: string) => void;
  /** Direction of the steps. A horizontal stepper stacks vertically in a container narrower than 30rem. Defaults to `horizontal`. */
  orientation?: StepperOrientation;
  /** Makes each enabled step a button that moves to it. Without it the stepper only shows progress. Defaults to `false`. */
  interactive?: boolean;
  /** Accessible name of the list. Defaults to `Progress`. */
  label?: string;
  ref?: Ref<HTMLOListElement>;
}

export type StepperProps = StepperOwnProps & Omit<ComponentPropsWithoutRef<"ol">, keyof StepperOwnProps | "children">;

type Status = "complete" | "current" | "upcoming";
const statusText: Record<Status, string> = {complete: "Completed", current: "Current step", upcoming: "Not started"};

/**
 * Progress through an ordered process, and optionally navigation between its steps. It shows where you are; it is not a workflow engine:
 * it never validates, advances or branches. The steps before the current one count as completed, the current one is `aria-current="step"`,
 * and the rest are upcoming, so progress follows the order of `steps` and nothing is inferred from outside state.
 *
 * Semantics are an ordered list. State is also text for assistive technology ("Completed", "Current step", "Not started") and not only
 * colour: a completed step shows a check mark, the current one is bold with a ring. When `interactive`, each enabled step is a native
 * button (Tab and Enter/Space), and a disabled step is a disabled button.
 */
export function Stepper({steps, value, defaultValue, onValueChange, orientation = "horizontal", interactive = false, label = "Progress", className, ref, ...rest}: StepperProps) {
  const [current, setCurrent] = useControllableState<string>({value, defaultValue: defaultValue ?? steps[0]?.id ?? "", onChange: onValueChange});
  const found = steps.findIndex(step => step.id === current);
  const currentIndex = found === -1 ? 0 : found;
  return (
    <div className={className ? `vl-stepper ${className}` : "vl-stepper"} data-orientation={orientation}>
      <ol {...rest} ref={ref} aria-label={label} className="vl-stepper__list">
        {steps.map((step, index) => {
          const status: Status = index < currentIndex ? "complete" : index === currentIndex ? "current" : "upcoming";
          const content = (
            <>
              <span className="vl-stepper__indicator" aria-hidden="true">{status === "complete" ? <Icon name="check" size="sm" /> : index + 1}</span>
              <span className="vl-stepper__text">
                <span className="vl-stepper__label"><span className="vl-stepper__sr">{statusText[status]}: </span>{step.label}</span>
                {step.description && <span className="vl-stepper__description">{step.description}</span>}
              </span>
            </>
          );
          const chooses = interactive && !step.disabled;
          return (
            <li key={step.id} className="vl-stepper__step" data-status={status} data-disabled={step.disabled || undefined} aria-current={!chooses && status === "current" ? "step" : undefined}>
              {interactive ? (
                <button type="button" className="vl-stepper__item" disabled={step.disabled} aria-current={status === "current" ? "step" : undefined} onClick={() => setCurrent(step.id)}>{content}</button>
              ) : (
                <div className="vl-stepper__item">{content}</div>
              )}
            </li>
          );
        })}
      </ol>
    </div>
  );
}

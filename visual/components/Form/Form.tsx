import type {ComponentPropsWithoutRef, FormEvent, ReactNode, Ref} from "react";

interface FormOwnProps {
  /** The controls and layout: any components, including Stack, Grid, Card, Field and FormGroup. */
  children: ReactNode;
  /**
   * Called with the form's values when it is submitted and the browser's constraint validation passed (or `noValidate` is set). The values
   * are a native `FormData` taken with the submitter, so a named submit button is included. Nothing is sent anywhere: the page does not
   * navigate and no request is made, and what happens next is up to the consumer.
   */
  onSubmit?: (values: FormData, event: FormEvent<HTMLFormElement>) => void;
  /** Called when a reset button is pressed, before the browser restores its controls. Call `event.preventDefault()` to cancel the reset. */
  onReset?: (event: FormEvent<HTMLFormElement>) => void;
  /** Skips the browser's constraint validation on submit, so `onSubmit` runs even when a control is invalid. Defaults to `false`. */
  noValidate?: boolean;
  /** Disables every control inside, natively (`<fieldset disabled>`). Disabled controls are not part of the submitted values. */
  disabled?: boolean;
  ref?: Ref<HTMLFormElement>;
}

// A form never sends itself: the submission target attributes are not part of the contract.
export type FormProps = FormOwnProps & Omit<ComponentPropsWithoutRef<"form">, keyof FormOwnProps | "action" | "method" | "encType" | "target" | "acceptCharset">;

/**
 * A native `<form>` that collects its controls' values and hands them to `onSubmit`, and nothing more. There is no field registry, form
 * store, validation schema or submission layer: the browser does the work. Enter submits from a text field when the form has a submit button, a
 * `type="submit"` button submits, a `type="reset"` button resets, and `required`, `pattern`, `min`, `max` and the like are checked by the
 * browser before `onSubmit` runs. Show errors with Field and FormGroup, which take the message you give them.
 *
 * Submission never navigates: the event is always cancelled, so a form without `onSubmit` is a validating container that does nothing else.
 * Uncontrolled controls restore themselves on reset; controlled ones follow their state, so reset it in `onReset`.
 * Give the form an accessible name (`aria-label` or `aria-labelledby`) when it is a landmark that people should be able to find.
 */
export function Form({children, onSubmit, onReset, noValidate = false, disabled, className, ref, ...rest}: FormProps) {
  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    // Always: a native submission would navigate away or reload the page.
    event.preventDefault();
    if (disabled) return;
    const form = event.currentTarget;
    const submitter = (event.nativeEvent as SubmitEvent).submitter as HTMLElement | null;
    let values: FormData;
    try {
      values = new FormData(form, submitter);
    } catch {
      values = new FormData(form); // an older browser without the submitter argument
    }
    onSubmit?.(values, event);
  }

  return (
    <form {...rest} ref={ref} noValidate={noValidate} className={className ? `vl-form ${className}` : "vl-form"} onSubmit={handleSubmit} onReset={onReset}>
      {/* A native fieldset disables everything inside it. Its group role is dropped: it is not a group of related controls. */}
      <fieldset className="vl-form__body" role="presentation" disabled={disabled}>{children}</fieldset>
    </form>
  );
}

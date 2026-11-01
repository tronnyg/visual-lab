import {useId, useLayoutEffect, useRef, useState} from "react";
import type {ComponentPropsWithoutRef, ReactNode, Ref} from "react";
import {Icon} from "../Icon/Icon";

interface FieldOwnProps {
  /** Visible label. It names the control. */
  label: string;
  /** Help text under the control. The control is described by it. */
  description?: string;
  /** Error message under the control. While set, the control is `aria-invalid` and described by it. Pass nothing for no error. */
  error?: string;
  /** Marks the control as required: an asterisk beside the label, and the native `required` attribute on a text-like control that lacks it. */
  required?: boolean;
  /** Disables every control inside (a native `<fieldset disabled>`) and dims the label. */
  disabled?: boolean;
  /**
   * The `id` of the control to label, for a child whose control is not the first text-like control inside it. Without it Field uses the first
   * input, select or textarea (radio buttons excluded: use FormGroup for a set of them) and gives it an id when it has none.
   */
  controlId?: string;
  /** The control, or markup containing exactly one control. */
  children: ReactNode;
  ref?: Ref<HTMLDivElement>;
}

export type FieldProps = FieldOwnProps & Omit<ComponentPropsWithoutRef<"div">, keyof FieldOwnProps>;

// The first control that a <label for> can name and that a person fills in on its own. Radios are excluded: a set of them is a group.
const controlSelector = '.vl-field__control :is(input:not([type="hidden"]):not([type="radio"]), select, textarea)';
const textLike = (element: Element) => element instanceof HTMLSelectElement || element instanceof HTMLTextAreaElement || (element instanceof HTMLInputElement && !["checkbox", "file", "range", "color"].includes(element.type));

interface Claim { element: Element; name: string; tokens: string[]; flag?: boolean }

/**
 * One labelled control with an optional description and error. It composes real relationships and holds no form state: the label is a
 * `<label for>` pointing at the control, the description and error are added to the control's `aria-describedby`, an error sets
 * `aria-invalid`, and `required` and `disabled` reach the control. Field is not a validation engine: it shows the message it is given.
 *
 * The control can be any component, including ones that cannot take props (OpenUI nodes), so the relationships are written to the
 * DOM in a layout effect after every commit, as TriggerSlot does for its trigger. Nothing is overwritten: an existing `id` is kept
 * (and used for the label), ids are appended to an existing `aria-describedby`, an existing `aria-invalid` or `required` is left alone, and an
 * `aria-label` the child falls back on is outranked by the visible label through `aria-labelledby`. Everything Field added is
 * taken away again on the next commit and on unmount. If no control is found the label is plain text rather than a label that names nothing.
 */
export function Field({label, description, error, required, disabled, controlId, children, className, id, ref, ...rest}: FieldProps) {
  const baseId = useId();
  const labelId = `${id ?? baseId}-label`;
  const descriptionId = `${id ?? baseId}-description`;
  const errorId = `${id ?? baseId}-error`;
  const rootRef = useRef<HTMLDivElement | null>(null);
  const claims = useRef<Claim[]>([]);
  const [target, setTarget] = useState<string | undefined>(controlId);

  function release() {
    for (const {element, name, tokens, flag} of claims.current) {
      if (flag) { element.removeAttribute(name); continue; }
      const left = (element.getAttribute(name) ?? "").split(/\s+/).filter(token => token && !tokens.includes(token));
      if (left.length) element.setAttribute(name, left.join(" ")); else element.removeAttribute(name);
    }
    claims.current = [];
  }

  // Runs after every commit: the control's own markup can change (streamed OpenUI, state in the child) without Field re-rendering.
  useLayoutEffect(() => {
    release();
    const root = rootRef.current;
    const control = root && (controlId ? root.querySelector<HTMLElement>(`[id="${CSS.escape(controlId)}"]`) : root.querySelector<HTMLElement>(controlSelector));
    if (!control) { setTarget(undefined); return; }
    if (!control.id) control.id = `${baseId}-control`;
    setTarget(control.id);

    const add = (name: string, tokens: string[]) => {
      const before = (control.getAttribute(name) ?? "").split(/\s+/).filter(Boolean);
      const fresh = tokens.filter(token => !before.includes(token));
      if (!fresh.length) return;
      control.setAttribute(name, [...before, ...fresh].join(" "));
      claims.current.push({element: control, name, tokens: fresh});
    };
    // The visible label outranks a generic aria-label the child fell back on, but never an aria-labelledby it set itself.
    if (control.hasAttribute("aria-label") && !control.hasAttribute("aria-labelledby")) add("aria-labelledby", [labelId]);
    add("aria-describedby", [...(description ? [descriptionId] : []), ...(error ? [errorId] : [])]);
    if (error && !control.hasAttribute("aria-invalid")) add("aria-invalid", ["true"]);
    if (required && textLike(control) && !control.hasAttribute("required")) {
      control.setAttribute("required", "");
      claims.current.push({element: control, name: "required", tokens: [], flag: true});
    }
    return release;
  });

  const LabelTag = target ? "label" : "span";
  return (
    <div
      {...rest}
      id={id}
      ref={node => { rootRef.current = node; if (typeof ref === "function") ref(node); else if (ref) ref.current = node; }}
      className={className ? `vl-field ${className}` : "vl-field"}
      data-disabled={disabled || undefined}
      data-invalid={error ? true : undefined}
    >
      <LabelTag id={labelId} className="vl-field__label" {...(target ? {htmlFor: target} : null)}>
        {label}
        {required && <span className="vl-field__required" aria-hidden="true"> *</span>}
      </LabelTag>
      {/* A native fieldset disables everything inside it. Its group role is dropped: it is not a group of related controls. */}
      <fieldset className="vl-field__control" role="presentation" disabled={disabled}>{children}</fieldset>
      {description && <p id={descriptionId} className="vl-field__description">{description}</p>}
      {/* Always present so its id and live region are stable; the message is announced when it appears. */}
      <div id={errorId} className="vl-field__error" aria-live="polite">
        {error && (
          <>
            <Icon name="alert-circle" size="sm" />
            <span><span className="vl-field__sr">Error: </span>{error}</span>
          </>
        )}
      </div>
    </div>
  );
}

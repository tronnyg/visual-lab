import {useEffect, useId, useRef, useState} from "react";
import type {ChangeEvent, ComponentPropsWithoutRef, KeyboardEvent, Ref} from "react";
import {AnchoredPanel} from "../../shared/AnchoredPanel";
import {useEscapeDismiss, useOutsideDismiss} from "../../shared/dismiss";
import {useFormReset} from "../../shared/useFormReset";
import {idPart} from "../../shared/idPart";
import {Icon} from "../Icon/Icon";

export interface ComboboxOption {
  /** Reported to `onValueChange`, matched by search and submitted with the form. Unique within `options`. */
  value: string;
  /** Text shown in the list and in the closed field. */
  label: string;
  /** Shown dimmed and cannot be chosen. */
  disabled?: boolean;
  /** Secondary line under the label. It is part of the option's accessible name but is not searched. */
  description?: string;
}

interface ComboboxOwnProps {
  /** The choices, in display order. */
  options: readonly ComboboxOption[];
  /** The chosen option's value, or "" for none. Makes the combobox controlled. */
  value?: string;
  /** Initial value when uncontrolled. Form reset restores it. */
  defaultValue?: string;
  /** Called with the chosen option's value, or "" when the selection is cleared. User changes only, never on first render. */
  onValueChange?: (value: string) => void;
  /** Shown in the closed field while nothing is chosen. */
  placeholder?: string;
  /** Shown in the field while the list is open and nothing has been typed. Defaults to `placeholder`. */
  searchPlaceholder?: string;
  /** Text for an empty search. Defaults to `No results`. */
  emptyMessage?: string;
  /** Form field name. A hidden input with this name submits the chosen option's `value`. */
  name?: string;
  ref?: Ref<HTMLInputElement>;
}

// A visible label, or an explicit accessible name, is required by the types.
type ComboboxLabelProps =
  | {label: string; "aria-label"?: string; "aria-labelledby"?: string}
  | {label?: undefined; "aria-label": string; "aria-labelledby"?: string}
  | {label?: undefined; "aria-label"?: string; "aria-labelledby": string};

export type ComboboxProps = ComboboxOwnProps &
  ComboboxLabelProps &
  Omit<ComponentPropsWithoutRef<"input">, keyof ComboboxOwnProps | "type" | "children" | "aria-label" | "aria-labelledby" | "defaultChecked" | "checked" | "onChange" | "min" | "max">;

const matches = (option: ComboboxOption, query: string) => `${option.label} ${option.value}`.toLowerCase().includes(query);

/**
 * Searches a list and chooses one option: the WAI-ARIA editable combobox with list autocomplete. DOM focus stays in the text field
 * for the whole interaction, and the highlighted option is `aria-activedescendant`, so typing and arrow keys never compete.
 * Arrow Down/Up open the list and move the highlight (wrapping, skipping disabled options), typing filters by label and value,
 * Enter chooses the highlighted option, Escape closes and restores the chosen label, Tab or a press elsewhere closes. Home and End keep
 * their text-editing meaning. The listbox is the shared anchored panel, in the top layer.
 *
 * The visible input holds the label and has no name; a hidden input named `name` submits the chosen `value` (and nothing for a value
 * that matches no option). `required` is native on the visible input, which is empty exactly when nothing is chosen.
 * `className` and `style` apply to the wrapper; other props go to the visible input.
 */
export function Combobox({
  options, label, value, defaultValue, onValueChange, placeholder, searchPlaceholder, emptyMessage = "No results", name, className, style, id, disabled, required, onKeyDown, ref, ...inputProps
}: ComboboxProps) {
  const generatedId = useId();
  const inputId = id ?? generatedId;
  const listboxId = `${generatedId}-listbox`;
  const controlled = value !== undefined;
  const [inner, setInner] = useState(defaultValue ?? "");
  const current = controlled ? value : inner;
  const [isOpen, setOpen] = useState(false);
  const [query, setQuery] = useState<string | null>(null);
  const [activeValue, setActiveValue] = useState<string | null>(null);
  const [field, setField] = useState<HTMLDivElement | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);
  const panelRef = useRef<HTMLDivElement | null>(null);

  const selected = options.find(option => option.value === current);
  const needle = query?.trim().toLowerCase() ?? "";
  const visible = needle ? options.filter(option => matches(option, needle)) : options;
  const enabled = visible.filter(option => !option.disabled);
  // The highlight must be an option that is still listed and enabled.
  const active = enabled.find(option => option.value === activeValue);
  const optionId = (option: ComboboxOption) => `${generatedId}-option-${idPart(option.value)}`;
  const visibleLabel = label?.trim() ? label : undefined;

  useFormReset(inputRef, () => { if (!controlled) { setInner(defaultValue ?? ""); close(); } });

  function commit(next: string) {
    if (!controlled) setInner(next);
    onValueChange?.(next);
  }

  function close() { setOpen(false); setQuery(null); }
  function openList(where: "selected" | "first" | "last" = "selected") {
    if (disabled) return;
    const list = options.filter(option => !option.disabled);
    setOpen(true);
    setActiveValue((where === "last" ? list[list.length - 1] : where === "first" ? list[0] : list.find(option => option.value === current) ?? list[0])?.value ?? null);
  }
  function choose(option: ComboboxOption) {
    if (option.disabled) return;
    commit(option.value);
    close();
  }
  function move(step: 1 | -1) {
    if (!enabled.length) return;
    const index = active ? enabled.indexOf(active) : step === 1 ? -1 : 0;
    setActiveValue(enabled[(index + step + enabled.length) % enabled.length].value);
  }

  useEscapeDismiss(isOpen, close);
  useOutsideDismiss(isOpen, () => [field, panelRef.current], close);

  // Keep the highlighted option in view as the keyboard moves it through a long list.
  useEffect(() => {
    if (isOpen && active) document.getElementById(optionId(active))?.scrollIntoView({block: "nearest"});
  });

  function onInputChange(event: ChangeEvent<HTMLInputElement>) {
    setQuery(event.target.value);
    setOpen(true);
    const first = options.filter(option => !option.disabled && matches(option, event.target.value.trim().toLowerCase()))[0];
    setActiveValue(first?.value ?? null);
  }

  function onInputKeyDown(event: KeyboardEvent<HTMLInputElement>) {
    onKeyDown?.(event);
    if (event.defaultPrevented || event.nativeEvent.isComposing) return;
    if (event.key === "ArrowDown") { event.preventDefault(); if (isOpen) move(1); else openList(); }
    else if (event.key === "ArrowUp") { event.preventDefault(); if (isOpen) move(-1); else openList(selected ? "selected" : "last"); }
    // Enter chooses while the list is open (and never submits the form then); with the list closed it is the form's own implicit submission.
    else if (event.key === "Enter" && isOpen) { event.preventDefault(); if (active) choose(active); }
  }

  const text = query ?? selected?.label ?? "";
  const status = !isOpen ? "" : visible.length === 0 ? emptyMessage : `${visible.length} ${visible.length === 1 ? "option" : "options"} available`;
  const canClear = !!selected && !required && !disabled;
  return (
    <div className={className ? `vl-combobox ${className}` : "vl-combobox"} style={style}>
      {visibleLabel && <label className="vl-combobox__label" htmlFor={inputId}>{visibleLabel}</label>}
      <div className="vl-combobox__field" ref={setField} data-disabled={disabled || undefined}>
        <input
          {...inputProps}
          ref={node => { inputRef.current = node; if (typeof ref === "function") ref(node); else if (ref) ref.current = node; }}
          id={inputId}
          type="text"
          role="combobox"
          autoComplete="off"
          className="vl-combobox__control"
          value={text}
          placeholder={isOpen ? searchPlaceholder ?? placeholder : placeholder}
          disabled={disabled}
          required={required}
          aria-autocomplete="list"
          aria-expanded={isOpen}
          aria-controls={isOpen ? listboxId : undefined}
          aria-activedescendant={isOpen && active ? optionId(active) : undefined}
          onChange={onInputChange}
          onClick={() => { if (!isOpen) openList(); }}
          onKeyDown={onInputKeyDown}
        />
        {canClear && (
          <button
            type="button"
            tabIndex={-1}
            className="vl-combobox__button vl-combobox__clear"
            aria-label="Clear selection"
            onMouseDown={event => event.preventDefault()}
            onClick={() => { commit(""); close(); inputRef.current?.focus(); }}
          >
            <Icon name="x" size="xs" />
          </button>
        )}
        <button
          type="button"
          tabIndex={-1}
          disabled={disabled}
          className="vl-combobox__button vl-combobox__toggle"
          aria-label={isOpen ? "Hide options" : "Show options"}
          onMouseDown={event => event.preventDefault()}
          onClick={() => { if (isOpen) close(); else openList(); inputRef.current?.focus(); }}
        >
          <Icon name="chevron-down" size="sm" />
        </button>
        {name && <input type="hidden" name={name} value={selected ? selected.value : ""} disabled={disabled} />}
      </div>
      <div role="status" className="vl-combobox__sr">{status}</div>
      {isOpen && (
        <AnchoredPanel
          ref={panelRef}
          anchor={field}
          open
          side="bottom"
          align="start"
          className="vl-combobox__panel"
          style={{width: field?.offsetWidth}}
          // Pressing inside the list must not move focus out of the text field.
          onMouseDown={event => event.preventDefault()}
        >
          <div id={listboxId} role="listbox" hidden={visible.length === 0} aria-label={visibleLabel ?? inputProps["aria-label"] ?? (inputProps["aria-labelledby"] ? undefined : "Options")} aria-labelledby={visibleLabel ? undefined : inputProps["aria-labelledby"]} className="vl-combobox__list">
            {visible.map(option => (
              <div
                key={option.value}
                id={optionId(option)}
                role="option"
                aria-selected={option.value === current}
                aria-disabled={option.disabled || undefined}
                data-active={option === active || undefined}
                className="vl-combobox__option"
                onClick={() => choose(option)}
                onPointerMove={() => { if (!option.disabled && activeValue !== option.value) setActiveValue(option.value); }}
              >
                <span className="vl-combobox__text">
                  <span>{option.label}</span>
                  {option.description && <span className="vl-combobox__description">{option.description}</span>}
                </span>
                {option.value === current && <Icon name="check" size="sm" />}
              </div>
            ))}
          </div>
          {visible.length === 0 && <div className="vl-combobox__empty" aria-hidden="true">{emptyMessage}</div>}
        </AnchoredPanel>
      )}
    </div>
  );
}

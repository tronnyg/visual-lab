import {useEffect, useId, useLayoutEffect, useRef, useState} from "react";
import type {ChangeEvent, ComponentPropsWithoutRef, KeyboardEvent, Ref} from "react";
import {AnchoredPanel} from "../../shared/AnchoredPanel";
import {useEscapeDismiss, useOutsideDismiss} from "../../shared/dismiss";
import {useFormReset} from "../../shared/useFormReset";
import {Icon} from "../Icon/Icon";
import {
  addDays, addMonths, clampDate, daysInMonth, endOfMonth, endOfWeek, formatLongDate, formatMonthTitle, isValidDate, isWithin, parseDate,
  startOfMonth, startOfWeek, todayLocal, weekday, weekdayNames,
} from "./dateUtils";
import type {Weekday} from "./dateUtils";

interface DatePickerOwnProps {
  /** The selected date as "YYYY-MM-DD" (a calendar date, not a timestamp), or "" for none. Makes the picker controlled. */
  value?: string;
  /** Initial date when uncontrolled. Form reset restores it. */
  defaultValue?: string;
  /** Called with "YYYY-MM-DD", or "" when cleared, when the user picks, types or clears a date. Never on first render. */
  onValueChange?: (date: string) => void;
  /** Earliest selectable date, "YYYY-MM-DD". */
  min?: string;
  /** Latest selectable date, "YYYY-MM-DD". */
  max?: string;
  /** Shown while empty. Defaults to `YYYY-MM-DD`. */
  placeholder?: string;
  /** BCP 47 tag used for month and weekday names and the spoken date. The typed and submitted format is always "YYYY-MM-DD". Defaults to `en-US`. */
  locale?: string;
  /** First column of the calendar: 0 Sunday (default) to 6 Saturday. */
  weekStartsOn?: Weekday;
  ref?: Ref<HTMLInputElement>;
}

// A visible label, or an explicit accessible name, is required by the types.
type DatePickerLabelProps =
  | {label: string; "aria-label"?: string; "aria-labelledby"?: string}
  | {label?: undefined; "aria-label": string; "aria-labelledby"?: string}
  | {label?: undefined; "aria-label"?: string; "aria-labelledby": string};

export type DatePickerProps = DatePickerOwnProps &
  DatePickerLabelProps &
  Omit<ComponentPropsWithoutRef<"input">, keyof DatePickerOwnProps | "type" | "children" | "aria-label" | "aria-labelledby" | "defaultChecked" | "checked" | "onChange">;

/**
 * Selects one calendar date. The field is a text input holding "YYYY-MM-DD", so the date can be typed and the submitted FormData value is
 * exactly what is shown; a button opens a calendar in an anchored panel for picking it. `required` and `name` are native, and the input
 * reports an unusable or out-of-range date through `setCustomValidity`, so browser validation and `:invalid` work. `className` and
 * `style` apply to the wrapper; other props go to the input.
 *
 * Calendar keyboard model (a grid with one tab stop): Arrow keys move by a day or a week, Home/End go to the start or end of the
 * week, PageUp/PageDown move a month (with Shift a year) keeping the day where the month is shorter, Enter or Space picks, Escape closes
 * and returns focus to the button. Dates outside `min`/`max` cannot be reached or chosen.
 */
export function DatePicker({
  label, value, defaultValue, onValueChange, min, max, placeholder = "YYYY-MM-DD", locale = "en-US", weekStartsOn = 0,
  className, style, id, disabled, required, onBlur, onFocus, onKeyDown, ref, ...rest
}: DatePickerProps) {
  const generatedId = useId();
  const inputId = id ?? generatedId;
  const panelId = `${generatedId}-calendar`;
  const hintId = `${generatedId}-hint`;
  const controlled = value !== undefined;
  const [inner, setInner] = useState(defaultValue ?? "");
  const current = controlled ? value : inner;
  const [draft, setDraft] = useState<string | null>(null);
  const [lastValue, setLastValue] = useState(current);
  const [isOpen, setOpen] = useState(false);
  const [focused, setFocused] = useState(false);
  const [field, setField] = useState<HTMLDivElement | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);
  const toggleRef = useRef<HTMLButtonElement | null>(null);
  const panelRef = useRef<HTMLDivElement | null>(null);

  // A new value from outside (or from a pick) replaces whatever half-typed text was in the field.
  if (lastValue !== current) { setLastValue(current); setDraft(null); }

  const text = draft ?? current;
  const visibleLabel = label?.trim() ? label : undefined;
  const problem = text === "" ? "" : !isValidDate(text) ? "Enter a date as YYYY-MM-DD" : !isWithin(text, min, max) ? rangeMessage(min, max) : "";

  useEffect(() => { inputRef.current?.setCustomValidity(problem); }, [problem]);
  useFormReset(inputRef, () => { if (!controlled) { setInner(defaultValue ?? ""); setDraft(null); } });

  function commit(next: string) {
    if (!controlled) setInner(next);
    onValueChange?.(next);
  }

  function onInputChange(event: ChangeEvent<HTMLInputElement>) {
    const next = event.target.value.trim();
    setDraft(event.target.value);
    // Only a complete, allowed date (or nothing) is a change of value; anything else stays a draft that fails validation.
    if (next === "") commit("");
    else if (isValidDate(next) && isWithin(next, min, max)) commit(next);
  }

  const closeAndFocusToggle = () => { setOpen(false); toggleRef.current?.focus(); };
  useEscapeDismiss(isOpen, closeAndFocusToggle);
  useOutsideDismiss(isOpen, () => [field, panelRef.current], () => setOpen(false));

  // The panel is displayed by the time this runs, so the grid can take focus in the frame it opens.
  useLayoutEffect(() => {
    if (isOpen) panelRef.current?.querySelector<HTMLElement>('[role="grid"] button[tabindex="0"]')?.focus({preventScroll: true});
  }, [isOpen]);

  function pick(date: string) {
    commit(date);
    setDraft(null);
    closeAndFocusToggle();
  }

  const selected = isValidDate(text) && isWithin(text, min, max) ? text : undefined;
  return (
    <div className={className ? `vl-datepicker ${className}` : "vl-datepicker"} style={style}>
      {visibleLabel && <label className="vl-datepicker__label" htmlFor={inputId}>{visibleLabel}</label>}
      <div className="vl-datepicker__field" ref={setField}>
        <input
          {...rest}
          ref={node => { inputRef.current = node; if (typeof ref === "function") ref(node); else if (ref) ref.current = node; }}
          id={inputId}
          type="text"
          autoComplete="off"
          className="vl-datepicker__control"
          value={text}
          placeholder={placeholder}
          disabled={disabled}
          required={required}
          aria-invalid={rest["aria-invalid"] ?? (problem && !focused ? true : undefined)}
          aria-describedby={[rest["aria-describedby"], hintId].filter(Boolean).join(" ")}
          onChange={onInputChange}
          onFocus={event => { setFocused(true); onFocus?.(event); }}
          onBlur={event => { setFocused(false); onBlur?.(event); }}
          onKeyDown={(event: KeyboardEvent<HTMLInputElement>) => {
            onKeyDown?.(event);
            if (event.defaultPrevented || disabled) return;
            if (event.key === "ArrowDown" && event.altKey) { event.preventDefault(); setOpen(true); }
          }}
        />
        <span id={hintId} className="vl-datepicker__hint">Format YYYY-MM-DD</span>
        <button
          ref={toggleRef}
          type="button"
          className="vl-datepicker__toggle"
          disabled={disabled}
          aria-label={selected ? `Change date, ${formatLongDate(selected, locale)}` : "Choose date"}
          aria-haspopup="dialog"
          aria-expanded={isOpen}
          aria-controls={isOpen ? panelId : undefined}
          onClick={() => setOpen(!isOpen)}
        >
          <Icon name="calendar" size="sm" />
        </button>
      </div>
      {isOpen && (
        <AnchoredPanel
          id={panelId}
          ref={panelRef}
          anchor={field}
          open
          side="bottom"
          align="start"
          role="dialog"
          aria-label="Choose date"
          className="vl-calendar"
        >
          <Calendar selected={selected} min={min} max={max} locale={locale} weekStartsOn={weekStartsOn} canClear={!required && current !== ""} onPick={pick} onClear={() => pick("")} />
        </AnchoredPanel>
      )}
    </div>
  );
}

function rangeMessage(min?: string, max?: string): string {
  if (isValidDate(min) && isValidDate(max)) return `Choose a date from ${min} to ${max}`;
  return isValidDate(min) ? `Choose ${min} or later` : `Choose ${max} or earlier`;
}

interface CalendarProps {
  selected?: string;
  min?: string;
  max?: string;
  locale: string;
  weekStartsOn: Weekday;
  canClear: boolean;
  onPick: (date: string) => void;
  onClear: () => void;
}

// The month grid. `cursor` is the one date with tabindex 0, and the month shown is the cursor's month.
function Calendar({selected, min, max, locale, weekStartsOn, canClear, onPick, onClear}: CalendarProps) {
  const titleId = useId();
  const today = todayLocal();
  const [cursor, setCursor] = useState(() => clampDate(selected ?? today, min, max));
  const gridRef = useRef<HTMLTableElement>(null);
  const moveFocus = useRef(false);

  // After a keyboard move the new cursor's button takes focus; month buttons keep their own focus.
  useLayoutEffect(() => {
    if (!moveFocus.current) return;
    moveFocus.current = false;
    gridRef.current?.querySelector<HTMLElement>('button[tabindex="0"]')?.focus({preventScroll: true});
  }, [cursor]);

  const go = (date: string, focus: boolean) => { moveFocus.current = focus; setCursor(clampDate(date, min, max)); };

  function onGridKeyDown(event: KeyboardEvent<HTMLTableElement>) {
    if (event.altKey || event.ctrlKey || event.metaKey) return;
    const next: Record<string, string> = {
      ArrowLeft: addDays(cursor, -1),
      ArrowRight: addDays(cursor, 1),
      ArrowUp: addDays(cursor, -7),
      ArrowDown: addDays(cursor, 7),
      Home: startOfWeek(cursor, weekStartsOn),
      End: endOfWeek(cursor, weekStartsOn),
      PageUp: addMonths(cursor, event.shiftKey ? -12 : -1),
      PageDown: addMonths(cursor, event.shiftKey ? 12 : 1),
    };
    if (event.key in next) { event.preventDefault(); go(next[event.key], true); }
  }

  const first = startOfMonth(cursor);
  const month = parseDate(cursor)!;
  const lead = (weekday(first) - weekStartsOn + 7) % 7;
  const weekCount = Math.ceil((lead + daysInMonth(month.year, month.month)) / 7);
  const gridStart = addDays(first, -lead);
  const names = weekdayNames(locale, weekStartsOn);
  const previousDisabled = isValidDate(min) && addDays(first, -1) < min;
  const nextDisabled = isValidDate(max) && addDays(endOfMonth(cursor), 1) > max;
  const todayAllowed = isWithin(today, min, max);

  return (
    <div className="vl-calendar__body">
      <div className="vl-calendar__header">
        <button type="button" className="vl-calendar__nav" aria-label="Previous month" disabled={previousDisabled} onClick={() => go(addMonths(cursor, -1), false)}>
          <Icon name="chevron-left" size="sm" />
        </button>
        <div id={titleId} className="vl-calendar__title" aria-live="polite">{formatMonthTitle(cursor, locale)}</div>
        <button type="button" className="vl-calendar__nav" aria-label="Next month" disabled={nextDisabled} onClick={() => go(addMonths(cursor, 1), false)}>
          <Icon name="chevron-right" size="sm" />
        </button>
      </div>
      <table ref={gridRef} role="grid" className="vl-calendar__grid" aria-labelledby={titleId} onKeyDown={onGridKeyDown}>
        <thead>
          <tr>{names.map(name => <th key={name.long} scope="col" abbr={name.long} className="vl-calendar__weekday"><span aria-hidden="true">{name.short}</span><span className="vl-calendar__sr">{name.long}</span></th>)}</tr>
        </thead>
        <tbody>
          {Array.from({length: weekCount}, (_, week) => (
            <tr key={week}>
              {Array.from({length: 7}, (_, column) => {
                const date = addDays(gridStart, week * 7 + column);
                const allowed = isWithin(date, min, max);
                return (
                  <td key={date} role="gridcell" aria-selected={date === selected} className="vl-calendar__cell">
                    <button
                      type="button"
                      className="vl-calendar__day"
                      tabIndex={date === cursor ? 0 : -1}
                      disabled={!allowed}
                      aria-label={formatLongDate(date, locale)}
                      aria-current={date === today ? "date" : undefined}
                      data-outside={date.slice(0, 7) !== cursor.slice(0, 7) || undefined}
                      data-selected={date === selected || undefined}
                      data-today={date === today || undefined}
                      onClick={() => onPick(date)}
                    >
                      {Number(date.slice(8))}
                    </button>
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
      <div className="vl-calendar__footer">
        <button type="button" className="vl-calendar__action" disabled={!todayAllowed} onClick={() => onPick(today)}>Today</button>
        {canClear && <button type="button" className="vl-calendar__action" onClick={onClear}>Clear</button>}
      </div>
    </div>
  );
}

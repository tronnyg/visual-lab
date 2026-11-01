# DatePicker

Classification: `level: "composite"`, `family: "controls"`.

```text
visual/components/DatePicker/
  DatePicker.tsx            React component: text field, calendar button and calendar grid
  dateUtils.ts              Pure "YYYY-MM-DD" helpers (UTC whole-day arithmetic, strict parsing)
  DatePicker.css            Field, calendar panel, day states
  DatePicker.openui.tsx     OpenUI schema and $variable binding
  DatePicker.examples.ts    OpenUI examples, spread into `examples` in registry.ts
```

`DatePicker.tsx` imports nothing from OpenUI, the board or MCP. The calendar is the shared `AnchoredPanel` (see [Popover](popover.md)); there is no second positioning system. Selects **one calendar date**: no ranges, times or scheduling.

## Date representation

A date is the string `YYYY-MM-DD`: a day on the calendar, not a UTC timestamp. All arithmetic counts whole days from a fixed UTC epoch, and names come from `Intl` with `timeZone: "UTC"`, so no timezone or daylight-saving change can move a day and nothing uses `toISOString()`. Only "today" reads the local clock (local year, month, day). Parsing is strict: `2026-02-30`, `2026-3-5`, month 13 and timestamps are not dates.

## React API

| Prop | Type | Notes |
| --- | --- | --- |
| `value` | `string` | `YYYY-MM-DD` or `""`. Controlled: the field shows exactly this |
| `defaultValue` | `string` | Initial date when uncontrolled; form reset restores it |
| `onValueChange` | `(date: string) => void` | `YYYY-MM-DD`, or `""` when cleared. Only for complete allowed dates the user picks or types; never on first render |
| `min`, `max` | `string` | `YYYY-MM-DD`; days outside are disabled and cannot be reached by keyboard |
| `label` | `string` | Visible label. Without it `aria-label` or `aria-labelledby` is required by the types |
| `placeholder`, `disabled`, `required`, `name`, `id`, `aria-*` | | Passed to the text input |
| `locale` | `string` | BCP 47 tag for month and weekday names and spoken dates (default `en-US`). The typed and submitted format is always `YYYY-MM-DD` |
| `weekStartsOn` | `0`–`6` | First calendar column (default `0`, Sunday) |

## Forms

The visible input is the named control, so `FormData` holds exactly what is shown (`""` when empty). `required` is native. An unusable or out-of-range text sets a custom validity message (`:invalid`, `checkValidity()` is false) and `aria-invalid` once the field loses focus. An uncontrolled picker returns to `defaultValue` on form reset; a controlled one follows its parent.

## Keyboard

Alt+ArrowDown on the field, or the button, opens the calendar; focus moves to the selected day (or today). The grid has one tab stop. Arrows move by a day or week, Home/End to the start/end of the week, PageUp/PageDown by a month (Shift: a year, keeping the day or the last day of a shorter month), Enter or Space picks, Escape closes and returns focus to the button, Tab or a press outside closes. Today and Clear (not when `required`) are buttons in the panel.

## OpenUI

```text
DatePicker(value, label, min, max, disabled, required, placeholder)
```

`value` must be a bare `$variable` holding `YYYY-MM-DD` or `""`; picking or typing writes to it (`@Reset` works). Literals and expressions render a read-only field. `locale` and `weekStartsOn` are React-only.

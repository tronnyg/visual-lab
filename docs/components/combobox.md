# Combobox

Classification: `level: "composite"`, `family: "controls"`.

```text
visual/components/Combobox/
  Combobox.tsx            React component, keyboard model and public props
  Combobox.css            Field, option list, highlight
  Combobox.openui.tsx     OpenUI schema and $variable binding
  Combobox.examples.ts    OpenUI examples, spread into `examples` in registry.ts
```

`Combobox.tsx` imports nothing from OpenUI, the board or MCP. The list is the shared `AnchoredPanel` (see [Popover](popover.md)) with the shared Escape and outside-press dismissal. Single selection from options you supply: no multi-select, no remote search.

**Combobox vs Select:** [Select](select.md) is a native dropdown and the right default for a short list. Use Combobox when the list is long enough that typing to find an option helps.

## React API

| Prop | Type | Notes |
| --- | --- | --- |
| `options` | `{value, label, disabled?, description?}[]` | Required. Values unique. Search matches label and value, case-insensitively; the description is shown, read and not searched |
| `value` | `string` | Chosen value or `""`. Controlled. A value matching no option shows as empty and is not submitted |
| `defaultValue` | `string` | Initial value when uncontrolled; form reset restores it |
| `onValueChange` | `(value: string) => void` | Chosen option's value, or `""` when cleared. User changes only |
| `placeholder`, `searchPlaceholder`, `emptyMessage` | `string` | Closed hint; hint while open; text for no matches (default `No results`) |
| `label` | `string` | Visible label. Without it `aria-label` or `aria-labelledby` is required by the types |
| `name` | `string` | A hidden input with this name submits the chosen `value` |
| `disabled`, `required`, `id`, `aria-*` | | `required` is native on the visible field |

## Accessibility and keyboard

The WAI-ARIA editable combobox with list autocomplete: the text field is `role="combobox"` with `aria-expanded`, `aria-controls` (while open), `aria-autocomplete="list"` and `aria-activedescendant`; the popup is a `role="listbox"` of `role="option"`s (`aria-selected`, `aria-disabled`). DOM focus never leaves the field, so typing and arrows do not compete, and pressing inside the list does not steal focus. A polite status region reports the number of results or the empty message.

Arrow Down/Up open the list and move the highlight (wrapping, skipping disabled options); typing filters; Enter chooses the highlighted option (and does not submit the form while the list is open); Escape closes and restores the chosen label; Tab or a press elsewhere closes without choosing. Home/End keep their text-editing meaning. The highlight has an accent bar and the chosen option a check mark, so neither relies on colour alone. The highlighted option scrolls into view.

## Forms

The visible input holds the label and has no name. A hidden input named `name` submits the value (it is disabled with the combobox). `required` makes the form invalid until an option is chosen, and a required selection has no clear button. Uncontrolled state returns to `defaultValue` on form reset.

## OpenUI

```text
Combobox(value, options, label, disabled, placeholder, required, emptyMessage)
```

`value` must be a bare string `$variable`; choosing writes the option's `value` (`@Reset` works). Options are strings or `{label, value, description, disabled}`; duplicate values keep the first. Literals and expressions render a read-only field. No remote data or callbacks.

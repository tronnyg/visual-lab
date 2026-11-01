# Switch

Classification: `level: "primitive"`, `family: "controls"`.

```text
visual/components/Switch/
  Switch.tsx            React component and public props
  Switch.css            Track, thumb, focus and disabled styling
  Switch.openui.tsx     OpenUI schema and $variable binding
  Switch.examples.ts    OpenUI examples, spread into `examples` in registry.ts
```

`Switch.tsx` imports nothing from OpenUI, the board or MCP. It is a native `<input type="checkbox" role="switch">`, so keyboard activation, label clicks, `disabled`, `required`, `name`/`value` and form reset come from the browser.

Use Switch for a **setting that is on or off right away** (notifications, dark mode). Use [Checkbox](checkbox.md) for a choice among several options, a box to tick in a list, or a statement to acknowledge in a form.

## React API

| Prop | Type | Notes |
| --- | --- | --- |
| `checked` | `boolean` | Controlled. The switch shows exactly this value |
| `defaultChecked` | `boolean` | Initial value when uncontrolled; form reset restores it |
| `onCheckedChange` | `(checked, event) => void` | Called when the user toggles, never on first render |
| `label` | `string` | Visible label. Without it `aria-label` or `aria-labelledby` is required by the types |
| `name` / `value` | `string` | A checked switch submits `name=value` (`on` if `value` is not set); an unchecked one submits nothing |
| `disabled`, `required`, `id`, `aria-*` | | Passed to the input. `required` means the form is invalid until the switch is on |

`className` and `style` apply to the wrapping `<label>`.

## Accessibility

Role `switch` with the native checked state, Space toggles, the whole label is the click target (at least 28px tall), a visible focus ring, and the on state is shown by the thumb position and not by colour alone.

## OpenUI

```text
Switch(checked, label, disabled, required)
```

`checked` must be a bare boolean `$variable`; toggling writes `true`/`false` to it (`@Reset` works). Literals and expressions render a read-only (disabled) switch. `required` is native validation inside a Form. See [Form](form.md).

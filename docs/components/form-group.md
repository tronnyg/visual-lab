# FormGroup

Classification: `level: "composite"`, `family: "controls"`.

```text
visual/components/FormGroup/
  FormGroup.tsx            React component and public props
  FormGroup.css            Fieldset reset, legend, orientation, error
  FormGroup.openui.tsx     OpenUI schema and child references
  FormGroup.examples.ts    OpenUI examples, spread into `examples` in registry.ts
```

`FormGroup.tsx` imports nothing from OpenUI, the board or MCP. It is a native `<fieldset>` with a `<legend>`: **related controls under one name**. It is semantic grouping, not a layout engine (use [Grid](grid.md) and [Stack](stack.md) for layout) and not validation.

**FormGroup vs Field:** [Field](field.md) is one control with a label above it; FormGroup is several controls that answer one question (a set of checkboxes, a RadioGroup with a related Switch). Controls inside a FormGroup keep their own labels.

## React API

| Prop | Type | Notes |
| --- | --- | --- |
| `legend` | `string` | Required. The group's visible, accessible name |
| `description` | `string` | Help text; the fieldset's `aria-describedby` |
| `error` | `string` | Error for the whole group; described after the help text, with an icon and the text "Error:", in a polite live region |
| `required` | `boolean` | Asterisk plus a visually hidden "(required)" in the legend, announced once. It does not set `required` on the controls inside |
| `disabled` | `boolean` | Native `<fieldset disabled>`: every control inside is disabled by the browser |
| `orientation` | `vertical \| horizontal` | Default `vertical`; horizontal is a wrapping row |
| `children` | `ReactNode` | Any controls |

Other `fieldset` props (`id`, `name`, `form`, `aria-*`) are passed through; an `aria-describedby` you give is kept and extended.

## Accessibility

Screen readers announce the legend as the group name when focus enters it. A nested [RadioGroup](radio-group.md) is itself a group with its own name inside the outer one; give it a label that adds to, not repeats, the legend. `aria-invalid` is not valid on a group, so the error is exposed as the group's description instead.

## OpenUI

```text
FormGroup(legend, children, description, error, required, disabled, orientation)
```

`children` is an array of component references (the same union as Stack's children), so each child keeps its `$variable` binding. `error` can be an expression, e.g. `$email || $sms ? null : "Choose at least one"`. No new document format.

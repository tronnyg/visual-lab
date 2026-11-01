# Field

Classification: `level: "composite"`, `family: "controls"`.

```text
visual/components/Field/
  Field.tsx            React component and public props
  Field.css            Label, description, error
  Field.openui.tsx     OpenUI schema and control reference
  Field.examples.ts    OpenUI examples, spread into `examples` in registry.ts
```

`Field.tsx` imports nothing from OpenUI, the board or MCP. Field composes **one labelled control** with optional description and error. It is a semantic composition, not a validation engine and not a form store: it shows the error it is given.

Use Field for a single control and [FormGroup](form-group.md) for a set of related controls (radio buttons, several checkboxes).

## React API

| Prop | Type | Notes |
| --- | --- | --- |
| `label` | `string` | Required. A real `<label for>` for the control |
| `description` | `string` | Help text under the control; added to the control's `aria-describedby` |
| `error` | `string` | Error under the control; sets `aria-invalid="true"` and is added to `aria-describedby` after the description. Shown with an icon and the text "Error:", in a polite live region |
| `required` | `boolean` | Asterisk (hidden from assistive technology) and the native `required` attribute on a text-like control that lacks it |
| `disabled` | `boolean` | A native `<fieldset disabled>` around the control, so everything inside is disabled (a DatePicker's calendar button too) |
| `controlId` | `string` | Explicit association: the id of the control to label, when it is not the first input, select or textarea |
| `children` | `ReactNode` | The control, or markup containing one |

## How the association works

The control can be any component, including ones that cannot take props (OpenUI nodes), so Field finds the first `input` (not hidden, not a radio), `select` or `textarea` inside it and writes the relationships to the DOM in a layout effect after every commit, the same technique TriggerSlot uses for its trigger:

- The control keeps its own `id`, or gets a generated one; the label's `for` points at it.
- Description and error ids are **appended** to an existing `aria-describedby`; an existing `aria-invalid` or `required` is left alone.
- A control that fell back on a generic `aria-label` (OpenUI's Input uses its placeholder) is named by the visible label through `aria-labelledby`. An `aria-labelledby` the child set itself is never replaced.
- Everything Field added is removed again on the next commit and on unmount.
- No control found: the label renders as plain text, not as a label that names nothing.

Limits: give the control **no visible label of its own** (a Checkbox or Switch keeps its text, which is then read together with the Field label). A set of radios is a group: use FormGroup. A custom control that is not an input, select or textarea needs `controlId`.

## OpenUI

```text
Field(label, control, description, error, required, disabled)
```

`control` is one component reference (the same union as a Tabs panel). `error` can be an expression, e.g. `$email == "" ? "Enter your email" : null`, so it appears only while it applies. Field does not validate; `required` makes the control natively required, which a Form checks on submit.

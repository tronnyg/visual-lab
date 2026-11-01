# Form

Classification: `level: "composite"`, `family: "controls"`.

```text
visual/components/Form/
  Form.tsx            React component and public props
  Form.css            Form reset and the OpenUI actions bar
  Form.openui.tsx     OpenUI schema, child references and action
  Form.examples.ts    OpenUI examples, spread into `examples` in registry.ts
```

`Form.tsx` imports nothing from OpenUI, the board or MCP. It is a native `<form>` that collects values with `FormData` and hands them to `onSubmit`. There is **no** form-state framework, field registry, validation schema or submission layer, and no network code or API route: the browser does the work, and errors are shown by [Field](field.md) and [FormGroup](form-group.md).

**Form vs Stack:** use [Stack](stack.md) for a plain group of controls. Use Form when required and invalid controls must be checked before an action, when Enter should submit, or when a reset should restore the controls.

## React API

| Prop | Type | Notes |
| --- | --- | --- |
| `children` | `ReactNode` | Anything: Stack, Grid, Card, Field, FormGroup, controls, buttons |
| `onSubmit` | `(values: FormData, event) => void` | Called after the browser's constraint validation passes (or `noValidate`). `values` is taken with the submitter, so a named submit button is included. Disabled controls are not part of it |
| `onReset` | `(event) => void` | Called before the browser restores the controls; `event.preventDefault()` cancels the reset |
| `noValidate` | `boolean` | Skip constraint validation on submit. Default `false` |
| `disabled` | `boolean` | Native `<fieldset disabled>` around the contents |

`action`, `method`, `encType`, `target` are not accepted: **submission never navigates**. The submit event is always cancelled, so a Form with no `onSubmit` just validates. Give the form `aria-label` or `aria-labelledby` to make it a named landmark.

## Behaviour

Enter in a text field submits when the form has a submit button; a `type="submit"` button submits; a `type="reset"` button resets. The browser checks `required`, `pattern`, `min`, `max`, and custom validity (a DatePicker's range) first and focuses the first invalid control. Uncontrolled controls (Switch, DatePicker, Combobox, FileUpload with default values) restore themselves on reset; controlled ones follow their own state, so reset it in `onReset`. Submission feedback (a Toast, an Alert, a status line) is supplied by the consumer.

## OpenUI

```text
Form(children, submitLabel, action, disabled, label)
```

`children` are component references (the same union as Stack's). Only what the renderer can already run is exposed:

- `action` is one of the SDK's existing action steps (`@Set`, `@Reset`, `@ToAssistant`, `@OpenUrl`, or `Action([...])`), run through the same `useTriggerAction` as Button. It runs only after the browser's validation passes, from Enter or the submit button.
- A `@ToAssistant` action reports the **current values of the document's `$variables`** (the SDK's `formState`), exactly as a Button would. It does **not** send `FormData`, files or an HTTP request, and nothing is posted to a server. There is no dynamic payload syntax.
- The submit button is only shown when there is an `action`; without one the form only validates.
- Reset is an ordinary `Button(..., @Reset($a, $b))`: a native reset cannot restore a `$variable`.
- Native `required` reaches the controls through `Field(..., required)` and the `required` argument of Switch, DatePicker, Combobox and FileUpload. The OpenUI Input has no `required` argument of its own.

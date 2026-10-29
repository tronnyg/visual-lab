# Button

Reference implementation for future components. Classification: `level: "primitive"`, `family: "controls"`.

```text
visual/components/Button/
  Button.tsx          React component and public props
  Button.css          Variants, sizes and states (imported from app/layout.tsx)
  Button.openui.tsx   OpenUI schema, icon allowlist and action adapter
  Button.examples.ts  OpenUI examples, spread into `examples` in registry.ts
```

`Button.tsx` renders a native `<button>` and imports nothing from OpenUI, the board or MCP. `Button.css` is imported from `app/layout.tsx` rather than from `Button.tsx`, because `scripts/gen-library.tsx` loads the component under `tsx`, which cannot import `.css` files.

## React API

| Prop | Type | Default | Notes |
| --- | --- | --- | --- |
| `variant` | `primary \| secondary \| outline \| ghost \| destructive \| link` | `primary` | Emitted as `data-variant` |
| `size` | `xs \| sm \| default \| lg` | `default` | Heights 24 / 28 / 32 / 40 px; emitted as `data-size` |
| `loading` | `boolean` | `false` | See below |
| `fullWidth` | `boolean` | `false` | Fills the container |
| `leadingIcon`, `trailingIcon` | `ReactNode` | none | Wrapped in `aria-hidden` |
| `iconOnly` | `boolean` | `false` | Square button; `children` is the icon. Requires `aria-label` or `aria-labelledby` (enforced by the types) |
| `type` | `button \| submit \| reset` | `button` | Avoids accidental form submission |
| `disabled`, `onClick`, `name`, `value`, `className`, `ref`, other native attributes | as `<button>` | | `ref` is a normal prop (React 19) |

```tsx
<Button variant="outline" size="sm" leadingIcon={<PlusIcon />} onClick={add}>Add</Button>
<Button iconOnly aria-label="Close" variant="ghost"><XIcon /></Button>
<Button loading>Saving</Button>
```

### Disabled and loading

- `disabled` sets the native attribute: not focusable, no click events.
- `loading` does **not** set `disabled`, so keyboard focus is kept. It sets `aria-disabled="true"` and `aria-busy="true"`, shows a spinner, and the click handler returns early and calls `preventDefault()` (so a `submit` button does not submit). The label stays in layout with `opacity: 0`, so width does not change and the accessible name remains; the visually hidden text "Loading" is added.
- Hover and active styling is not applied in either state.

### Accessibility

Native button semantics: Enter and Space activate it, and focus uses the global `:focus-visible` outline (2px `--ui-accent-solid`). Icons are decorative.

## OpenUI API

```text
Button(label, disabled?, variant?, size?, loading?, fullWidth?, leadingIcon?, trailingIcon?, actionId?)
```

| Argument | Values |
| --- | --- |
| `label` | string (required) |
| `disabled`, `loading`, `fullWidth` | boolean |
| `variant` | as React |
| `size` | as React |
| `leadingIcon`, `trailingIcon` | `arrow-right`, `arrow-left`, `plus`, `check`, `download`, `external-link`, `trash`, `send` |
| `actionId` | `/^[a-z0-9][a-z0-9_-]{0,63}$/i` |

`disabled` is deliberately second so boards written for the earlier `Button(label, disabled)` keep working; use `null` to skip an optional argument, e.g. `Button("Next", false, "primary", "default", false, false, null, "arrow-right")`.

Limitations: no icon-only, arbitrary children, class names, styles or HTML attributes are exposed. The OpenUI parser does not enforce the `actionId` pattern, so the adapter re-checks it and emits nothing for a malformed id. The icons are small hand-written SVG paths in `Button.openui.tsx`; there is no shared icon system. `lucide-react` is present only as a transitive dependency of `@openuidev/react-ui`, so it is not used.

## Action event

With an `actionId`, `Button.openui.tsx` calls OpenUI's `useTriggerAction()`:

```ts
triggerAction(label, formName, { type: BuiltinActionType.ContinueConversation, params: { actionId } })
```

`VisualRenderer` forwards this to `onAction`; the board POSTs it to `/api/events`; MCP `read_events` returns it. The stored event's `params.event` is:

```json
{ "type": "continue_conversation", "params": { "actionId": "show-explanation" }, "humanFriendlyMessage": "Show explanation" }
```

No event is emitted without an `actionId`, when `disabled` or `loading`, or while the document is still streaming. No other action types (navigation, scripts) are supported.

## Provenance

Variants, sizes, `loading`/icon-only ergonomics and the `type="button"` default are patterns studied from the [shadcn/ui Button](https://ui.shadcn.com/docs/components/base/button) (MIT). No shadcn, Base UI, Radix or Tailwind code or dependency was added; the markup, CSS and icon paths are original to this repository. Dependencies are unchanged (React, `@openuidev/react-lang`, `zod`).

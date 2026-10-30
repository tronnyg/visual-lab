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
Button(label, disabled?, variant?, size?, loading?, fullWidth?, leadingIcon?, trailingIcon?, action?)
```

| Argument | Values |
| --- | --- |
| `label` | string (required) |
| `disabled`, `loading`, `fullWidth` | boolean |
| `variant` | as React |
| `size` | as React |
| `leadingIcon`, `trailingIcon` | Any [Icon](icon.md) name, e.g. `arrow-right`, `plus`, `check`, `download`, `external-link`, `trash`, `send`, `search` |
| `action` | an OpenUI action: `@Set($v, expr)`, `@Reset($v)`, `@ToAssistant("message")` or `Action([...])` for several |

`disabled` is deliberately second so boards written for the earlier `Button(label, disabled)` keep working; use `null` to skip an optional argument, e.g. `Button("Next", false, "primary", "default", false, false, null, "arrow-right")`.

Limitations: no icon-only, arbitrary children, class names, styles or HTML attributes are exposed. Icons come from the shared [Icon](icon.md) vocabulary (Lucide); `Button.openui.tsx` renders `<Icon>` and `Button.tsx` still accepts any `ReactNode`.

## Actions

`action` is OpenUI's native `action()` prop. On click the adapter calls `useTriggerAction()` with the supplied action; the SDK runs the steps. With no `action` the Button has no click handler, so it does nothing and emits nothing (unlike the stock OpenUI Button, which sends its label to the assistant). Nothing runs while `disabled`, `loading` or while the document is still streaming.

```text
root = Stack([count, add, reset, ask])
$count = 0
count = Text("Count: " + $count)
add = Button("Add one", false, "primary", "default", false, false, null, null, @Set($count, $count + 1))
reset = Button("Reset", false, "outline", "default", false, false, null, null, @Reset($count))
ask = Button("Explain", false, "secondary", "default", false, false, null, null, @ToAssistant("Explain the counter"))
```

- `@Set` / `@Reset` change `$variables` in the renderer's local store. Every component reading the variable re-renders; nothing is sent to the board or MCP.
- `@ToAssistant("message")` is the way to notify the agent: `onAction` receives `{type: "continue_conversation", humanFriendlyMessage: "message"}`, the board POSTs it to `/api/events`, and MCP `read_events` returns it.
- `@OpenUrl` and `Action([...])` are accepted by the SDK's schema and reach `onAction` as `open_url` events; the board only records them and does not navigate. `@Run` is not available (`toolCalls` is off).
- `$variables`, `@Set` and `@Reset` appear in the model prompt because `bindings: true` in `visual/library.ts`. The SDK prompt still says buttons without an action message the assistant; `additionalRules` in `library.ts` contradicts it. Other stock-library notes (Modal, Callout, ...) also remain in the generated prompt.
- Boards written with the earlier `actionId` string in the last position are no longer valid input. The adapter ignores a string there, but `validate()` does not flag it; remove the argument.

## Provenance

Variants, sizes, `loading`/icon-only ergonomics and the `type="button"` default are patterns studied from the [shadcn/ui Button](https://ui.shadcn.com/docs/components/base/button) (MIT). No shadcn, Base UI, Radix or Tailwind code or dependency was added; the markup and CSS are original to this repository. Icons are Lucide via `lucide-react` (see [Icon](icon.md)).

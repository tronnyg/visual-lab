# Accordion

Classification: `level: "composite"`, `family: "layout"` (it arranges and discloses other content; `interactive` is reserved for self-contained experiences).

```text
visual/components/Accordion/
  Accordion.tsx          React component and public props
  Accordion.css          Rules between sections, CSS chevron, focus styling
  Accordion.openui.tsx   OpenUI schema and child references
  Accordion.examples.ts  OpenUI examples, spread into `examples` in registry.ts
```

`Accordion.tsx` imports nothing from OpenUI, the board or MCP. Use it for grouped expandable sections (FAQ, settings groups). Use [Tabs](tabs.md) for mutually exclusive views and [Collapsible](collapsible.md) for one optional region.

## React API

The props are a union on `type`.

| Prop | Type | Notes |
| --- | --- | --- |
| `items` | `{id, title, content: ReactNode, disabled?}[]` | Required. Ids must be unique. `content` is any React content |
| `type` | `"single" \| "multiple"` | Default `single` |
| `value` | single: `string \| null`; multiple: `string[]` | Open section id(s). Makes the component controlled; `null` is "nothing open" |
| `defaultValue` | same | Initially open section(s) when uncontrolled |
| `onValueChange` | single: `(id: string \| null) => void`; multiple: `(ids: string[]) => void` | Called only on user toggles, never on first render or when `value` changes from outside |
| `collapsible` | `boolean` | Single mode only. Default `true`; `false` keeps one section open once any is |
| `headingLevel` | `2 \| 3 \| 4 \| 5 \| 6` | Heading level of each trigger. Default 3 |
| `className`, `id`, `ref`, other `<div>` attributes | | Applied to the root |

```tsx
<Accordion type="multiple" defaultValue={["profile"]} items={[
  {id: "profile", title: "Profile", content: <ProfileForm />},
  {id: "danger", title: "Danger zone", content: <DeleteButton />, disabled: !isOwner},
]} />
```

Behavior:

- A controlled `value` is authoritative: a click calls `onValueChange` but the section only opens when the parent updates `value`. Unknown ids in a value are ignored.
- A disabled section cannot be toggled by the user, but a `value` may still list it as open (for example a locked, always-visible section).
- **All panels stay mounted.** Collapsed panels use the native `hidden` attribute, so their content keeps its state, is not focusable and is not exposed to assistive technology.
- No items renders an empty root.

## Accessibility

Each trigger is a native `<button>` inside a heading, with `aria-expanded` and `aria-controls`; Enter and Space are native behavior. Up/Down arrows, Home and End (the optional APG keys) move focus between enabled triggers, wrapping. Disabled triggers are native `disabled` buttons. Panels get `role="region"` labelled by their trigger when there are at most six sections (the APG advice against landmark noise). There is no focus trap. Focus is a 2px `--ui-accent-solid` outline inside the trigger.

## OpenUI API

```text
Accordion(items, type?, open?, collapsible?)
```

| Argument | Notes |
| --- | --- |
| `items` | Array of `{id, title, content, disabled?}`. `content` is a typed reference to **one** registered component (including `Stack`, `Card`, `Chart`, `Tabs`, `Accordion` and `Collapsible`); list in `visual/shared/contentRefs.ts` |
| `type` | `"single"` (default) or `"multiple"` |
| `open` | Array of ids that start open. In single mode only the first is used |
| `collapsible` | Single mode only, default `true` |

```text
root = Accordion([{id: "ship", title: "Shipping", content: ship}, {id: "ret", title: "Returns", content: ret}], "single", ["ship"])
ship = Text("Orders arrive in 3 to 5 days.")
ret = Text("Unused items can be returned within 30 days.")
```

Differences from React: the open state is local and initial-only. It is **not** bound to a `$variable`, because a multiple-open list is not a scalar the reactive mechanism handles cleanly and nothing else needs to read it; there is no callback, no `headingLevel`, and `content` is one component rather than arbitrary React content. Repeated ids get a numeric suffix. Changing `type` remounts the accordion.

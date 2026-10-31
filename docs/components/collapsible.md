# Collapsible

Classification: `level: "composite"`, `family: "layout"`.

```text
visual/components/Collapsible/
  Collapsible.tsx          React component and public props
  Collapsible.css          Plain and bordered presentation, CSS chevron, focus styling
  Collapsible.openui.tsx   OpenUI schema, child reference and `$variable` binding
  Collapsible.examples.ts  OpenUI examples, spread into `examples` in registry.ts
```

`Collapsible.tsx` imports nothing from OpenUI, the board or MCP. Use it for one optional detail region. Use [Accordion](accordion.md) for several related sections and [Tabs](tabs.md) for exclusive views. The trigger is built in (a native button with a chevron); there is no arbitrary trigger-composition API.

## React API

| Prop | Type | Notes |
| --- | --- | --- |
| `title` | `string` | Required. Text on the trigger |
| `children` | `ReactNode` | The region's content; may be empty |
| `open` | `boolean` | Makes the component controlled |
| `defaultOpen` | `boolean` | Initial state when uncontrolled. Default `false` |
| `onOpenChange` | `(open: boolean) => void` | Called only when the user toggles, never on first render or when `open` changes from outside |
| `disabled` | `boolean` | The trigger cannot be toggled or focused |
| `variant` | `plain \| bordered` | Default `plain`. `bordered` is a boxed surface with a rule between trigger and region |
| `className`, `id`, `ref`, other `<div>` attributes | | Applied to the root |

```tsx
<Collapsible title="Advanced options" variant="bordered" open={open} onOpenChange={setOpen}>
  <AdvancedOptions />
</Collapsible>
```

Behavior:

- A controlled `open` is authoritative: a click calls `onOpenChange` but the region only opens when the parent updates `open`.
- **The content stays mounted.** The collapsed region uses the native `hidden` attribute, so state inside it survives, it is not focusable and it is not exposed to assistive technology.
- A disabled collapsible keeps its current state (it may be open) but cannot be toggled.
- Ids are `<id>-trigger` and `<id>-panel` (the `id` prop, or a `useId` value), so they are stable for a given instance.

## Accessibility

A native `<button>` with `aria-expanded` and `aria-controls`; Enter and Space are native. The region has `role="region"` labelled by the trigger. There is no focus trap. Focus is a 2px `--ui-accent-solid` outline inside the trigger; hover underlines the title.

## OpenUI API

```text
Collapsible(title, content, open?, disabled?, variant?)
```

| Argument | Notes |
| --- | --- |
| `title` | Text on the toggle |
| `content` | A typed reference to **one** registered component (list in `visual/shared/contentRefs.ts`); wrap several in a `Stack` |
| `open` | A bare boolean `$variable` (two-way), `true`/`false` for the initial state, or `null` for closed |
| `disabled`, `variant` | As above |

```text
$open = false
root = Stack([panel, status], "sm")
panel = Collapsible("Advanced options", options, $open, null, "bordered")
options = Checkbox($debug, "Debug mode")
$debug = false
status = Text($open ? "Options are shown" : "Options are hidden", "muted")
```

`open` is wrapped in `reactive()` and read with `useStateField()`: toggling writes `true`/`false` to the variable, and every expression that reads it updates. With a literal it only sets the initial state (local from then on). Differences from React: no callback (use the `$variable`) and `content` is one component rather than arbitrary React content.

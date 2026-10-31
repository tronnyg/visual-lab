# Tabs

Classification: `level: "composite"`, `family: "navigation"`.

```text
visual/components/Tabs/
  Tabs.tsx          React component and public props
  Tabs.css          Line and contained variants, horizontal and vertical layouts
  Tabs.openui.tsx   OpenUI schema, child references and `$variable` binding
  Tabs.examples.ts  OpenUI examples, spread into `examples` in registry.ts
visual/shared/
  useControllableState.ts   controlled/uncontrolled state used by Tabs and the other stateful components
  idPart.ts                 turns an item id into a DOM-id-safe fragment
  contentRefs.ts            the OpenUI references a panel may hold (shared by Tabs, Accordion, Collapsible)
```

`Tabs.tsx` imports nothing from OpenUI, the board or MCP. Use it for mutually exclusive views of related content. Use [Accordion](accordion.md) for stacked expandable sections and Collapsible for one optional region.

## React API

| Prop | Type | Notes |
| --- | --- | --- |
| `items` | `{id, label, content: ReactNode, disabled?}[]` | Required. Ids must be unique. `content` is any React content |
| `value` | `string` | Selected tab id. Makes the component controlled |
| `defaultValue` | `string` | Initial tab id when uncontrolled |
| `onValueChange` | `(value: string) => void` | Called only when the user selects a tab, never on first render or when `value` changes from outside |
| `variant` | `line \| contained` | Default `line` (underline); `contained` puts the tabs in a muted track |
| `orientation` | `horizontal \| vertical` | Default `horizontal`. Vertical uses Up/Down arrows |
| `aria-label`, `aria-labelledby` | `string` | Name for the tab list |
| `className`, `id`, `ref`, other `<div>` attributes | | Applied to the root |

```tsx
<Tabs aria-label="Report" items={[
  {id: "overview", label: "Overview", content: <Chart {...chartProps} />},
  {id: "details", label: "Details", content: <Table {...tableProps} />},
]} />
```

Behavior:

- The selected tab is the requested one if it exists and is enabled; otherwise the first enabled tab. An unknown or disabled `value` never selects anything and fires no callback. If every tab is disabled nothing is selected and no panel shows. No items renders an empty root without a tab list.
- A controlled `value` is authoritative: a click calls `onValueChange` but the selection only moves when the parent updates `value`.
- **All panels stay mounted.** Inactive panels use the native `hidden` attribute, so their content keeps its state, is out of the keyboard tab order and is removed from the accessibility tree (no opacity or offscreen tricks).
- Ids are built from a `useId` base plus the item id (sanitised, so ids with spaces or punctuation stay unique and valid in `aria-controls`).

## Accessibility

WAI-ARIA tabs pattern: `role="tablist"` (with `aria-orientation`), `role="tab"` with `aria-selected` and `aria-controls`, `role="tabpanel"` with `aria-labelledby`. Roving tabindex: only the selected tab is in the page tab order, and Tab then moves into the active panel (`tabindex="0"`). Arrow keys move focus and select immediately (automatic activation, wrapping); Home and End jump to the first and last enabled tab; disabled tabs are native `disabled` buttons and are skipped. Focus is a 2px `--ui-accent-solid` outline drawn inside the tab.

## OpenUI API

```text
Tabs(items, value?, variant?, orientation?)
```

| Argument | Notes |
| --- | --- |
| `items` | Array of `{id, label, content, disabled?}`. `content` is a typed reference to **one** registered component (`Stack`, `Card`, `Grid`, `Text`, `Chart`, `Input`, `Tabs`, …); wrap several in a `Stack`. The list lives in `visual/shared/contentRefs.ts` |
| `value` | A bare `$variable` declared with a tab id (two-way), a string for the initial tab, or `null` for the first enabled tab |
| `variant`, `orientation` | As above |

```text
$tab = "chart"
root = Stack([tabs, status], "sm")
tabs = Tabs([{id: "chart", label: "Chart", content: chart}, {id: "table", label: "Table", content: table}], $tab)
chart = Chart("bar", [{m: "Jan", v: 1}, {m: "Feb", v: 2}], "m", [{dataKey: "v", label: "Value"}], "Values")
table = Table([{key: "m", header: "Month"}, {key: "v", header: "Value"}], [{m: "Jan", v: 1}, {m: "Feb", v: 2}], "Values")
status = Text("Showing: " + $tab, "muted")
```

References inside an array of objects are verified to work with the installed SDK (`@openuidev/react-lang` 1.0.2): the child is parsed as a real element node and rendered with `renderNode`. The schema is a getter, like Stack's `children`, so Tabs and the components it can contain may import each other. Tabs can contain other Tabs through `content`.

`value` is wrapped in `reactive()` and read with `useStateField()`. Selecting a tab writes its id to the variable, and every expression that reads it updates. With a literal or no value the selection is local (the SDK's non-reactive fallback is keyed per instance). The tab list is not disabled while streaming (switching views is harmless); tabs or content still streaming in are dropped until complete. Duplicate ids from generated programs get a numeric suffix.

Differences from React: no controlled `value` callback (use the `$variable`), `content` is one component rather than arbitrary React content, and ids must be strings.

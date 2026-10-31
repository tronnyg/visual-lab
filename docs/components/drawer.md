# Drawer

Classification: `level: "composite"`, `family: "overlay"`.

```text
visual/components/Drawer/
  Drawer.tsx            React component and public props
  Drawer.css            Edge placement and sizing
  Drawer.openui.tsx     OpenUI schema, content/trigger references and `$variable` binding
  Drawer.examples.ts    OpenUI examples, spread into `examples` in registry.ts
```

A Drawer is a [Dialog](dialog.md) with a different presentation, not a different accessibility model: it renders the same shared `ModalDialog` (a native `<dialog>` opened with `showModal()`), so inert background, focus containment, Escape, backdrop dismissal, focus return, labelling and the trigger composition are identical and documented there. `Drawer.tsx` imports nothing from OpenUI, the board or MCP. Use Dialog for centred content that needs a decision and a Drawer for supporting content (details, filters, navigation). Use [Popover](popover.md) for small content beside its trigger.

## React API

The props of [Dialog](dialog.md#react-api) (`open`, `defaultOpen`, `onOpenChange`, `trigger`, `title`, `description`, `children`, `closeOnBackdrop`, `closeOnEscape`, `showCloseButton`) plus:

| Prop | Type | Notes |
| --- | --- | --- |
| `side` | `left \| right \| top \| bottom` | The edge the panel is attached to. Default `right` |

```tsx
<Drawer title="Filters" side="left" trigger={<Button variant="outline">Filters</Button>}>
  <FilterForm />
</Drawer>
```

## Sizing and scrolling

- **Left/right**: as tall as the viewport (`100dvh`), `420px` wide, never wider than the viewport minus a 24px gutter, so on a phone the backdrop stays tappable.
- **Top/bottom**: as wide as the viewport, as tall as the content, at most 70% of the viewport height.
- The title and the close button stay in view; the body scrolls. A scrolling body is a keyboard tab stop only while it overflows.
- No slide animation in this version: the panel appears in place.

## OpenUI API

```text
Drawer(title, content, trigger?, open?, side?, description?, closeOnBackdrop?, closeOnEscape?)
```

Same references and `open` rules as [Dialog](dialog.md#openui-api) (`content` and `trigger` are typed references to one registered component; `open` is a bare boolean `$variable`, `true`/`false`, or `null`). Only existing actions are used.

```text
$open = false
root = Stack([openBtn, drawer], "sm")
openBtn = Button("Filters", false, "outline", "default", false, false, null, null, @Set($open, true))
drawer = Drawer("Filters", body, null, $open, "left")
body = Stack([urgent, apply], "md")
urgent = Checkbox($urgent, "Only urgent")
apply = Button("Apply", false, "primary", "default", false, false, null, null, @Set($open, false))
$urgent = false
```

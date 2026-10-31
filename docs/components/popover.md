# Popover

Classification: `level: "composite"`, `family: "overlay"`.

```text
visual/components/Popover/
  Popover.tsx            React component and public props
  Popover.css            Padding and width of the panel
  Popover.openui.tsx     OpenUI schema, trigger/content references and `$variable` binding
  Popover.examples.ts    OpenUI examples, spread into `examples` in registry.ts
visual/shared/
  AnchoredPanel.tsx      Floating UI positioning + top-layer panel shared with Tooltip and DropdownMenu
  Anchored.css           Surface shared by the anchored overlays
  dismiss.ts             Escape stack and outside-press/focus dismissal
```

`Popover.tsx` imports nothing from OpenUI, the board or MCP. Use it for small interactive content next to its trigger. Use [Tooltip](tooltip.md) for brief non-interactive text, [Dialog](dialog.md) for focused modal content and [DropdownMenu](dropdown-menu.md) for a list of actions.

## React API

| Prop | Type | Notes |
| --- | --- | --- |
| `trigger` | `ReactNode` | Required. The element that toggles the popover, usually a button. Plain text becomes a button |
| `children` | `ReactNode` | Required. Mounted only while open |
| `open` / `defaultOpen` / `onOpenChange` | | Controlled / initial uncontrolled state / called when the user toggles or dismisses (never on first render) |
| `placement` | `top \| bottom \| left \| right` | Preferred side. Default `bottom`. Flips when there is no room |
| `align` | `start \| center \| end` | Along that side. Default `center`. Flips to the other alignment before it would overflow |
| `closeOnOutsideClick`, `closeOnEscape` | `boolean` | Default `true` |
| `label` | `string` | Optional accessible name. When set the panel is a `role="group"` with that name |

```tsx
<Popover trigger={<Button variant="outline">Filters</Button>} placement="bottom" align="start">
  <FilterForm />
</Popover>
```

## Behavior and accessibility

- **Disclosure, not dialog.** The trigger gets `aria-expanded` and (while open) `aria-controls`. The panel has no `dialog` role unless you give a `label`, and then only `group`. It is not modal and nothing behind it is inert.
- **Focus is never moved or trapped.** The panel is rendered right after the trigger in the DOM, so Tab leads from the trigger into it and on to the next control; Shift+Tab returns. Clicking inside never loses focus. Escape closes and returns focus to the trigger when it was inside the panel. Focus moving outside the trigger and panel (Tab past the end) closes it.
- **Dismissal**: Escape and a press outside close it (each can be turned off). The trigger counts as inside, so pressing it toggles instead of closing and reopening. With several layers open (a Popover inside a Dialog) Escape closes only the topmost one.
- **Positioning** uses `@floating-ui/react-dom`: it flips to the opposite side, shifts along the edge to stay 8px inside the viewport, limits its size to the available space (`--vl-available-width/height`) and follows scrolling in any ancestor, resizing and layout changes.
- **Top layer, no portal.** The panel is a manual `popover` shown with `showPopover()`: the browser draws it above everything, so it is never clipped by an ancestor's `overflow` and needs no z-index. Because it stays in the DOM beside its trigger it is also inside an open modal Dialog (an element portalled to `<body>` would be inert there). Manual means the browser adds no light dismissal of its own.
- Closed content is not rendered, so state inside it is local to one opening. (In OpenUI, state lives in `$variables`, so it persists.)

## OpenUI API

```text
Popover(trigger, content, placement?, align?, open?, closeOnOutsideClick?, closeOnEscape?)
```

`trigger` and `content` are typed references to one registered component each (`visual/shared/contentRefs.ts`); the trigger is normally a `Button` and needs no action. `open` is a bare boolean `$variable` (two-way), `true`/`false` for the initial state, or `null`.

```text
$open = false
root = Stack([popover, state], "sm")
popover = Popover(trigger, body, "right", "start", $open)
trigger = Button("Quick note", false, "outline")
body = Stack([note, close], "sm")
note = Textarea($note, "Write a note", false, "Note", 3)
close = Button("Done", false, "primary", "default", false, false, null, null, @Set($open, false))
state = Text($open ? "Popover is open" : "Popover is closed", "muted", "caption")
$note = ""
```

Only existing actions are used; the OpenUI regression test (`Overlays.openui.stories.tsx`) covers the `$open` binding, the nested content with its own binding, `@Set` from inside and Escape writing back.

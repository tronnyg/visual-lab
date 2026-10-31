# Tooltip

Classification: `level: "composite"`, `family: "overlay"`.

```text
visual/components/Tooltip/
  Tooltip.tsx            React component and public props
  Tooltip.css            Small inverse surface
  Tooltip.openui.tsx     OpenUI schema and trigger reference
  Tooltip.examples.ts    OpenUI examples, spread into `examples` in registry.ts
```

`Tooltip.tsx` imports nothing from OpenUI, the board or MCP. It uses the shared `AnchoredPanel` (see [Popover](popover.md)). A tooltip is short, supplementary text for a control. It never holds interactive content (use [Popover](popover.md)) and is never the only place essential information appears.

## React API

| Prop | Type | Notes |
| --- | --- | --- |
| `content` | `string` | Required. Plain text |
| `children` | `ReactNode` | Required. The element described, usually a button or link. Plain text becomes a button |
| `placement` | `top \| bottom \| left \| right` | Preferred side. Default `top`. Flips when there is no room |
| `delay` | `number` | Milliseconds the pointer must rest before it appears. Default `300`. Keyboard focus shows it at once |
| `disabled` | `boolean` | Never appears; the trigger is not described by it |
| `className`, `id`, `ref`, other `<div>` attributes | | Applied to the tooltip |

```tsx
<Tooltip content="Save your changes"><Button>Save</Button></Tooltip>
```

## Behavior and accessibility

- The tooltip is always in the DOM (hidden) with `role="tooltip"`, and the trigger control gets `aria-describedby` pointing at it, **added to** any description the trigger already has. So the description is available to assistive technology whether or not it is showing. It never receives focus and has no `tabindex`.
- **Opens** on pointer hover after `delay` (mouse and pen only; touch does not open it, so there is no persistent touch interaction to invent) and on keyboard focus (`:focus-visible`) immediately.
- **Closes** when the pointer leaves (after a 100 ms grace so the pointer can cross onto the tooltip, which keeps it open: WCAG 1.4.13), on blur, on Escape and on press. The focus caused by a mouse press does not show it.
- **Escape** closes only the topmost layer: a tooltip over a Popover over a Dialog needs three presses. Focus stays on the trigger.
- No focusability is added to non-interactive triggers: a tooltip around plain text works on hover only and gives keyboard users nothing, so wrap a button or link.
- Positioning, flipping, shifting, size limits and top-layer rendering are the shared `AnchoredPanel`'s. Long text wraps at 260px.

## OpenUI API

```text
Tooltip(text, trigger, placement?, delay?, disabled?)
```

`trigger` is a typed reference to one registered component (`visual/shared/contentRefs.ts`), normally a `Button`, which keeps its own action. There is no content reference, no state and no action: tooltips cannot hold anything interactive.

```text
root = Tooltip("Save your changes", save, "bottom")
save = Button("Save", false, "primary")
```

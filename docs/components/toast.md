# Toast

Classification: `level: "composite"`, `family: "feedback"`.

```text
visual/components/Toast/
  Toast.tsx            React component, ToastItem type and the per-notification timer
  Toast.css            Corner placement, card, variant tones, dismiss button
  Toast.openui.tsx     OpenUI schema and item sanitising
  Toast.examples.ts    OpenUI examples, spread into `examples` in registry.ts
```

`Toast.tsx` imports nothing from OpenUI, the board or MCP. There is **no global store, singleton or event bus**: what is shown is exactly the `items` you pass. Use [Alert](alert.md) for a message that stays in the page, [Spinner](spinner.md) or [Skeleton](skeleton.md) for loading.

## React API

| Prop | Type | Notes |
| --- | --- | --- |
| `items` | `ToastItem[]` | Required. Shown in this order |
| `onDismiss` | `(id: string) => void` | Called when a notification is dismissed by its button or its timer. The toast also hides itself, so a static list works without it |
| `position` | `top-right \| top-left \| bottom-right \| bottom-left` | Default `bottom-right` |
| `label` | `string` | Accessible name of the region. Default `Notifications` |

```ts
type ToastItem = {
  id: string;           // unique; identifies the notification across renders
  title: string;
  description?: string;
  variant?: "default" | "success" | "warning" | "error";
  duration?: number;    // ms; 0 = never. Default 5000, warning 8000, error never
};
```

```tsx
const [toasts, setToasts] = useState<ToastItem[]>([]);
<Button onClick={() => setToasts(t => [...t, {id: crypto.randomUUID(), title: "Saved", variant: "success"}])}>Save</Button>
<Toast items={toasts} onDismiss={id => setToasts(t => t.filter(x => x.id !== id))} />
```

Dismissal hides the item immediately. The component remembers that locally for as long as the id stays in `items` and forgets it once the id leaves, so removing it in `onDismiss` (the usual way) and later reusing the id works.

## Behavior

- **Region.** A `<section aria-label="Notifications">` fixed to the corner, containing one persistent `aria-live="polite"` container. It stays in the DOM when empty because a live region has to exist before text is added to it to be announced. It is a manual `popover` shown on mount, which only serves to reach the browser's top layer (no z-index; above ordinary content, below a modal dialog opened later).
- **Announcements.** New items are polite additions. Only `error` has `role="alert"`, so the rest do not interrupt. Non-default variants include their status in words ("Success: ", "Warning: ", "Error: "), not only colour. Notifications never take focus.
- **Timing.** One timer per notification. It pauses while the pointer is over the notification or focus is inside it, keeps the time that was left and resumes afterwards. Errors do not time out by default; warnings last longer. React Strict Mode (effect remount) never leaves two timers.
- **Dismiss button.** A native button named `Dismiss: <title>`, in the tab order wherever the `Toast` sits in the document.
- **Layout.** Cards are at most 420px wide and never wider than the viewport; text wraps. Items keep the order of `items`.
- No action buttons in v1: the existing OpenUI action contract cannot run an action from inside a generated item, so none is offered.

## OpenUI API

```text
Toast(items, position?, label?)
```

Items are objects `{id, title, description?, variant?, duration?}`. Entries with no `id` or `title` (or still streaming) are skipped; a repeated id gets a numeric suffix.

**Limitation.** There is no OpenUI action that removes one item from an array, and none was invented. Dismissing (button or timer) only hides the item on the page, and a reload shows it again. To show a notification *after something happens*, hold the array in a variable and replace it with the existing `@Set`, using a **new id each time** (reusing an id the page already dismissed shows nothing):

```text
$toasts = []
root = Stack([save, toast], "sm")
save = Button("Save", false, "primary", "default", false, false, null, null, @Set($toasts, [{id: "saved-1", title: "Changes saved", variant: "success"}]))
toast = Toast($toasts, "top-right")
```

A static list is also fine: `Toast([{id: "sync", title: "Sync paused", variant: "warning"}], "bottom-left")`.

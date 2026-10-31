# Dialog

Classification: `level: "composite"`, `family: "overlay"`.

```text
visual/components/Dialog/
  Dialog.tsx            React component and public props
  Dialog.css            Width of the centred panel
  Dialog.openui.tsx     OpenUI schema, content/trigger references and `$variable` binding
  Dialog.examples.ts    OpenUI examples, spread into `examples` in registry.ts
visual/shared/
  ModalDialog.tsx       The native <dialog> lifecycle shared with Drawer
  TriggerSlot.tsx       The trigger composition shared by every overlay
  Modal.css             Surface, header, body and close button shared with Drawer
```

`Dialog.tsx` imports nothing from OpenUI, the board or MCP. Use it for focused, modal content. Use [Drawer](drawer.md) for the same container on an edge of the screen, [Popover](popover.md) for small contextual content next to its trigger and [Alert](alert.md) for an inline message. It is a container, not a workflow: confirm and cancel buttons are yours.

## React API

| Prop | Type | Notes |
| --- | --- | --- |
| `title` | `string` | Required. The visible heading (`h2`) and the dialog's accessible name |
| `description` | `string` | Supporting text; also the accessible description |
| `children` | `ReactNode` | Required. Stays mounted while the dialog is closed, so state inside it survives |
| `trigger` | `ReactNode` | An element that opens the dialog, usually a button. Plain text becomes a button. Omit it to open the dialog only through `open` |
| `open` | `boolean` | Makes the component controlled |
| `defaultOpen` | `boolean` | Initial state when uncontrolled. Default `false` |
| `onOpenChange` | `(open: boolean) => void` | Called when the user opens (trigger) or dismisses the dialog (close button, Escape, backdrop), never on first render or when `open` changes from outside |
| `closeOnBackdrop`, `closeOnEscape`, `showCloseButton` | `boolean` | Default `true` |
| `className`, `ref`, other `<dialog>` attributes | | Applied to the `<dialog>` |

```tsx
<Dialog title="Share project" description="Anyone with the link can view." trigger={<Button>Share</Button>}>
  <ShareForm />
</Dialog>
```

A controlled `open` is authoritative: Escape asks for `onOpenChange(false)` and the dialog stays open until the parent changes `open`. If the browser closes the element anyway, it is reopened while the parent still says `open`.

## Native modal dialog

It uses `<dialog>` opened with `showModal()` from an effect (never during render), so the browser provides what a library would otherwise have to: the top layer (no portal, no z-index), an inert page behind it, a focus trap and the `dialog` role. Nothing is rendered on the server beyond the closed element, so there is no hydration mismatch. The page behind does not scroll (`html:has(.vl-modal:modal)`).

- **Initial focus** goes to the first focusable element in the content. The close button comes *after* the content in the DOM (it is positioned in the corner with CSS), so Close is not the first thing focused.
- **Focus return**: closing returns focus to the element that had it when the dialog opened (the browser does this; the component repeats it for browsers that do not focus a button on click).
- **Escape** is handled on the key event: a nested overlay that already used the key (`defaultPrevented`) keeps the dialog open, and with `closeOnEscape={false}` the key is prevented so Chromium cannot close the dialog on a repeated Escape.
- **Backdrop**: a click on the `<dialog>` element itself, outside its panel, dismisses. It only counts when the press also started there, so selecting text or dragging out of the panel does not close it.
- **Nested dialogs** work: a `Dialog` inside a Dialog's content is a second `showModal()`; Escape closes the topmost one.
- A scrolling body becomes a tab stop only while it overflows, so a keyboard user can scroll it.

## Trigger composition

`trigger` is any node. The shared `TriggerSlot` wraps it in a `display: contents` span (no box) that listens for the trigger's bubbling events and writes `aria-haspopup="dialog"` to the real control (the first interactive element inside). No `cloneElement` or Slot is involved, so it also works for the nodes the OpenUI renderer returns, which cannot be given props. A trigger that is not interactive gets no semantics, so pass a button or link.

## OpenUI API

```text
Dialog(title, content, trigger?, open?, description?, closeOnBackdrop?, closeOnEscape?, showCloseButton?)
```

| Argument | Notes |
| --- | --- |
| `content` | A typed reference to **one** registered component (list in `visual/shared/contentRefs.ts`); wrap several in a `Stack` |
| `trigger` | Optional reference, normally a `Button`. It needs no action of its own |
| `open` | A bare boolean `$variable` (two-way), `true`/`false` for the initial state, or `null` |

```text
$open = false
root = Stack([openBtn, dialog], "sm")
openBtn = Button("Edit profile", false, "primary", "default", false, false, null, null, @Set($open, true))
dialog = Dialog("Edit profile", body, null, $open, "Update how others see you.")
body = Stack([name, done], "md")
name = Input($name, null, false, "Display name")
done = Button("Done", false, "outline", "default", false, false, null, null, @Set($open, false))
$name = ""
```

Only existing actions are used: a Button inside the content runs `@Set`, `@Reset` or `@ToAssistant` exactly as anywhere else, and `@Set($open, false)` closes the dialog. Dismissing it (Escape, backdrop, Close) writes `false` back to `$open`. The OpenUI regression tests for this are in `visual/components/Overlays.openui.stories.tsx`.

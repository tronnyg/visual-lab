# DropdownMenu

Classification: `level: "composite"`, `family: "overlay"`.

```text
visual/components/DropdownMenu/
  DropdownMenu.tsx            React component, keyboard model and public props
  DropdownMenu.css            Menu rows, highlight, groups and separators
  DropdownMenu.openui.tsx     OpenUI schema, trigger reference and action/link resolution
  DropdownMenu.examples.ts    OpenUI examples, spread into `examples` in registry.ts
```

`DropdownMenu.tsx` imports nothing from OpenUI, the board or MCP. It uses the shared `AnchoredPanel` (see [Popover](popover.md)). It is an **application menu** of actions opened from a button, with menu keyboard semantics. It is not site navigation: use [NavigationMenu](navigation-menu.md) for destinations that should always be visible, `Select` to choose a value and [Popover](popover.md) for arbitrary interactive content.

## React API

| Prop | Type | Notes |
| --- | --- | --- |
| `items` | `DropdownMenuItem[]` | Required. Ids must be unique |
| `trigger` | `ReactNode` | Required. The element that opens the menu, usually a button. Plain text becomes a button |
| `onSelect` | `(id: string) => void` | Called with an enabled item's id (link items too); the menu then closes |
| `placement` | `top \| bottom \| left \| right` | Default `bottom`. Flips when there is no room |
| `align` | `start \| center \| end` | Default `start` |
| `open` / `defaultOpen` / `onOpenChange` | | Controlled / initial uncontrolled state / called when the user opens or closes (never on first render) |
| `label` | `string` | Accessible name of the menu. Default: the trigger's `aria-label` or text |

```ts
type DropdownMenuItem = {
  id: string;
  label: string;
  disabled?: boolean;
  separatorBefore?: boolean;
  group?: string;   // consecutive items with the same group become a labelled role="group"
  href?: string;    // a link the browser follows
};
```

```tsx
<DropdownMenu
  trigger={<Button variant="outline">Actions</Button>}
  items={[{id: "rename", label: "Rename"}, {id: "delete", label: "Delete", separatorBefore: true}]}
  onSelect={id => run(id)}
/>
```

## Accessibility and keyboard (WAI-ARIA menu button)

- The trigger has `aria-haspopup="menu"`, `aria-expanded` and (while open) `aria-controls`. The popup is `role="menu"` with `menuitem`s, `role="group"` for groups (named by their heading) and `role="separator"`. Disabled items are `aria-disabled`.
- **Roving focus.** Items are not tab stops (`tabindex="-1"`); one is focused at a time. Arrow Down/Up move through *enabled* items and wrap, Home/End jump to the first/last, and typing a letter jumps to the next item starting with it (more letters within 600 ms build a prefix). Hovering with the pointer focuses the item, so the pointer and keyboard share one highlight; the highlight is the `:focus` style (tint plus an accent bar).
- **Opening.** With the keyboard (Enter, Space or Arrow Down) the first item is focused; Arrow Up opens at the last. With the pointer, the menu itself takes focus with no item highlighted, so the arrow keys work straight away.
- **Choosing.** Click, Enter or Space on an item calls `onSelect`, closes the menu and returns focus to the trigger. A disabled item does nothing and stays unfocused by the pointer.
- **Dismissal.** Escape closes and focuses the trigger. A press outside closes. Tab moves on to whatever follows the trigger and the menu closes as focus leaves; Shift+Tab closes and stays on the trigger. With several layers open (a menu in a Dialog) Escape closes only the topmost.
- **Link items** are real `<a role="menuitem">`: the browser navigates (absolute `http(s)` links open in a new tab with `rel="noopener noreferrer"`; `#anchor`, `mailto:`, `tel:` and relative links navigate in place). A script-like scheme (`javascript:`…) is never rendered as a link. Space follows a link like Enter.
- Rendering, positioning, flipping and top-layer behaviour are the shared `AnchoredPanel`'s; the menu stays beside its trigger in the DOM so it works inside an open modal Dialog.
- No submenus, checked items or radio groups in v1.

## OpenUI API

```text
DropdownMenu(items, trigger, placement?, align?)
```

Items are `{id, label, disabled?, separatorBefore?, group?, action?, href?}`; `trigger` is a typed reference to one registered component (normally a `Button`, which needs no action).

**Only existing actions**, resolved exactly as [CommandPalette](command-palette.md) resolves commands: an item's `action` is the SDK's own expression (`@Set`, `@Reset`, `@ToAssistant`, `@OpenUrl`, or `Action([...])`), run through `useTriggerAction()` when chosen and not while streaming. An item with an `href` (a full `https://` URL, `mailto:`, `tel:` or `#anchor`; relative paths are refused because they would resolve against the Visual Lab host) is a native link; `@OpenUrl` only reports an event to the host and does not navigate on the board, so use `href` to actually go somewhere. **An item with neither a supported action nor a safe link is rendered disabled**, never as an interactive-looking item that does nothing. There is no state binding for the open state in OpenUI.

```text
$view = "list"
root = Stack([menu, status], "sm")
menu = DropdownMenu([{id: "grid", label: "Grid view", action: @Set($view, "grid")}, {id: "reset", label: "Reset view", separatorBefore: true, action: @Reset($view)}, {id: "help", label: "Help", href: "https://example.com/help"}], trigger)
trigger = Button("View", false, "outline")
status = Text("Current view: " + $view)
```

# CommandPalette

Classification: `level: "composite"`, `family: "navigation"`.

```text
visual/components/CommandPalette/
  CommandPalette.tsx          React component, dialog and combobox behaviour
  commandPaletteModel.ts      Pure search, grouping and ordering
  CommandPalette.css          Dialog, search field, grouped results
  CommandPalette.openui.tsx   OpenUI schema; runs existing actions or follows links
  CommandPalette.examples.ts  OpenUI examples, spread into `examples` in registry.ts
```

`CommandPalette.tsx` imports nothing from OpenUI, the board or MCP. Use it for searchable actions or destinations. Use [NavigationMenu](navigation-menu.md) for links that should always be visible.

## React API

| Prop | Type | Notes |
| --- | --- | --- |
| `commands` | `{id, label, description?, group?, keywords?, disabled?}[]` | Required. Ids must be unique |
| `open` | `boolean` | Makes the component controlled |
| `defaultOpen` | `boolean` | Initial state when uncontrolled. Default `false` |
| `onOpenChange` | `(open: boolean) => void` | Called when the user opens (shortcut) or dismisses the palette (Escape, backdrop, choosing a command), never on first render or when `open` changes from outside |
| `onSelect` | `(id: string) => void` | Called with an enabled command's id; the palette then closes |
| `placeholder`, `emptyMessage`, `label` | `string` | Search placeholder, "no results" text and the dialog's accessible name |
| `shortcut` | `boolean` | Opt in to Cmd/Ctrl+K. Default `false` |

```tsx
<Button onClick={() => setOpen(true)}>Commands</Button>
<CommandPalette open={open} onOpenChange={setOpen} commands={commands} onSelect={id => run(id)} />
```

The palette has no built-in trigger: open it with your own button, `defaultOpen`, or the opt-in shortcut. It carries no action payloads: it reports the chosen id and you decide what happens.

### Behavior

- **Search** is case-insensitive over label, description and keywords. The query is split on whitespace and every word must appear somewhere in the command (`"open zebra"` finds nothing; `"recent open"` finds "Open recent"). An empty query lists everything. Results keep their original order (no ranking), grouped under `group` in order of first appearance; commands without a group come first, unlabeled. There is no fuzzy matching and no dependency.
- **Highlight**: the first enabled result is highlighted whenever the results change. Arrow Down/Up move through enabled results and wrap; disabled commands are skipped; hovering moves the highlight. Enter chooses the highlighted command (ignored mid-composition). Home/End are left to the text field (caret movement), so they are not bound.
- **Disabled commands** are dimmed with `aria-disabled`, cannot be highlighted or chosen and do not close the palette when clicked.
- **Opening and closing**: controlled `open` is authoritative (Escape asks to close, `onOpenChange(false)`, and the dialog stays open until the parent changes `open`). Each opening starts with an empty search.
- **Empty results** show `emptyMessage` (default "No results found.") in a live region; with results the same region announces the count to screen readers only.

### Modal and focus

It uses the native `<dialog>` opened with `showModal()`, so no dependency, portal or focus-trap code is needed: the browser puts the dialog in the top layer, makes the rest of the page inert (nothing behind it is interactive or focusable), handles Escape, and returns focus to the element that was focused when it opened. The search field receives focus on opening and keeps it; it is an ARIA combobox (`role="combobox"`, `aria-controls`, `aria-activedescendant`) over a `role="listbox"` with `role="group"` sections. A click on the backdrop dismisses; clicks inside do not. The server renders only the closed `<dialog>` (no content, no portal), so there is no hydration mismatch. This pattern is deliberately small and local; the Dialog component planned for the overlays batch can reuse it, and no shared overlay primitive was created ahead of that.

### Keyboard shortcut

Off unless `shortcut` is set. When on, Cmd/Ctrl+K (no other modifiers) opens the palette, calls `preventDefault`, and is ignored while the key event comes from an input, textarea, select or editable element, when the event was already handled, and for key repeat. The listener is added and removed with the component. If several palettes opt in, only the first mounted one answers, so they never open together.

## OpenUI API

```text
CommandPalette(commands, open?, placeholder?, emptyMessage?, shortcut?)
```

| Argument | Notes |
| --- | --- |
| `commands` | Array of `{id, label, description?, group?, keywords?, disabled?, action?, href?}` |
| `open` | A bare boolean `$variable` (declared `false`) that a Button opens with `@Set($palette, true)`, or `true`/`false` for the initial state |
| `placeholder`, `emptyMessage`, `shortcut` | As above |

```text
$palette = false
$theme = "light"
root = Stack([open, status, palette], "sm")
open = Button("Open commands", false, "outline", "default", false, false, null, null, @Set($palette, true))
status = Text("Theme: " + $theme)
palette = CommandPalette([{id: "dark", label: "Dark theme", group: "Appearance", action: @Set($theme, "dark")}, {id: "reset", label: "Reset theme", group: "Appearance", action: @Reset($theme)}], $palette)
```

**Only existing actions.** A command's `action` is the SDK's own action expression (`@Set`, `@Reset`, `@ToAssistant`, `@OpenUrl`, or `Action([...])`), evaluated by the parser and run through `useTriggerAction()` exactly as Button does. The palette adds no command language, dispatcher, script execution or event bus. Choosing a command runs its action and closes the palette (`$palette` is written back to `false`).

**Differences from React:**

- The OpenUI palette can run an action or follow a link; React reports an id to `onSelect`.
- `href` (a full `https://` URL, `mailto:`, `tel:` or `#anchor`, the same rule as Markdown and [NavigationMenu](navigation-menu.md)) is the way to actually navigate: web links open in a new tab, anchors move within the page. `@OpenUrl` only reports an `open_url` event to the host, and the board records it without navigating, so it would look like a navigation and do nothing.
- A command with neither an action nor a safe `href` is rendered **disabled**, never as an interactive-looking item that does nothing. Actions are not run while the document is still streaming.
- `keywords`, `description` and `group` work as in React. Duplicate ids get a numeric suffix.

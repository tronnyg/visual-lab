# Icon

A standalone interface icon drawn by [Lucide](https://lucide.dev). Classification: `level: "foundation"`, `family: "data-display"`.

```text
visual/components/Icon/
  Icon.tsx            React wrapper and the curated icon map (the shared icon vocabulary)
  Icon.css            Size and tone presets (imported from app/layout.tsx)
  Icon.openui.tsx     OpenUI schema: Icon(name, size?, tone?, label?)
  Icon.examples.ts    OpenUI examples, spread into `examples` in registry.ts
```

`Icon.tsx` imports only `lucide-react` and React: nothing from OpenUI, the board, MCP or Next.js. `lucide-react` is a direct dependency (`^0.575.0`); icons are imported by name, so only the listed ones are bundled. Like the other components, `Icon.css` is imported from `app/layout.tsx` because `scripts/gen-library.tsx` runs under `tsx`, which cannot import `.css`.

## Icon, Button, Text and Image

| Use | When |
| --- | --- |
| **Icon** | A standalone glyph for status, emphasis or wayfinding, beside Text or in Stack, Card and Grid |
| **Button** `leadingIcon`, `trailingIcon` | An icon inside a button; it uses the same icon names |
| **Text** | The words next to an icon |
| **Image** | Pictures and illustrations, not interface glyphs |

## React API

```tsx
<Icon name="check" />
<Icon name="info" size="lg" />
<Icon name="alert-triangle" tone="warning" />
<Icon name="lock" label="Private board" />
```

| Prop | Type | Default |
| --- | --- | --- |
| `name` | an allowlisted name (below) | required |
| `size` | `"xs" \| "sm" \| "md" \| "lg" \| "xl"` (12, 14, 16, 20, 24 px) | `"md"` |
| `tone` | `"default" \| "muted" \| "accent" \| "success" \| "warning" \| "danger"` | inherits the text colour |
| `label` | `string` | none (decorative) |

`className` and other `svg` attributes are passed to the element, and `ref` (React 19 ref-as-prop) points at it. An unknown `name` renders nothing.

## OpenUI API

```text
Icon(name, size?, tone?, label?)
```

`name` is required; skip optional arguments with `null`. `name` is validated against the allowlist by the Zod schema, so arbitrary SVG, HTML or icon URLs cannot be requested. Icon is accepted as a child of `Stack`, `Card` and `Grid`.

```text
root = Stack([Icon("check-circle", "md", "success"), Text("Changes saved")], "sm", "horizontal", "center")
```

## Icon names

44 curated Lucide icons. The map in `Icon.tsx` is the single list: the React `name` type, the OpenUI enum, Button's icon enum and this table all derive from it.

| Category | Names |
| --- | --- |
| Navigation | `arrow-right`, `arrow-left`, `arrow-up`, `arrow-down`, `chevron-right`, `chevron-left`, `chevron-up`, `chevron-down`, `external-link`, `home`, `menu` |
| Actions | `plus`, `minus`, `check`, `x`, `edit`, `trash`, `copy`, `download`, `upload`, `send`, `search`, `settings`, `refresh` |
| Status | `info`, `alert-circle`, `alert-triangle`, `check-circle`, `x-circle`, `help-circle`, `clock`, `bell` |
| Content | `file`, `folder`, `image`, `link`, `calendar`, `mail`, `user`, `star`, `heart`, `lock`, `eye`, `lightbulb` |

To add an icon, import it from `lucide-react` in `Icon.tsx` and add it to `iconComponents`. Do not add custom SVGs or a second registry.

## Shared with Button

`Button.openui.tsx` renders `<Icon name={...} />` for `leadingIcon` and `trailingIcon`, and its enum is the same `iconNames` list, so Button and Icon share one vocabulary. The original eight Button names (`arrow-right`, `arrow-left`, `plus`, `check`, `download`, `external-link`, `trash`, `send`) are all still valid, so saved boards keep working; the glyphs are now Lucide's instead of the former hand-drawn paths (`trash` is Lucide's `trash-2`). `Button.tsx` is unchanged: it still takes any `ReactNode`, and Button's wrapper sets the icon size.

## Accessibility

| `label` | Markup |
| --- | --- |
| none (default) | `aria-hidden="true"`; assistive technology skips it |
| set | `role="img"` and `aria-label` |

Beside text that already says the same thing, leave `label` off. Set it only when the icon is the only carrier of meaning, such as a lock icon with no nearby text. The icon is never focusable and has no interaction.

## Styling

`Icon.css` uses `--ui-*` tokens. Without a `tone`, the icon inherits `currentColor`. Tones map to `--ui-text`, `--ui-text-muted`, `--ui-accent-solid`, `--ui-success`, `--ui-warning` and `--ui-danger`; `--ui-success` and `--ui-warning` were added to `styles/tokens.css` and `styles/themes.css` for this component and work in light and dark. State is driven by `data-size` and `data-tone`.

## Limitations

No custom or arbitrary SVG, icon URLs, stroke-width or fill options, animation, or interaction. Use Button for clickable icons.

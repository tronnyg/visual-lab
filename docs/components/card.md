# Card

Visual container that groups children on a bordered or filled surface and stacks them vertically. Classification: `level: "composite"`, `family: "data-display"`.

```text
visual/components/Card/
  Card.tsx           React component and public props
  Card.css           Surface, spacing and elevation rules (imported from app/layout.tsx)
  Card.openui.tsx    OpenUI schema (validated subset of the React API)
  Card.examples.ts   OpenUI example, spread into `examples` in registry.ts
```

Card is visual grouping only. It has no header, title, footer, click behaviour, state or events. Use [Stack](stack.md) inside a Card for rows or any other layout. Like Button, Text and Stack, `Card.css` is imported from `app/layout.tsx` because `scripts/gen-library.tsx` runs under `tsx`, which cannot import `.css`.

## React API

```tsx
<Card variant="filled" shadow="sm">
  <Text preset="subheading">Revenue</Text>
  <Text tone="muted">Illustrative figures only.</Text>
</Card>
```

Children are stacked vertically with a `md` gap, so a Stack is not needed for simple content.

| Prop | Type | Default | Notes |
| --- | --- | --- | --- |
| `variant` | `default \| outline \| filled \| subtle` | `default` | `default` surface + border; `outline` transparent + border; `filled` muted fill, no border; `subtle` faint muted fill + border |
| `padding` | `none \| xs \| sm \| md \| lg` | `md` | 0 / 4 / 8 / 16 / 24 px (`--ui-space-*`), same scale as Stack |
| `gap` | `none \| xs \| sm \| md \| lg` | `md` | Space between children |
| `radius` | `none \| sm \| md \| lg` | `md` | 0 / 2 / 4 / 6 px (`--ui-radius-*`) |
| `shadow` | `none \| sm \| md` | unset (none) | `sm` is a hairline lift; `md` is the theme's `--ui-shadow` |
| `background` | `canvas \| surface \| muted \| accent` | from variant | Overrides the variant's fill; `accent` is `--ui-accent-tint` |
| `border` | `boolean` | from variant | Overrides the variant's border visibility |
| `width` | `auto \| full \| sm \| md \| lg` | `auto` | `full` is 100%; `sm`/`md`/`lg` are 100% up to 480 / 640 / 800 px |
| `children`, `className`, `ref`, other `<div>` attributes | | | `ref` is a normal prop (React 19) |

Appearance is emitted as `data-*` attributes and styled in `Card.css`; there is no inline styling. All colours come from `--ui-*` tokens, so light and dark themes need nothing extra. Card renders a `div`.

## OpenUI API

```text
Card(title?, body?, children?, variant?, padding?, gap?, radius?, shadow?, background?, border?, width?)
```

`children` is an array of typed references to `Text`, `Markdown`, `Image`, `Divider`, `Grid`, `Icon`, `Spacer`, `Button`, `Input`, `Stack` or `Card` (the same approach as Stack), so Cards nest and mix with other components. To accept a newly registered component as a child, add its `.ref` to the union in `Card.openui.tsx` (and to Stack's). A skipped optional argument (`null`) uses the default.

`title` and `body` are the original Card arguments and keep their positions so stored boards and `Card("Title", "Body")` calls still render. They are legacy and exist only in the OpenUI adapter, which renders them as a `Text` heading and a muted `Text` paragraph before the children, with a `sm` gap unless `gap` is set. New documents should skip them with `null` and use `Text` children.

```text
root = Stack([summary, row], "lg")
summary = Card(null, null, [name, note], "filled", "lg")
name = Text("Revenue", "default", "subheading", "h3")
note = Text("Illustrative figures only.", "muted")
row = Stack([a, b], "md", "horizontal", "stretch", "start", true)
a = Card(null, null, [Text("Outline")], "outline")
b = Card(null, null, [Text("Raised"), Button("Open")], "default", "md", "sm", "lg", "sm")
```

## Limitations

- Children must be registered components; raw strings or numbers are rejected. Use `Text`.
- The positional `null, null` for the legacy `title`/`body` is needed to reach `children`.
- `subtle` and `shadow="sm"` use component-local colour mixes, not dedicated tokens.
- No click handling, header or footer slots, or collapsing.

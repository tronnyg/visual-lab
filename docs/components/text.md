# Text

Typography primitive for headings, paragraphs, labels, captions and reactive text. Classification: `level: "foundation"`, `family: "typography"`.

```text
visual/components/Text/
  Text.tsx           React component and public props
  Text.css           Presets, sizes, tones and layout (imported from app/layout.tsx)
  Text.openui.tsx    OpenUI schema (validated subset of the React API)
  Text.examples.ts   OpenUI examples, spread into `examples` in registry.ts
```

`Text.tsx` imports nothing from OpenUI, the board or MCP. Like Button, `Text.css` is imported from `app/layout.tsx` because `scripts/gen-library.tsx` runs under `tsx`, which cannot import `.css`.

## Text and Markdown

`Text` formats **one text element**: one string, one element, one set of typographic options. It has no state, no interactions and no rich content: no inline segments, no nested `Text`, no links and no Markdown parsing.

Use the [Markdown](markdown.md) component for formatted paragraphs, lists, links, code blocks and whole documents. Markdown renders its headings and paragraphs with `Text`, so both use the same presets in `Text.css`.

## React API

```tsx
<Text as="h1" preset="title">Visual Lab</Text>
<Text tone="muted" lineClamp={2}>{longDescription}</Text>
<Text as="label" htmlFor="email" preset="label">Email</Text>
```

| Prop | Type | Default | Notes |
| --- | --- | --- | --- |
| `as` | `h1`–`h6`, `p`, `span`, `strong`, `em`, `label` | `p` | Element only; does not change appearance |
| `preset` | `body \| title \| heading \| subheading \| label \| caption \| overline \| code` | `body` | Size, weight, line height and spacing together |
| `size` | `xs \| sm \| md \| lg \| xl \| 2xl \| 3xl \| 4xl` | from preset | 12 / 13 / 15 / 17 / 21 / 26 / 30 / 38 px |
| `weight` | `regular \| medium \| semibold \| bold` | from preset | 400 / 500 / 600 / 700 |
| `lineHeight` | `none \| tight \| snug \| normal \| relaxed` | from preset | 1 / 1.2 / 1.35 / 1.5 / 1.65 |
| `tone` | `default \| muted \| accent \| danger` | `default` | Uses `--ui-text`, `--ui-text-muted`, `--ui-accent-solid`, `--ui-danger` |
| `align` | `start \| center \| end \| justify` | inherited | |
| `italic`, `underline`, `strikethrough` | `boolean` | `false` | Underline and strikethrough combine |
| `highlight` | `boolean` | `false` | Marker background from `--ui-accent-tint` |
| `wrap` | `wrap \| nowrap \| balance \| pretty` | `wrap` | `balance`/`pretty` set `text-wrap` |
| `preserveWhitespace` | `boolean` | `false` | `white-space: pre-wrap`; keeps line breaks |
| `truncate` | `boolean` | `false` | One line with an ellipsis; makes the element block-level |
| `lineClamp` | `1`–`6` | none | Ellipsis after N lines; wins over `truncate` |
| `htmlFor` | `string` | none | Only type-checks when `as="label"` |
| `children`, `className`, `ref`, other `<p>` attributes | | | `ref` is a normal prop (React 19) |

Presets: `title` 30 px / 650 / tight, `heading` 21 px / 600 / snug, `subheading` 17 px / 600, `body` 15 px / relaxed, `label` 13 px / 500, `caption` 12 px, `overline` 12 px uppercase with letter spacing, `code` 13 px monospace. `title`, `heading` and `body` match the three sizes of the original Text.

### Semantics are separate from appearance

`as="h1"` alone renders an `<h1>` that looks like body text, and `as="strong"` is not bold unless `weight="bold"`. Choose the element for document structure and the preset for looks. Appearance is emitted as `data-*` attributes (`data-preset`, `data-tone`, `data-size`, ...) and styled in `Text.css`; there is no inline styling.

## OpenUI API

```text
Text(value, tone?, preset?, as?, size?, weight?, align?, italic?, underline?, strikethrough?, highlight?, lineHeight?, wrap?, preserveWhitespace?, truncate?, lineClamp?)
```

| Argument | Values |
| --- | --- |
| `value` | string or number (required); may be an expression |
| `tone`, `preset`, `size`, `weight`, `align`, `lineHeight`, `wrap` | as React |
| `as` | `h1`–`h6`, `p`, `span`, `strong`, `em` (`label` is not offered: OpenUI has no form control to point it at) |
| `italic`, `underline`, `strikethrough`, `highlight`, `preserveWhitespace`, `truncate` | boolean |
| `lineClamp` | 1–6 |

**Compatibility.** `value`, `tone` and the third argument keep their positions from `Text(value, tone?, size?)`. The old `size` values `body`, `title` and `heading` are now `preset` values with the same appearance, so existing boards render as before. The one visible difference is that headings in existing boards are still `<p>` elements; add `as` for a real heading. Use `null` to skip an optional argument.

**Reactive text.** `value` is a plain schema field, not `reactive()` (that is for two-way input bindings). The renderer evaluates expressions before the component sees them, so the text re-renders when a variable changes:

```text
root = Stack([status, add])
$count = 0
status = Text("Clicked " + $count + " times", "default", "heading", "h2")
add = Button("Add one", false, "primary", "default", false, false, null, null, @Set($count, $count + 1))
```

Limitations: plain text only (no nested `Text`, inline segments or Markdown), no `label`/`htmlFor`, no class names, styles or HTML attributes. The renderer does not enforce the `lineClamp` range; a value outside 1–6 is accepted but has no effect.

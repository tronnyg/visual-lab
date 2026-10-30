# Markdown

Renders a Markdown string as formatted, semantic HTML. Classification: `level: "composite"`, `family: "typography"`.

```text
visual/components/Markdown/
  Markdown.tsx           React component (react-markdown + remark-gfm)
  Markdown.css           Block spacing, lists, code, tables, images (imported from app/layout.tsx)
  Markdown.openui.tsx    OpenUI schema: Markdown(source)
  Markdown.examples.ts   OpenUI examples, spread into `examples` in registry.ts
```

`Markdown.tsx` imports nothing from OpenUI, the board or MCP; it depends only on `react-markdown`, `remark-gfm` and `Text`. It is stateless and deterministic: the same `source` always renders the same output. Like the other components, `Markdown.css` is imported from `app/layout.tsx` (after `Text.css`) because `scripts/gen-library.tsx` runs under `tsx`, which cannot import `.css`.

## Markdown and Text

| Use | When |
| --- | --- |
| **Markdown** | Rich or structured content: explanations, documents, lists, tables, code, quotes, links, images |
| **Text** | One label, heading, short value, caption, or text that must react to state on its own |
| **Stack**, **Card** | Layout and grouping around either; Markdown nests inside both |

Markdown is the better choice whenever you would otherwise write many consecutive `Text` components. Typography and spacing are automatic, so the AI supplies no styling.

## React API

```tsx
<Markdown source={"# Title\n\nSome **bold** text."} />
```

| Prop | Type | Notes |
| --- | --- | --- |
| `source` | `string` | Markdown text |
| `className`, other `<div>` attributes | | Applied to the wrapper `div.vl-markdown` |

There are no visual styling props.

## OpenUI API

```text
Markdown(source)
```

`source` is a string and may be an expression, e.g. `Markdown("Clicked **" + $count + "** times")`. Expressions are evaluated by the renderer before they reach the component, the same as `Text.value`, so the document updates when the variable changes. In OpenUI a source string uses `\n` for line breaks and `\"` for quotes.

Markdown is accepted as a child of `Stack` and `Card`. Markdown cannot contain OpenUI components.

## Supported syntax

CommonMark plus GitHub Flavored Markdown: headings `#`–`######`, paragraphs and line breaks, bold, italic, ~~strikethrough~~, ordered/unordered and nested lists, links, inline code, fenced code blocks (the language is kept as `class="language-x"`; there is no highlighting), blockquotes, horizontal rules, tables (with column alignment), task lists and images.

Not supported: raw HTML, syntax highlighting, math, Mermaid, custom directives, image sizing syntax, and embedded OpenUI components.

Task-list checkboxes are display-only (`disabled`).

## Images

`![A description](https://example.com/picture.png)` renders an `<img>` in normal flow with `max-width: 100%` and `height: auto`, so it keeps its aspect ratio and never exceeds the column. It uses `loading="lazy"`, `decoding="async"` and `referrerPolicy="no-referrer"`. If the image fails to load the browser shows its alt text instead of breaking the layout.

Only absolute `http(s)` image URLs are allowed. Boards have no asset directory, so relative paths such as `/logo.png` would resolve against the Visual Lab host and are refused; a refused image renders its alt text.

Markdown images are intentionally basic: no sizing, captions, galleries, zoom or actions. Use the [Image](image.md) component for standalone images and richer presentation. Markdown does not depend on it, and its rules differ: Markdown images must be absolute `http(s)` URLs, while Image also accepts root-relative paths.

## Security

Markdown is treated as untrusted input.

- Raw HTML is not interpreted. `<script>` or `<img onerror=…>` in the source is escaped and shown as text. There is no `dangerouslySetInnerHTML`, no `rehype-raw` and no sanitizer dependency, because there is no HTML to sanitize.
- URLs go through react-markdown's `defaultUrlTransform`, which removes `javascript:`, `data:`, `vbscript:` and other unknown schemes, then through a narrower allow-list in `urlTransform`: links may use `http:`, `https:`, `mailto:`, `tel:` or `#anchor`; images must be `http(s)://`. A refused link renders as plain link text without `href`.
- Absolute links open with `target="_blank" rel="noopener noreferrer"`.
- Remote images are fetched by the viewer's browser without a referrer. Loading an image reveals the viewer's IP address to the image host, as with any remote image.

## Styling

Headings and paragraphs are rendered **with the `Text` component**, so they take their size, weight and line height from the `Text.css` presets and cannot drift from them:

| Markdown | Text |
| --- | --- |
| `#` | `title` preset (`h1`) |
| `##` | `heading` (`h2`) |
| `###` | `subheading` (`h3`) |
| `####` | body size, semibold (`h4`) |
| `#####` | `label`, semibold (`h5`) |
| `######` | `label`, muted (`h6`) |
| paragraph | `body` |

`Markdown.css` adds only what Text has no preset for: 16 px spacing between blocks (`--ui-space-4`), list indentation, accent-coloured links with hover and focus states, inline code and code blocks on `--ui-surface-muted` (code blocks scroll horizontally), a muted blockquote with a left rule, bordered tables that scroll inside their own wrapper on narrow screens, and responsive images. Everything uses `--ui-*` tokens, so light and dark themes work without extra rules. There is no Tailwind and no inline styling; the only inline style is the `text-align` that GFM table alignment produces.

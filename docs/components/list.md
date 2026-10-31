# List

Classification: `level: "composite"`, `family: "data-display"`.

```text
visual/components/List/
  List.tsx          React component and public props
  List.css          Markers, spacing and nesting (imported through styles/components.css)
  List.openui.tsx   OpenUI schema: List(items, variant?, start?, density?)
  List.examples.ts  OpenUI examples, spread into `examples` in registry.ts
  List.stories.tsx  Storybook stories
```

`List.tsx` renders native `ul`/`ol` and `li` elements and imports nothing from OpenUI, the board or MCP. It takes a data array rather than compound children. The browser's own markers are kept (never `list-style: none`), so assistive technology announces a list with its item count and position.

## React API

| Prop | Type | Default |
| --- | --- | --- |
| `items` | `{content: ReactNode; items?: ListItem[]}[]` | required |
| `variant` | `"unordered" \| "ordered"` | `"unordered"` |
| `start` | `number` (ordered lists only) | `1` |
| `density` | `"default" \| "compact"` | `"default"` |

```tsx
<List variant="ordered" start={3} items={[{content: "Prepare materials"}, {content: <strong>Review results</strong>}]} />
<List items={[{content: "Frontend", items: [{content: "Components"}]}]} />
```

`content` can be any `ReactNode`. A nested `items` array renders as a list inside the parent `li`, in the same variant and density, to any depth. An empty `items` array renders nothing. `className`, `style` and other list attributes (for example `aria-label`) go to the `ul`/`ol`, and `ref` (React 19 ref-as-prop) points at it.

Markers use `--ui-text-muted`. Nested unordered lists switch from discs to circles and nested ordered lists to lower-case letters. Colours are `--ui-*` tokens, so the light and dark themes need no extra rules.

## OpenUI API

```text
List(items, variant?, start?, density?)
```

| Argument | Notes |
| --- | --- |
| `items` | Strings, or `{content, items}` objects whose `items` is a nested array of strings |
| `variant` | `unordered` (default) or `ordered` |
| `start` | First number of an ordered list |
| `density` | `default` or `compact` |

```text
root = List(items, "ordered", 1, "compact")
items = ["Prepare materials", {content: "Review results", items: ["Check totals", "Check sources"]}, "Summarize findings"]
```

List is accepted as a child of `Stack`, `Card` and `Grid`.

### Differences from React

- OpenUI items are **plain text**; rich content (links, bold text, components) is React-only. Use [Markdown](markdown.md) for rich lists.
- OpenUI allows **one nested level** (items of items). The SDK cannot describe a self-referencing object schema in the generated prompt (it recurses forever), so the schema is deliberately not recursive. The React `List` nests to any depth.

## Limitations

No checklists, custom markers, icons, definition lists (use [KeyValue](key-value.md)) or collapsible items.

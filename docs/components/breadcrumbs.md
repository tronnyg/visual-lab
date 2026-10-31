# Breadcrumbs

Classification: `level: "composite"`, `family: "navigation"`.

```text
visual/components/Breadcrumbs/
  Breadcrumbs.tsx          React component and public props
  Breadcrumbs.css          Wrapping trail, separators, current-page styling
  Breadcrumbs.openui.tsx   OpenUI schema and literal-link adapter
  Breadcrumbs.examples.ts  OpenUI examples, spread into `examples` in registry.ts
visual/shared/links.ts     link safety rules shared by the navigation components
```

`Breadcrumbs.tsx` imports nothing from OpenUI, the board or MCP, and no router: crumbs are ordinary `<a href>` links that the browser follows. Use it for the hierarchical path to the current page. Use NavigationMenu for a set of destinations and [Tabs](tabs.md) for views on one page.

## React API

| Prop | Type | Notes |
| --- | --- | --- |
| `items` | `{label, href?, current?, external?}[]` | Required. The path in order |
| `separator` | `string` | Decorative text between crumbs. Default `/`. `""` shows none |
| `aria-label` | `string` | Name of the landmark. Default `Breadcrumb` |
| `className`, `ref`, other `<nav>` attributes | | Applied to the `<nav>` |

```tsx
<Breadcrumbs items={[{label: "Home", href: "/"}, {label: "Docs", href: "/docs"}, {label: "Install"}]} />
```

Behavior:

- **Current crumb:** the first item with `current: true`, otherwise the last. It gets `aria-current="page"`. If it has an `href` it stays a link carrying `aria-current` (as in the WAI-ARIA example); without one it is plain text.
- **No clickable dead links:** a crumb without an `href` is a `<span>`. An `href` that is not safe (`javascript:`, `data:`, `vbscript:`, any scheme but web, mail and phone; whitespace tricks like `java\nscript:` included) is dropped and the crumb becomes plain text. Relative paths and `#anchors` are allowed in React.
- `external: true` adds `target="_blank"` and `rel="noopener noreferrer"`.
- **Long labels wrap** (`overflow-wrap: anywhere`) instead of truncating, so no text is lost. The trail itself wraps onto several lines.
- No items renders nothing (no empty landmark). One item renders a single current crumb with no separator.

## Accessibility

A `<nav aria-label="Breadcrumb">` containing an `<ol>`; separators are `aria-hidden` text, not list content. Links are in the tab order with a visible 2px `--ui-accent-solid` focus outline; plain-text crumbs are not focusable. The current crumb is also set apart visually (`--ui-text`, weight 500), not by colour alone.

## OpenUI API

```text
Breadcrumbs(items, separator?)
```

| Argument | Notes |
| --- | --- |
| `items` | Array of `{label, href?, current?}` |
| `separator` | Text between crumbs. Default `/` |

```text
root = Breadcrumbs([{label: "Home", href: "https://example.com"}, {label: "Docs", href: "https://example.com/docs"}, {label: "Install"}])
```

The adapter uses the same link rule as [Markdown](markdown.md): `href` must be an `https://` / `http://` URL, `mailto:`, `tel:` or `#anchor`. Anything else (relative paths, other schemes) is shown as plain text, because a relative path would resolve against the Visual Lab host and navigate away from the board. Web links open in a new tab, as Markdown links do.

**No navigation action.** The SDK's `@OpenUrl` step only reports an `open_url` event to the host; the board forwards it to `/api/events` and does not navigate. Presenting a crumb that triggers it would look interactive and do nothing, so crumbs navigate only through real links. Differences from React: no relative links, no `external` flag (derived from the URL), no `aria-label` override.

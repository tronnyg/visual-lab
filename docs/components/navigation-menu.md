# NavigationMenu

Classification: `level: "composite"`, `family: "navigation"`.

```text
visual/components/NavigationMenu/
  NavigationMenu.tsx          React component and public props
  NavigationMenu.css          Horizontal and vertical lists, active and disabled states
  NavigationMenu.openui.tsx   OpenUI schema and literal-link adapter
  NavigationMenu.examples.ts  OpenUI examples, spread into `examples` in registry.ts
```

`NavigationMenu.tsx` imports nothing from OpenUI, the board or MCP, and no router: destinations are ordinary `<a href>` links that the browser follows. Use it for destinations and application sections. Use [Breadcrumbs](breadcrumbs.md) for the path to the current page and [Tabs](tabs.md) for views on one page.

## React API

| Prop | Type | Notes |
| --- | --- | --- |
| `items` | `{id, label, href?, disabled?, external?}[]` | Required. A flat list of destinations |
| `activeId` | `string` | The destination for the current page; it gets `aria-current="page"` |
| `orientation` | `horizontal \| vertical` | Default `horizontal` (a wrapping row) |
| `aria-label` | `string` | Landmark name. Default `Navigation`; give each menu on a page a different one |
| `className`, `ref`, other `<nav>` attributes | | Applied to the `<nav>` |

```tsx
<NavigationMenu aria-label="Main" activeId="docs" items={[
  {id: "home", label: "Home", href: "/"},
  {id: "docs", label: "Docs", href: "/docs"},
  {id: "billing", label: "Billing", disabled: true},
]} />
```

Behavior:

- **Only links are interactive.** A disabled item, an item without an `href`, or one whose `href` is unsafe (`javascript:`, `data:`, other non-web schemes) renders as plain text in a `<span>`: not focusable, not activatable. A disabled item also carries `aria-disabled="true"`.
- Only the first item whose id equals `activeId` is current; an unknown or missing `activeId` marks nothing.
- `external: true` adds `target="_blank"` and `rel="noopener noreferrer"`.
- No items renders nothing (no empty landmark).

## Accessibility

A `<nav>` landmark containing a list of links, with `aria-current="page"` on the active one. It deliberately does **not** use the ARIA `menu` roles, which are for application menus with arrow-key roving; this is website navigation, so Tab moves between links and Enter follows one. Links show a 2px `--ui-accent-solid` focus outline. The active link has a tint, an accent bar and full-strength text, so it is not distinguished by colour alone.

## v1 limitation: no submenus

The component is a flat list. A dropdown or nested submenu needs an overlay with focus management, which is planned with Dialog in the overlays batch, so it is deferred rather than built as a half-working version. For sectioned navigation, use several menus (each with its own `aria-label`) under headings.

## OpenUI API

```text
NavigationMenu(items, activeId?, orientation?, label?)
```

| Argument | Notes |
| --- | --- |
| `items` | Array of `{id, label, href?, disabled?}` |
| `activeId` | Id of the current destination, or `null` |
| `orientation` | `horizontal` (default) or `vertical` |
| `label` | Accessible name of the menu |

```text
root = NavigationMenu([{id: "home", label: "Home", href: "https://example.com"}, {id: "docs", label: "Docs", href: "https://example.com/docs"}], "docs", "horizontal", "Main")
```

The adapter uses the same link rule as [Markdown](markdown.md) and [Breadcrumbs](breadcrumbs.md): `href` must be an `https://` / `http://` URL, `mailto:`, `tel:` or `#anchor`; anything else is shown as plain text, because a relative path would resolve against the Visual Lab host and navigate away from the board. Web links open in a new tab.

**No navigation action and no reactive active item.** `@OpenUrl` only reports an `open_url` event to the host (the board forwards it to `/api/events` and does not navigate), so an item that triggered it would look interactive and do nothing. `activeId` is plain metadata set by the program rather than by clicking. Differences from React: no relative links, no `external` flag (derived from the URL).

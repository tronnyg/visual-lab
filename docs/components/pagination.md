# Pagination

Classification: `level: "composite"`, `family: "navigation"`.

```text
visual/components/Pagination/
  Pagination.tsx          React component and public props
  paginationModel.ts      Pure page-window algorithm and input sanitising
  Pagination.css          Page buttons, current-page state, compact variant
  Pagination.openui.tsx   OpenUI schema and `$variable` binding
  Pagination.examples.ts  OpenUI examples, spread into `examples` in registry.ts
```

`Pagination.tsx` imports nothing from OpenUI, the board or MCP. It **never owns, slices or fetches data**: it only tracks and reports the current page, and the parent decides what each page shows.

## React API

| Prop | Type | Notes |
| --- | --- | --- |
| `totalPages` | `number` | Required. Fractions are rounded down; below 1 renders nothing |
| `page` | `number` | Current page from 1. Makes the component controlled |
| `defaultPage` | `number` | Initial page when uncontrolled. Default 1 |
| `onPageChange` | `(page: number) => void` | Called when the user picks a page different from the current one, never on first render or when `page` changes from outside |
| `siblingCount` | `number` | Pages each side of the current page. Default 1 |
| `boundaryCount` | `number` | Pages always shown at each end. Default 1; 0 hides the first/last page buttons |
| `variant` | `default \| compact` | `compact` shows only previous, "Page X of Y" and next |
| `disabled` | `boolean` | Disables every control |
| `aria-label` | `string` | Landmark name. Default `Pagination` |

```tsx
<Pagination page={page} totalPages={Math.ceil(total / pageSize)} onPageChange={setPage} />
```

Behavior:

- **Invalid values are handled safely.** The displayed page is clamped to `1..totalPages` (NaN, negative or too-large values included) without calling `onPageChange`; counts are rounded down and cannot be negative. A controlled `page` is authoritative: clicking asks for a change and the page moves only when the parent updates it.
- **Bounded window.** `getPageItems` (in `paginationModel.ts`) returns at most `2 * boundaryCount + 2 * siblingCount + 3` slots however many pages there are, with the same number of slots at every position so the control does not change width while paging. A gap of one page shows that page instead of an ellipsis. The function is pure and its behaviour is pinned by the `PageWindowAlgorithm` story.
- Zero pages renders nothing; one page renders page 1 as current with previous and next disabled.

## Accessibility

A `<nav aria-label="Pagination">` holding a list of native buttons. Page buttons are named "Page N" and the current one has `aria-current="page"` (and a border and tint, not colour alone). Previous and next are named "Previous page" and "Next page" and are disabled at the boundaries. The ellipsis is a non-interactive, `aria-hidden` list item. All controls are in the tab order and show a 2px `--ui-accent-solid` focus outline.

## OpenUI API

```text
Pagination(page, totalPages, variant?, siblingCount?, boundaryCount?, disabled?)
```

| Argument | Notes |
| --- | --- |
| `page` | A bare number `$variable` declared with the start page (two-way), or a number for the starting page (then local) |
| `totalPages` | Number of pages |
| `variant`, `siblingCount`, `boundaryCount`, `disabled` | As above |

```text
$page = 1
root = Stack([table, pager], "md")
table = Table([{key: "name", header: "Name"}], @Filter(people, "page", "==", $page), "People, 2 per page")
pager = Pagination($page, 3, "compact")
people = [{page: 1, name: "Alex"}, {page: 1, name: "Sam"}, {page: 2, name: "Priya"}, {page: 2, name: "Jordan"}, {page: 3, name: "Chen"}]
```

`page` is wrapped in `reactive()` and read with `useStateField()`: choosing a page writes it to the variable and every expression that reads it updates. **Pagination does not touch the data.** Tying a table or list to the page is the program's job (above, with the existing `@Filter` function). The SDK has no action that carries a dynamic page number outward, so the only way to react to a page change is to read `$page`; a literal `page` still gives working local paging. Differences from React: no `onPageChange` callback, and no controlled/uncontrolled distinction beyond `$variable` vs. number.

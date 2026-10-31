# Component library overview

Visual Lab deliberately exposes **only its own registered components** through OpenUI. It uses OpenUI's language and registration machinery without shipping the stock component catalog to the model.

## Current components

| Component | React props | OpenUI purpose |
| --- | --- | --- |
| `Stack` | see [Stack](stack.md) | Flexbox layout (vertical or horizontal); root of a document |
| `Text` | see [Text](text.md) | Headings, paragraphs, labels and reactive text; plain text only; use Markdown for rich content |
| `Markdown` | see [Markdown](markdown.md) | Rich formatted content from a Markdown string: lists, tables, code, quotes, links, images |
| `Divider` | see [Divider](divider.md) | A thin horizontal or vertical line that separates sections; tone, spacing and decorative or semantic usage |
| `Grid` | see [Grid](grid.md) | Invisible two-dimensional layout in 1 to 4 equal columns with gaps, item alignment and fewer columns in narrow containers |
| `Icon` | see [Icon](icon.md) | A standalone Lucide icon from a curated set, with size and tone presets and an optional accessible label |
| `Spacer` | see [Spacer](spacer.md) | Intentional empty space in a Stack or Card: fixed sizes along the parent's direction, or grow to push siblings apart |
| `Image` | see [Image](image.md) | A standalone image from an http(s) URL or root-relative path, with required alt text, optional caption, aspect ratio, fit, radius and width |
| `Card` | see [Card](card.md) | Visual container that stacks any registered children vertically |
| `Button` | see [Button](button.md) | Action button; can notify the agent through OpenUI |
| `Input` | see [Input](input.md) | Single-line text field with two-way `$variable` binding |
| `Textarea` | see [Textarea](textarea.md) | Multiline text field with two-way `$variable` binding and configurable rows |
| `Checkbox` | see [Checkbox](checkbox.md) | Labeled boolean checkbox with two-way `$variable` binding |
| `Slider` | see [Slider](slider.md) | Single-value numeric slider (native range input) with two-way `$variable` binding |
| `RadioGroup` | see [RadioGroup](radio-group.md) | Single-choice group of native radios (string or `{label, value}` options) with two-way `$variable` binding |
| `Select` | see [Select](select.md) | Single-choice dropdown (native `<select>`; string or `{label, value}` options) with two-way `$variable` binding |
| `Badge` | see [Badge](badge.md) | Compact non-interactive label with default, secondary, outline, success, warning and danger variants |
| `Alert` | see [Alert](alert.md) | Static inline message with icon, optional title and info, success, warning and danger variants |
| `Progress` | see [Progress](progress.md) | Determinate progress bar (native `<progress>`) with value, maximum and accessible label; display-only |
| `Spinner` | see [Spinner](spinner.md) | Indeterminate CSS loading indicator with three sizes and an optional accessible label; honors reduced motion |
| `Table` | see [Table](table.md) | Read-only data table from `columns` and `rows` objects, with caption, compact density, striping, empty state and sideways scrolling |
| `List` | see [List](list.md) | Ordered or unordered list of items on native list elements, with a start number, compact spacing and nesting |
| `KeyValue` | see [KeyValue](key-value.md) | Label/value pairs on a native description list, with inline or stacked layout, dividers and narrow-container stacking |
| `Chart` | see [Chart](chart.md) | Bar, line, area or scatter chart of records on Recharts, with a hidden accessible data table, tooltips, validation and value formatting |
| `ProportionChart` | see [ProportionChart](proportion-chart.md) | Pie or donut chart of parts of a whole on Recharts, with calculated shares, a hidden accessible data table, tooltips and validation |
| `CodeBlock` | see [CodeBlock](code-block.md) | Read-only code viewer on `pre`/`code` with an optional language label, line numbers, copy button and wrapping; no syntax highlighting |
| `Tabs` | see [Tabs](tabs.md) | Accessible tabs that switch between mounted panels of components; line or contained, horizontal or vertical, controlled or uncontrolled, with an OpenUI `$variable` binding |
| `Accordion` | see [Accordion](accordion.md) | Accessible expandable sections with native button triggers; single or multiple open, mounted panels, typed child references |
| `Collapsible` | see [Collapsible](collapsible.md) | One optional detail region behind a native toggle button; plain or bordered, controlled or uncontrolled, mounted content, with an OpenUI `$variable` binding for the open state |
| `Breadcrumbs` | see [Breadcrumbs](breadcrumbs.md) | Breadcrumb trail on a labelled `<nav>` with an ordered list, `aria-current` and plain `<a href>` links; literal links only |
| `Pagination` | see [Pagination](pagination.md) | Page navigation with a bounded page window and ellipses, previous/next, compact variant, controlled or uncontrolled; tracks the page only and never owns data; OpenUI `$variable` binding |
| `NavigationMenu` | see [NavigationMenu](navigation-menu.md) | Flat list of navigation links on a labelled `<nav>` with `aria-current` for the active destination; horizontal or vertical, disabled items, literal links only; no submenus in v1 |
| `CommandPalette` | see [CommandPalette](command-palette.md) | Searchable, grouped commands in a native modal `<dialog>` with combobox keyboard handling; selection reported through a callback, or an existing OpenUI action or link |
| `Dialog` | see [Dialog](dialog.md) | Modal content in a native `<dialog>` with a title, description, optional trigger, Escape/backdrop dismissal and focus return; open state controlled or uncontrolled, bound to a `$variable` in OpenUI |

## Source layout

Each component currently has an ordinary React implementation (`Name.tsx`) and a Zod/OpenUI definition (`Name.openui.tsx`). Definitions are imported into `visual/registry.ts`. Component styles are colocated in `Button.css`, `Text.css`, `Stack.css`, `Card.css`, `Markdown.css`, `Image.css`, `Divider.css`, `Grid.css`, `Icon.css`, `Spacer.css`, `Input.css`, `Textarea.css`, `Checkbox.css`, `Slider.css`, `RadioGroup.css`, `Select.css`, `Badge.css`, `Alert.css`, `Progress.css`, `Spinner.css`, `Table.css`, `List.css`, `KeyValue.css`, `CodeBlock.css`, `Chart.css`, `ProportionChart.css`, `Tabs.css`, `Accordion.css`, `Collapsible.css`, `Breadcrumbs.css`, `Pagination.css`, `NavigationMenu.css`, `CommandPalette.css` and `Dialog.css`. Chart and ProportionChart also use the shared `visual/charts/charts.css`.

## Design rules

- React components should work independently of MCP and board state.
- Expose a deliberately small, validated OpenUI prop surface.
- Use semantic `--ui-*` CSS variables for visual styling.
- Prefer proven accessibility behavior when adapting existing UI primitives.
- Include an example that can be rendered in the board.
- Do not add a component to the AI registry before its schema and rendering work.

See [creating components](creating-components.md) and [component API](component-api.md).

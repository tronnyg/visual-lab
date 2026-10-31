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

## Source layout

Each component currently has an ordinary React implementation (`Name.tsx`) and a Zod/OpenUI definition (`Name.openui.tsx`). Definitions are imported into `visual/registry.ts`. Component styles are colocated in `Button.css`, `Text.css`, `Stack.css`, `Card.css`, `Markdown.css`, `Image.css`, `Divider.css`, `Grid.css`, `Icon.css`, `Spacer.css`, `Input.css`, `Textarea.css`, `Checkbox.css`, `Slider.css`, `RadioGroup.css` and `Select.css`.

## Design rules

- React components should work independently of MCP and board state.
- Expose a deliberately small, validated OpenUI prop surface.
- Use semantic `--ui-*` CSS variables for visual styling.
- Prefer proven accessibility behavior when adapting existing UI primitives.
- Include an example that can be rendered in the board.
- Do not add a component to the AI registry before its schema and rendering work.

See [creating components](creating-components.md) and [component API](component-api.md).

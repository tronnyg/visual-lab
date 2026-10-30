# Component library overview

Visual Lab deliberately exposes **only its own registered components** through OpenUI. It uses OpenUI's language and registration machinery without shipping the stock component catalog to the model.

## Current components

| Component | React props | OpenUI purpose |
| --- | --- | --- |
| `Stack` | see [Stack](stack.md) | Flexbox layout (vertical or horizontal); root of a document |
| `Text` | see [Text](text.md) | Headings, paragraphs, labels and reactive text; plain text only; use Markdown for rich content |
| `Markdown` | see [Markdown](markdown.md) | Rich formatted content from a Markdown string: lists, tables, code, quotes, links, images |
| `Card` | see [Card](card.md) | Visual container that stacks any registered children vertically |
| `Button` | see [Button](button.md) | Action button; can notify the agent through OpenUI |

## Source layout

Each component currently has an ordinary React implementation (`Name.tsx`) and a Zod/OpenUI definition (`Name.openui.tsx`). Definitions are imported into `visual/registry.ts`. Component styles are colocated in `Button.css`, `Text.css`, `Stack.css`, `Card.css` and `Markdown.css`.

## Design rules

- React components should work independently of MCP and board state.
- Expose a deliberately small, validated OpenUI prop surface.
- Use semantic `--ui-*` CSS variables for visual styling.
- Prefer proven accessibility behavior when adapting existing UI primitives.
- Include an example that can be rendered in the board.
- Do not add a component to the AI registry before its schema and rendering work.

See [creating components](creating-components.md) and [component API](component-api.md).

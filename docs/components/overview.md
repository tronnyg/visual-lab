# Component library overview

Visual Lab deliberately exposes **only its own registered components** through OpenUI. It uses OpenUI's language and registration machinery without shipping the stock component catalog to the model.

## Current components

| Component | React props | OpenUI purpose |
| --- | --- | --- |
| `Stack` | see [Stack](stack.md) | Flexbox layout (vertical or horizontal); root of a document |
| `Text` | see [Text](text.md) | Headings, paragraphs, labels and reactive text; plain text only (Markdown is a separate, future component) |
| `Card` | optional `title`, `body`, React `children` | Simple bordered content card |
| `Button` | see [Button](button.md) | Action button; can notify the agent through OpenUI |

## Source layout

Each component currently has an ordinary React implementation (`Name.tsx`) and a Zod/OpenUI definition (`Name.openui.tsx`). Definitions are imported into `visual/registry.ts`. Button and Text styles are colocated in `Button.css` and `Text.css`; the other components' styles still live in `styles/globals.css`.

## Design rules

- React components should work independently of MCP and board state.
- Expose a deliberately small, validated OpenUI prop surface.
- Use semantic `--ui-*` CSS variables for visual styling.
- Prefer proven accessibility behavior when adapting existing UI primitives.
- Include an example that can be rendered in the board.
- Do not add a component to the AI registry before its schema and rendering work.

See [creating components](creating-components.md) and [component API](component-api.md).

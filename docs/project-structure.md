# Project structure

```text
app/                   Next.js UI entry points and thin HTTP routes
board/                 Board UI, types, and local state store
visual/                Reusable React/OpenUI component system
  components/          Colocated component implementations and registrations
  registry.ts          Explicit component and example lists
  library.ts           Custom OpenUI library and prompt options
  Renderer.tsx         Client renderer and error boundary
mcp/                   MCP tool registration and server logic
lib/validate.ts        OpenUI parsing and validation
styles/                Design tokens, theme overrides, global and current component CSS
scripts/               Library metadata generation
generated/             Generated metadata (do not hand-edit)
data/                  Local runtime state (not versioned)
docs/                  Project documentation
```

## Portability

The component library is ordinary source code, not a separately published package. Keep `visual/` free of imports from the board or Next.js routes. The current `visual/Renderer.tsx` uses the OpenUI React renderer and is a client component; the source is reusable but its dependencies must be installed wherever it is used.

`app/` contains both the testing interface entry points **and** API route adapters. It is not purely presentation code. `board/` and `mcp/` contain independent responsibilities but currently import local store/validation utilities.

## Current components

- `visual/components/Text/` — `Text.tsx`, `Text.openui.tsx`
- `visual/components/Stack/` — `Stack.tsx`, `Stack.openui.tsx`
- `visual/components/Card/` — `Card.tsx`, `Card.openui.tsx`
- `visual/components/Button/` — `Button.tsx`, `Button.css`, `Button.openui.tsx`, `Button.examples.ts`

The current snapshot styles these in `styles/globals.css`. Moving component rules into colocated `*.css` files is a **proposed improvement**, not yet implemented.

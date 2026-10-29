# Getting started

## Requirements

- Node.js 20 or newer.
- npm.
- A local copy of the Visual Lab repository.

From the repository root:

```sh
npm install
npm run dev
```

Open <http://localhost:3000>. The `dev` script first runs `npm run gen:library`, generating `generated/library.json`, then starts Next.js.

## First document

Use the **Code** toolbar control to open the right-side OpenUI editor. Enter:

```text
root = Stack([heading, intro, card, action])
heading = Text("Visual Lab", "default", "title")
intro = Text("My first document", "muted")
card = Card("A component", "Rendered from OpenUI Lang")
action = Button("Test button")
```

Select **Render to board**. The board renders the program if it passes validation. **Load example** loads the example declared in `visual/registry.ts` into the editor; it does not automatically save it.

## Boards

The toolbar's board dropdown lists boards and offers create, rename, and delete actions. Each board has one OpenUI program. The app starts with a `main` board. Board state is saved locally to `data/state.json`.

## Theme

Use the theme toggle in the toolbar. The choice is saved in browser local storage under `visual-lab-theme`. Light is the initial theme when no preference is saved.

## Connect an AI agent

See [MCP setup](mcp/setup.md). MCP configuration happens in the AI client, not in the board UI.

## Important

This is a trusted-local-development application without authentication. Do not expose its endpoints on a public network without adding access controls.

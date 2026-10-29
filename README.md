# Visual Lab

A standalone component-development canvas for Synapse. One OpenUI document per board, with a compact toolbar, board dropdown, right-side editor, theme tokens, and MCP tools.

## Setup

Requires Node 20+. Run `npm install` then `npm run dev`, and open http://localhost:3000.

Connect Claude Code: `claude mcp add --transport http visual-lab http://localhost:3000/api/mcp`

Connect Codex: `codex mcp add visual-lab --url http://localhost:3000/api/mcp`

## Components

`visual/components/<Name>/` contains a normal React component and its `.openui.ts` registration. Register new components in `visual/registry.ts`. `visual/library.ts` defines the available OpenUI catalog; the generated prompt and schema are written by `npm run gen:library`.

`styles/tokens.css` is the authoritative light theme. `styles/themes.css` overrides semantic tokens for dark mode. `styles/globals.css` contains the app and initial component styles.

## Reuse in Synapse

Copy `visual/`, `styles/`, and optionally `board/` and `mcp/`. The Next.js `app/` folder is the standalone host, including thin API route adapters. Copy `scripts/gen-library.tsx` if you keep the prompt/schema build step. Do not copy this app's UI unless you want it.

## MCP tools

`get_instructions`, `list_boards`, `get_document`, `display`, `patch_document`, `clear_board`, `read_events`.

## Notes

This is intended for trusted local development. It has no authentication. Do not expose it publicly without adding authentication and authorization. JSON state is stored in `data/state.json` (git-ignored).

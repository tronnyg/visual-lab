# Architecture

## Main flow

```text
Component React implementation + OpenUI definition
                    │
           visual/registry.ts
                    │
           visual/library.ts
                    │
      scripts/gen-library.tsx
                    │
        generated/library.json
                    │
            lib/validate.ts
                    │
AI client → MCP server → board/store.ts ← HTTP board API / editor
                                  │
                          /api/stream (SSE)
                                  │
                         board/Board.tsx
                                  │
                        visual/Renderer.tsx
                                  │
                        React components
```

## Component boundary

`visual/components/` contains ordinary React components and separate OpenUI registrations. A React component should not import the board, API routes, MCP server, or storage. `visual/registry.ts` explicitly lists components exposed through OpenUI. `visual/library.ts` removes the stock OpenUI component catalog and registers the project's definitions.

## OpenUI build metadata

`scripts/gen-library.tsx` writes `generated/library.json` containing a root component name, model prompt, schema, component descriptions, groups, and examples. `lib/validate.ts` reads this generated file and constructs the parser. Run `npm run gen:library` after changing the registry or schemas; `dev`, `build`, and `typecheck` run it automatically.

## Board model

Each board has an ID, name, OpenUI `code`, and timestamps. `board/store.ts` stores boards, UI events, and delivered event IDs in `data/state.json`. A singleton on `globalThis` helps preserve state across development module reloads. This implementation uses synchronous filesystem writes and is intended for local use, not distributed deployment.

## Update and rendering path

The editor posts `setCode` to `/api/boards`; MCP `display` and `patch_document` also update the store. Validation runs before saving nonempty programs. The store notifies listeners, `/api/stream` emits server-sent events, and the browser refetches board data. `VisualRenderer` renders OpenUI with the custom library inside an error boundary.

## Events

The board passes an `onAction` callback to `VisualRenderer` and posts received actions to `/api/events`. `read_events` retrieves undelivered events. See [events](mcp/events.md) for a current limitation of the initial Button implementation.

## HTTP routes

- `GET /api/boards` and `POST /api/boards` — list boards and create, rename, delete, or set code.
- `/api/mcp` — MCP over streamable HTTP.
- `GET /api/stream` — board-change SSE notifications.
- `POST /api/events` — record UI actions.
- `GET /api/activity?board=...` — recent events.
- `GET /api/library` — generated catalog and examples.
- `GET /api/prompt` — generated model prompt.

These are implementation details, not a stable public API contract.

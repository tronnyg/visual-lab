# MCP tools

Implemented in `mcp/server.ts`; exposed through `app/api/mcp/route.ts` using streamable HTTP.

| Tool | Inputs | Behavior |
| --- | --- | --- |
| `get_instructions` | none | Returns generated OpenUI syntax, component definitions, and examples |
| `list_boards` | none | Returns board IDs and names |
| `get_document` | optional `board` | Returns the board's ID, name, and current OpenUI source |
| `display` | `code`, optional `board` | Validates and replaces the board's entire document |
| `patch_document` | `code`, optional `board` | Merges named statements into the existing program, validates, and saves |
| `clear_board` | optional `board` | Clears the board document |
| `read_events` | optional `board` | Returns undelivered UI events and marks them delivered |

The optional `board` parameter defaults to `main`. Board IDs can be obtained with `list_boards`. These tools **do not** currently create, rename, or delete boards; use the board UI or `/api/boards` for those operations.

## Suggested agent workflow

1. Call `get_instructions` to discover current components and syntax.
2. Call `list_boards` and choose a board ID.
3. Use `display` for a complete document.
4. Use `get_document` before patching unfamiliar content.
5. Use `patch_document` for statement-level updates.
6. Use `read_events` when testing supported interactions.

## Example document for `display`

```text
root = Stack([heading, note])
heading = Text("Hello", "default", "title")
note = Card("Status", "Ready to test")
```

## Error behavior

Invalid programs are rejected and validation messages are returned. `patch_document` requires an existing nonempty document and uses `mergeStatements` with root name `root`.

For human-readable prompt text outside MCP, use `GET /api/prompt`.

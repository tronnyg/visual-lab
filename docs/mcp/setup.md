# MCP setup

Visual Lab exposes an MCP server at `http://localhost:3000/api/mcp` while the app is running. The connection is initiated by the **AI client**, not through a button in the Visual Lab UI.

## Start the server

```sh
npm install
npm run dev
```

## Claude Code

```sh
claude mcp add --transport http visual-lab http://localhost:3000/api/mcp
```

## Codex CLI

```sh
codex mcp add visual-lab --url http://localhost:3000/api/mcp
```

Client configuration commands can change with client versions; use the relevant client's current help if one is rejected.

## Verify

Ask the agent to call `get_instructions`, then `list_boards`, and finally `display` with a valid program. Check the browser board and the terminal running Next.js for errors.

## Security

The app has **no authentication or authorization**. Keep it on a trusted local development environment; do not publish the MCP or board APIs to the internet without security controls.

## Troubleshooting

- Connection refused: verify `npm run dev` is running and using port 3000.
- Tools not visible: refresh/restart the AI client or its MCP connection.
- Schema or prompt missing: rerun `npm run gen:library` and check for errors.
- Invalid OpenUI program: use the validation message and read `get_instructions` again.
- UI does not update: inspect `/api/boards`, `/api/stream`, and the browser console.

The current source snapshot has not been runtime-verified as part of this documentation deliverable.

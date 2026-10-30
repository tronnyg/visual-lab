# Testing and verification

## Available commands

```sh
npm run gen:library  # regenerate generated/library.json
npm run typecheck    # regenerate metadata, then TypeScript check
npm run build        # regenerate metadata, then Next.js build
npm run dev          # regenerate metadata, then start development server
```

There is no dedicated automated test suite declared in the supplied `package.json`. `typecheck` and `build` are useful checks, not replacements for behavioral testing.

## Manual smoke test

1. Start the app and open `/`.
2. Verify the initial blank `Main Board`.
3. Open the editor, load the example, and render it.
4. Submit invalid OpenUI source and check for useful validation errors.
5. Create a second board, switch boards, rename it, and verify content stays isolated.
6. Refresh and verify local persistence.
7. Toggle light/dark themes and check contrast and focus.
8. Connect an MCP client and call `get_instructions`, `list_boards`, `display`, and `get_document`.
9. Patch a statement with `patch_document` and confirm the visible change.
10. Load the "Button actions and local state" example. "Add one" / "Reset" should change the count with no Activity entry; "Ask the agent to explain" should add one `continue_conversation` event that MCP `read_events` returns. Disabled and loading buttons must do nothing.

## Per-component checklist

- Ordinary React rendering and documented props.
- OpenUI schema accepts valid values and rejects invalid values.
- Light and dark styling use semantic tokens.
- Keyboard, focus, disabled, and accessible labels as applicable.
- Component example renders in the board.
- Interactive actions are verified end-to-end where implemented.
- Attribution/license requirements are preserved for adapted code.

## Known gaps

- No automated unit, integration, or visual-regression suite in the current snapshot.
- Button actions were tested with a throwaway jsdom script (not in the repo) covering no-action, `@Set` / `@Reset`, `@ToAssistant`, disabled and loading. The board POST and `read_events` leg was not clicked through in a browser; run step 10 above.
- Card variants, light/dark appearance and spacing were not visually checked in a browser; schema validation, legacy-board validation and server rendering of the markup were checked.
- Button keyboard behavior, focus ring appearance and the light/dark look were not visually checked in a browser.

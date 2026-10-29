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
10. Check `read_events` only with a component whose OpenUI action wiring has been verified.

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
- The existing OpenUI Button adapter does not wire an action callback.
- Runtime compatibility of this rebuild was not verified during the documentation task.

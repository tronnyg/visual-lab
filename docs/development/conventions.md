# Development conventions and AI-agent guidance

This page is for both human contributors and coding agents. Follow the current source, not an assumed future architecture.

## Before changing code

1. Read [architecture](../architecture.md), [project structure](../project-structure.md), and [decisions](../decisions.md).
2. For component work, read [creating components](../components/creating-components.md) and [design tokens](../styling/design-tokens.md).
3. Inspect the actual files being modified. Do not assume planned folders or APIs already exist.

## Component rules

- Keep ordinary React components independent of board and MCP code.
- Colocate the React implementation, `.openui.tsx` adapter, and (preferably) `.css` and `.examples.ts` in the component folder.
- Use Zod descriptions and stable positional prop order.
- Register AI-visible definitions explicitly in `visual/registry.ts`.
- Use `--ui-*` semantic CSS variables; do not introduce arbitrary one-off color values for ordinary UI.
- Do not reintroduce the stock OpenUI component catalog by accident.
- Keep generated files generated; do not manually edit `generated/library.json`.
- Preserve accessibility and applicable licenses when adapting third-party code.

## Changes and checks

- Run `npm run gen:library` after registry/schema changes.
- Run `npm run typecheck` and `npm run build` when possible.
- Test the component in the board editor and through MCP if its OpenUI surface changes.
- Update documentation when public props, tool signatures, or tokens change.
- Clearly label unimplemented features as proposed.

## Security boundaries

The app has no authentication and is intended for trusted localhost use. Avoid claiming public deployment safety. Do not add arbitrary executable code evaluation for model-generated content.

## Documentation rule

`docs/` is the canonical project documentation directory. Keep it self-contained and describe this repository only. The root README and any agent-specific root instructions should link here rather than duplicate extensive content.

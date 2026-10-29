# Decision log

This file records current choices and planned directions. It is not a claim that every accepted design choice is fully implemented.

## Accepted

| Area | Decision |
| --- | --- |
| Scope | Standalone local component-development board |
| Organization | One application with reusable source folders; no separately published packages |
| Components | Own the React implementations and expose a custom OpenUI catalog |
| Component files | Keep implementation and OpenUI adapter together under `visual/components/<Name>/` |
| OpenUI | Use OpenUI Lang, schema generation, parsing, validation, and renderer infrastructure |
| Document model | One OpenUI tree per board |
| Canvas | White, borderless, vertically scrolling document surface |
| Layout | One thin top toolbar and a dropdown board switcher |
| Editor | Right-side OpenUI source editor, hidden by default |
| Theme | CSS variables are the styling source of truth; neutral palette and teal accent |
| Shape | Small radii and restrained borders/shadows rather than highly rounded UI |
| Library scope | Start with only owned registered components, not the stock OpenUI catalog |
| Development | Use proven third-party implementations as references or bases when appropriate |
| Documentation | Keep developer and agent documentation together under `/docs` |

## Current implementation choices

- Initial components: `Text`, `Stack`, `Button`, `Card`.
- Local JSON persistence at `data/state.json`.
- Generated OpenUI prompt and schema at `generated/library.json`.
- Light and dark theme toggling.
- MCP tools for document display, patching, reading, and events.

## Proposed

- Move component CSS from `styles/globals.css` into each component's folder.
- Add examples and tests for each component.
- Distinguish internal-only React primitives from AI-exposed OpenUI components.
- Use accessible UI primitives for complex controls and specialized libraries for charts/diagrams as needed.
- Establish a verified action/event contract for interactive components.
- Expand the token system only when components need additional semantic distinctions.

## Deferred

- Freeform or infinite canvas layouts.
- Multiple independent component trees or block-level document editing per board.
- Component permissions by workspace or surface.
- Published component packages.
- Production hosting, authentication, and multi-user synchronization.

## Button actions

Button uses OpenUI's native `action()` prop and `useTriggerAction()`; local state uses `$variables` with `@Set` / `@Reset`, and only `@ToAssistant` reaches `/api/events`. This replaced a custom `actionId` string. See [Button](components/button.md#actions).

## Status vocabulary

**Accepted:** chosen direction. **Implemented:** present in the current source. **Proposed:** suggested, not agreed or built. **Deferred:** deliberately outside current scope. **Superseded:** replaced by a later decision.

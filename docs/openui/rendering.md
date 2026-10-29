# Rendering

`visual/Renderer.tsx` exports `VisualRenderer`. It wraps the OpenUI `Renderer` from `@openuidev/react-lang` and supplies `visual/library.ts` as its component library.

```tsx
<VisualRenderer code={board.code} onAction={handleAction} />
```

The wrapper has an error boundary keyed by the source code. The renderer accepts an optional `onError` callback for OpenUI errors.

## Document surface

`board/Board.tsx` displays the active board's single OpenUI tree in a centered, vertically scrolling document region. The current CSS uses a maximum content width of 900px. There is no panel grid, drag-and-drop placement, or infinite canvas.

## Separation

React implementations live under `visual/components/`; OpenUI definitions adapt the validated props to those implementations. This keeps components usable outside OpenUI.

## Updating

The board fetches `/api/boards`, listens to `/api/stream`, and refetches when state changes. MCP updates and manual editor submissions both change the same stored `code` field. The manual editor applies changes only when **Render to board** is selected.

## Caveat

Rendering a React button does not itself guarantee OpenUI action events. The current `Button.openui.tsx` passes props to `Button` without wiring an `onClick` action. See [events](../mcp/events.md).

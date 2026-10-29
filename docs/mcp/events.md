# UI events

## Current pipeline

1. A rendered component invokes an OpenUI action callback, if its definition supports actions.
2. `VisualRenderer` forwards the action to `board/Board.tsx` through `onAction`.
3. The board POSTs an event to `/api/events` with the board ID, `type: "action"`, a JSON-serialized message, and the original event in `params.event`.
4. `board/store.ts` saves the event in `data/state.json` and keeps at most 200 events globally.
5. MCP `read_events` returns undelivered events for the requested board and marks them delivered.

The Activity drawer fetches recent events through `/api/activity`; it does **not** itself consume the undelivered queue.

## Important current limitation

`Button.tsx` accepts an optional React `onClick`, but `Button.openui.tsx` only passes `label` and `disabled` and does **not** wire an OpenUI action callback. Therefore, a Button rendered through the current OpenUI definition is **not guaranteed to emit an event**. The event transport exists, but interactive component behavior must be explicitly implemented and tested.

## Proposed test requirement

For each interactive component, document: the action name, payload shape, trigger, and expected `read_events` result. Verify the full path from UI interaction to MCP event retrieval.

## Security

Do not treat model-generated event payloads or submitted board code as trusted input. Current endpoints are intended for local development only.

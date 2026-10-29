# Component API conventions

## Two interfaces

A component has a **React API** (`Name.tsx`) and, when AI-accessible, an **OpenUI API** (`Name.openui.tsx`). The React API may support callbacks or composition that the OpenUI API does not expose.

The current `Button` illustrates this distinction: `ButtonProps` accepts `onClick`, but `buttonDefinition` exposes only `label` and `disabled`. The current OpenUI mapping does not wire an action callback into `Button`, so do not document that button clicks necessarily produce MCP events.

## Current schemas

- `Text(value: string, tone?: "default" | "muted", size?: "body" | "title" | "heading")`
- `Stack(children: array, gap?: "sm" | "md" | "lg")`
- `Card(title?: string, body?: string)`
- `Button(label: string, disabled?: boolean)`

OpenUI positional arguments follow the field order in each Zod schema. Keep that order stable or update examples and agent instructions when changing it.

## Recommended rules

- Choose descriptive, stable names and concise schema descriptions.
- Avoid exposing arbitrary CSS or unsafe callbacks to model-generated content.
- Use enums for limited variants and clear defaults in React.
- Keep renderer-specific adapters in `.openui.tsx` rather than in the ordinary React component.
- For interactive components, explicitly define the action/event contract and test it end-to-end.
- Preserve accessible semantics and focus states.

## Proposed, not implemented

A future component capability model could distinguish internal-only components, AI-exposed components, and workspace-specific permissions. There is no such capability registry in the current source.

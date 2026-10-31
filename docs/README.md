# Visual Lab documentation

Visual Lab is a standalone local development board for building, rendering, and testing React components through OpenUI Lang and an MCP server. Each board stores one OpenUI document.

## Start here

- [Getting started](getting-started.md) — install, run, and try a document.
- [Architecture](architecture.md) — component definitions, validation, rendering, state, and MCP.
- [Project structure](project-structure.md) — where the code lives and what each directory does.
- [Decision log](decisions.md) — accepted choices, proposals, and deferred work.

## Build components

- [Component overview](components/overview.md)
- [Creating components](components/creating-components.md)
- [Component API](components/component-api.md)
- [Registry](components/registry.md)
- [Button](components/button.md) — reference component
- [Input](components/input.md) — single-line text input with `$variable` binding
- [Textarea](components/textarea.md) — multiline text input with `$variable` binding
- [Checkbox](components/checkbox.md) — labeled boolean checkbox with `$variable` binding
- [Slider](components/slider.md) — single-value numeric slider with `$variable` binding
- [RadioGroup](components/radio-group.md) — single-choice radio group with `$variable` binding
- [Select](components/select.md) — single-choice dropdown (native `<select>`) with `$variable` binding
- [Badge](components/badge.md) — compact non-interactive label with status variants
- [Stack](components/stack.md) — Flexbox layout primitive
- [Card](components/card.md) — visual container for grouping children
- [Text](components/text.md) — typography primitive; how it differs from Markdown
- [Markdown](components/markdown.md) — rich content from a Markdown string; syntax, security, images
- [Divider](components/divider.md) — section separator: orientation, tone, spacing and accessibility
- [Grid](components/grid.md) — two-dimensional layout: columns, gaps, alignment and responsive behaviour
- [Icon](components/icon.md) — standalone Lucide icons: curated names, sizes, tones and accessibility
- [Spacer](components/spacer.md) — intentional empty space: fixed sizes, grow and when to prefer Stack gap
- [Image](components/image.md) — standalone image: sources, sizing, captions, loading and errors
- [Component hierarchy](components/hierarchy.md) — levels and families

## Style components

- [Design tokens](styling/design-tokens.md)
- [Themes](styling/themes.md)

## OpenUI and MCP

- [OpenUI language](openui/language.md)
- [Rendering](openui/rendering.md)
- [MCP setup](mcp/setup.md)
- [MCP tools](mcp/tools.md)
- [Events](mcp/events.md)

## Maintain the project

- [Testing](development/testing.md)
- [Conventions and AI-agent guidance](development/conventions.md)

> These documents describe the supplied Visual Lab 0.1 source snapshot. Planned behavior is labeled as proposed. Runtime compatibility has not been independently verified in this documentation pass.

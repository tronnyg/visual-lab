# Component hierarchy

## Purpose

Every registered component carries two required, descriptive metadata fields: `level` and `family`. They give the library one consistent vocabulary for talking about components. They are **informational only**: they do not affect rendering, OpenUI schemas or generated syntax, availability, permissions, AI access, MCP tools, or board behavior. Nothing filters or groups by them.

The types live in `visual/classification.ts`; the values are set in `visual/registry.ts`.

## Levels

A level is a component's architectural responsibility.

| Level | Definition | Examples |
|---|---|---|
| `foundation` | Basic layout, typography, and structural building blocks | `Stack`, `Divider`, `Grid`, `Icon`, `Spacer`, `Text` |
| `primitive` | Individual UI controls and elements with a focused responsibility | `Button`, input, badge |
| `composite` | Components combining elements into recognizable UI patterns | `Card`, form field, list item |
| `specialized` | Components designed for particular domains or representations | chart, diagram |
| `system` | Self-contained interactive experiences coordinating multiple components and meaningful state | kanban board, chat panel |

Examples that are not in the current library are illustrative only.

## Families

A family is a component's primary functional purpose. Each component has exactly one.

| Family | Definition | Examples |
|---|---|---|
| `layout` | Arranges other content | `Stack` |
| `typography` | Presents text | `Text` |
| `controls` | Triggers actions or captures input | `Button`, toggle |
| `data-display` | Presents information | `Card`, table |
| `navigation` | Moves between places or views | tabs, breadcrumbs |
| `feedback` | Communicates status or results | alert, toast |
| `visualization` | Represents data graphically | chart, diagram |
| `editors` | Authors or edits structured content | rich-text or code editor |
| `interactive` | Self-contained interactive experiences | game, simulation |

## Levels vs. families

Level answers *how much responsibility and composition does this component have?* Family answers *what is it for?* They are independent: a `foundation` component and a `system` component can both be in `layout`, and `controls` can span `primitive` and `composite`.

## Levels are not strict dependencies

Levels are classifications, not dependency layers. A higher-level component may use lower-level ones but is not required to, and a lower-level component should generally avoid depending on a higher-level one. The registry does not track or enforce dependencies.

## Classifying a new component

1. Pick the level whose definition best matches the component's responsibility. When unsure between two, prefer the lower one.
2. Pick the single family that describes its main purpose.
3. Do not add secondary families or tags.

## Adding metadata to the registry

Add one entry to `registeredComponents` in `visual/registry.ts`:

```ts
{ level: "primitive", family: "controls", definition: buttonDefinition },
```

`definitions` is derived from this list, so the component is registered with OpenUI by the same entry. TypeScript rejects a missing or unknown `level` or `family`.

## Current classifications

| Component | Level | Family |
|---|---|---|
| `Text` | `foundation` | `typography` |
| `Stack` | `foundation` | `layout` |
| `Divider` | `foundation` | `layout` |
| `Grid` | `foundation` | `layout` |
| `Icon` | `foundation` | `data-display` |
| `Spacer` | `foundation` | `layout` |
| `Button` | `primitive` | `controls` |
| `Input` | `primitive` | `controls` |
| `Textarea` | `primitive` | `controls` |
| `Checkbox` | `primitive` | `controls` |
| `Slider` | `primitive` | `controls` |
| `RadioGroup` | `primitive` | `controls` |
| `Select` | `primitive` | `controls` |
| `Badge` | `primitive` | `feedback` |
| `Progress` | `primitive` | `feedback` |
| `Spinner` | `primitive` | `feedback` |
| `Alert` | `composite` | `feedback` |
| `Card` | `composite` | `data-display` |

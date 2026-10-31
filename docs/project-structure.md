# Project structure

```text
app/                   Next.js UI entry points and thin HTTP routes
board/                 Board UI, types, and local state store
visual/                Reusable React/OpenUI component system
  components/          Colocated component implementations and registrations
  registry.ts          Explicit component and example lists
  library.ts           Custom OpenUI library and prompt options
  Renderer.tsx         Client renderer and error boundary
mcp/                   MCP tool registration and server logic
lib/validate.ts        OpenUI parsing and validation
styles/                Design tokens, theme overrides, global and current component CSS
scripts/               Library metadata generation
generated/             Generated metadata (do not hand-edit)
data/                  Local runtime state (not versioned)
docs/                  Project documentation
```

## Portability

The component library is ordinary source code, not a separately published package. Keep `visual/` free of imports from the board or Next.js routes. The current `visual/Renderer.tsx` uses the OpenUI React renderer and is a client component; the source is reusable but its dependencies must be installed wherever it is used.

`app/` contains both the testing interface entry points **and** API route adapters. It is not purely presentation code. `board/` and `mcp/` contain independent responsibilities but currently import local store/validation utilities.

## Current components

- `visual/components/Text/` — `Text.tsx`, `Text.css`, `Text.openui.tsx`, `Text.examples.ts`
- `visual/components/Stack/` — `Stack.tsx`, `Stack.css`, `Stack.openui.tsx`, `Stack.examples.ts`
- `visual/components/Card/` — `Card.tsx`, `Card.css`, `Card.openui.tsx`, `Card.examples.ts`
- `visual/components/Markdown/` — `Markdown.tsx`, `Markdown.css`, `Markdown.openui.tsx`, `Markdown.examples.ts`
- `visual/components/Divider/` — `Divider.tsx`, `Divider.css`, `Divider.openui.tsx`, `Divider.examples.ts`
- `visual/components/Grid/` — `Grid.tsx`, `Grid.css`, `Grid.openui.tsx`, `Grid.examples.ts`
- `visual/components/Icon/` — `Icon.tsx`, `Icon.css`, `Icon.openui.tsx`, `Icon.examples.ts`
- `visual/components/Spacer/` — `Spacer.tsx`, `Spacer.css`, `Spacer.openui.tsx`, `Spacer.examples.ts`
- `visual/components/Image/` — `Image.tsx`, `Image.css`, `Image.openui.tsx`, `Image.examples.ts` (sample assets in `public/assets/`)
- `visual/components/Button/` — `Button.tsx`, `Button.css`, `Button.openui.tsx`, `Button.examples.ts`
- `visual/components/Input/` — `Input.tsx`, `Input.css`, `Input.openui.tsx`, `Input.examples.ts`
- `visual/components/Textarea/` — `Textarea.tsx`, `Textarea.css`, `Textarea.openui.tsx`, `Textarea.examples.ts`
- `visual/components/Checkbox/` — `Checkbox.tsx`, `Checkbox.css`, `Checkbox.openui.tsx`, `Checkbox.examples.ts`
- `visual/components/Slider/` — `Slider.tsx`, `Slider.css`, `Slider.openui.tsx`, `Slider.examples.ts`
- `visual/components/RadioGroup/` — `RadioGroup.tsx`, `RadioGroup.css`, `RadioGroup.openui.tsx`, `RadioGroup.examples.ts`
- `visual/components/Select/` — `Select.tsx`, `Select.css`, `Select.openui.tsx`, `Select.examples.ts`
- `visual/components/Badge/` — `Badge.tsx`, `Badge.css`, `Badge.openui.tsx`, `Badge.examples.ts`
- `visual/components/Alert/` — `Alert.tsx`, `Alert.css`, `Alert.openui.tsx`, `Alert.examples.ts`
- `visual/components/Progress/` — `Progress.tsx`, `Progress.css`, `Progress.openui.tsx`, `Progress.examples.ts`
- `visual/components/Spinner/` — `Spinner.tsx`, `Spinner.css`, `Spinner.openui.tsx`, `Spinner.examples.ts`
- `visual/components/Table/` — `Table.tsx`, `Table.css`, `Table.openui.tsx`, `Table.examples.ts`
- `visual/components/List/` — `List.tsx`, `List.css`, `List.openui.tsx`, `List.examples.ts`
- `visual/components/KeyValue/` — `KeyValue.tsx`, `KeyValue.css`, `KeyValue.openui.tsx`, `KeyValue.examples.ts`
- `visual/components/CodeBlock/` — `CodeBlock.tsx`, `CodeBlock.css`, `CodeBlock.openui.tsx`, `CodeBlock.examples.ts`
- `visual/components/Chart/` — `Chart.tsx`, `chartModel.ts`, `Chart.css`, `Chart.openui.tsx`, `Chart.examples.ts`
- `visual/components/ProportionChart/` — `ProportionChart.tsx`, `proportionModel.ts`, `ProportionChart.css`, `ProportionChart.openui.tsx`, `ProportionChart.examples.ts`
- `visual/charts/` — the small layer shared by the chart components: `ChartFrame.tsx`, `ChartTooltip.tsx`, `chartAccessibility.tsx`, `chartColors.ts`, `chartFormatting.ts`, `charts.css`

Button, Text, Stack, Card, Markdown, Image, Divider, Grid, Icon, Spacer, Input, Textarea, Checkbox, Slider, RadioGroup, Select, Badge, Alert, Progress, Spinner, Table, List, KeyValue, CodeBlock, Chart and ProportionChart styles are colocated; `styles/globals.css` holds only global and board UI rules. Moving component rules into colocated `*.css` files is a **proposed improvement**, not yet implemented.

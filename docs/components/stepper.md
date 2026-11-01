# Stepper

Classification: `level: "composite"`, `family: "navigation"`.

```text
visual/components/Stepper/
  Stepper.tsx            React component and public props
  Stepper.css            Indicators, connectors, horizontal/vertical and narrow layout
  Stepper.openui.tsx     OpenUI schema and $variable binding
  Stepper.examples.ts    OpenUI examples, spread into `examples` in registry.ts
```

`Stepper.tsx` imports nothing from OpenUI, the board or MCP. It shows **progress through an ordered process** and, when `interactive`, lets people move between steps. It is workflow navigation, not a workflow engine: it never validates, advances, branches or infers completion from outside state. Steps before the current one are completed; progress follows the order of `steps`.

**Stepper vs Tabs:** [Tabs](tabs.md) switch between mutually exclusive views of equal rank. Stepper is a sequence with a beginning, an end and a "you are here".

## React API

| Prop | Type | Notes |
| --- | --- | --- |
| `steps` | `{id, label, description?, disabled?}[]` | Required. Ids unique |
| `value` | `string` | Current step id. Controlled. An id that matches no step shows the first step |
| `defaultValue` | `string` | Initial step when uncontrolled (default: the first) |
| `onValueChange` | `(id: string) => void` | Called when the user chooses a step; only when `interactive`; never on first render |
| `orientation` | `horizontal \| vertical` | Default `horizontal`, which stacks in a container narrower than 30rem (a container query, not the viewport) |
| `interactive` | `boolean` | Each enabled step becomes a native button. Default `false` |
| `label` | `string` | Accessible name of the list. Default `Progress` |

## Accessibility

An ordered list (`<ol>`). The current step is `aria-current="step"` (on the button when interactive, otherwise on the list item). State is also text: each step contains visually hidden "Completed: ", "Current step: " or "Not started: ", and visually a completed step has a check mark and the current one is bold with a ring, so state is never colour alone. Interactive steps are native buttons: Tab, Enter and Space, a visible focus ring; a disabled step is a disabled button that Tab skips.

## OpenUI

```text
Stepper(steps, value, orientation, interactive)
```

`value` as a bare `$variable` holding a step id is two-way: Buttons can move it with `@Set($step, "plan")`, and an `interactive` stepper writes the chosen step to it. A string `value` fixes the current step, and `interactive` is ignored without a `$variable` (there is nothing to write to). No workflow actions: Back and Next are ordinary Buttons.

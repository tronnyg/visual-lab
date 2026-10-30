# Stack

Flexbox layout primitive that arranges its children in a column or a row. Classification: `level: "foundation"`, `family: "layout"`.

```text
visual/components/Stack/
  Stack.tsx           React component and public props
  Stack.css           Flexbox rules (imported from app/layout.tsx)
  Stack.openui.tsx    OpenUI schema (validated subset of the React API)
  Stack.examples.ts   OpenUI example, spread into `examples` in registry.ts
```

Stack handles layout only. It has no state, interactions or events, and draws nothing: no background, border, radius or shadow. Use [Card](card.md) for a visible container. Like Button and Text, `Stack.css` is imported from `app/layout.tsx` because `scripts/gen-library.tsx` runs under `tsx`, which cannot import `.css`. There is no Grid and no breakpoint system.

## React API

```tsx
<Stack gap="sm">
  <Text preset="heading">Title</Text>
  <Stack direction="horizontal" align="center" justify="between">
    <Text>Left</Text>
    <Button>Right</Button>
  </Stack>
</Stack>
```

| Prop | Type | Default | Notes |
| --- | --- | --- | --- |
| `direction` | `vertical \| horizontal` | `vertical` | `flex-direction` column / row |
| `gap` | `none \| xs \| sm \| md \| lg` | `md` | 0 / 4 / 8 / 16 / 24 px (`--ui-space-*`) |
| `align` | `start \| center \| end \| stretch \| baseline` | `stretch` | Cross axis (`align-items`) |
| `justify` | `start \| center \| end \| between \| around \| evenly` | `start` | Main axis (`justify-content`) |
| `wrap` | `boolean` | `false` | `flex-wrap: wrap` |
| `padding` | `none \| xs \| sm \| md \| lg` | `none` | Same scale as `gap` |
| `width` | `auto \| full \| sm \| md \| lg` | `auto` | `full` is 100%; `sm`/`md`/`lg` are 100% up to 480 / 640 / 800 px |
| `flex` | `grow \| shrink \| none` | unset | As a flex child: `1 1 0%`, `0 1 auto`, or `none`; grow and shrink also set `min-width: 0` |
| `children`, `className`, `ref`, other `<div>` attributes | | | `ref` is a normal prop (React 19) |

Appearance is emitted as `data-*` attributes (`data-direction`, `data-gap`, ...) and styled in `Stack.css`; there is no inline styling. Light and dark themes need nothing extra because Stack uses only spacing tokens.

## OpenUI API

```text
Stack(children, gap?, direction?, align?, justify?, wrap?, padding?, width?, flex?)
```

`children` is an array of typed references to `Stack`, `Text`, `Markdown`, `Image`, `Divider`, `Grid`, `Icon`, `Button` or `Card` (`z.array(z.union([...ref]))`), so Stacks nest. The other arguments take the values in the table above. `children` and `gap` keep their original positions, so `Stack([a, b], "lg")` and stored boards work unchanged. A skipped optional argument (`null`) uses the default.

To accept a newly registered component as a child, add its `.ref` to the union in `Stack.openui.tsx`.

```text
root = Stack([title, actions, cards], "lg")
title = Text("Dashboard", "default", "title", "h1")
actions = Stack([save, cancel], "sm", "horizontal", "center", "end")
save = Button("Save")
cancel = Button("Cancel", false, "secondary")
cards = Stack([a, b], "md", "horizontal", "stretch", "start", true)
a = Card("Revenue", "Illustrative figures only.")
b = Card("Support", "Illustrative figures only.")
```

## Limitations

- Children must be registered components; raw strings or numbers are rejected. Use `Text`.
- `flex="grow"` only has an effect inside a Stack or other flex container.

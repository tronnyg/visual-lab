# Component registry

`visual/registry.ts` explicitly imports each component definition and lists it, with its classification, in `registeredComponents`:

```ts
export const registeredComponents = [
  { level: "foundation", family: "layout", definition: stackDefinition },
  { level: "foundation", family: "layout", definition: dividerDefinition },
  { level: "foundation", family: "layout", definition: gridDefinition },
  { level: "foundation", family: "data-display", definition: iconDefinition },
  { level: "foundation", family: "typography", definition: textDefinition },
  { level: "composite", family: "data-display", definition: cardDefinition },
  { level: "composite", family: "typography", definition: markdownDefinition },
  { level: "primitive", family: "controls", definition: buttonDefinition },
  { level: "primitive", family: "data-display", definition: imageDefinition },
] as const satisfies readonly RegisteredComponent[];

export const definitions = registeredComponents.map(c => c.definition);
```

Each entry has:

- `definition` — the OpenUI definition (its `name` is the component name).
- `level` — `foundation | primitive | composite | specialized | system`.
- `family` — `layout | typography | controls | data-display | navigation | feedback | visualization | editors | interactive`.

Both `level` and `family` are required and type-checked. They are descriptive only; see the [hierarchy guide](hierarchy.md). The `definitions` export is derived from `registeredComponents` and is unchanged for consumers.

It also exports `examples`, which the metadata generator includes in `generated/library.json`.

`visual/library.ts` extends the OpenUI library, **removes its stock components**, and adds `definitions`. It supplies prompt options instructing the model to output only OpenUI Lang, use registered components, and root each document at `Stack`.

## To add a component

1. Create its React implementation and `.openui.tsx` definition.
2. Import the definition into `visual/registry.ts`.
3. Add an entry with `level`, `family`, and `definition` to `registeredComponents` (see the [hierarchy guide](hierarchy.md)), and optionally an example to `examples`.
4. Run `npm run gen:library`.
5. Test the new example in the editor and through MCP.

`generated/library.json` is generated output. Never hand-edit it. After changing component definitions, a running agent may need to call `get_instructions` again to receive the updated catalog.

Filtering or grouping by level or family, and secondary families or tags, are not implemented.

# Component registry

`visual/registry.ts` explicitly imports and exports the current component definitions:

```ts
export const definitions = [
  stackDefinition,
  textDefinition,
  cardDefinition,
  buttonDefinition,
];
```

It also exports `examples`, which the metadata generator includes in `generated/library.json`.

`visual/library.ts` extends the OpenUI library, **removes its stock components**, and adds `definitions`. It supplies prompt options instructing the model to output only OpenUI Lang, use registered components, and root each document at `Stack`.

## To add a component

1. Create its React implementation and `.openui.tsx` definition.
2. Import the definition into `visual/registry.ts`.
3. Add it to `definitions` and optionally `examples`.
4. Run `npm run gen:library`.
5. Test the new example in the editor and through MCP.

`generated/library.json` is generated output. Never hand-edit it. After changing component definitions, a running agent may need to call `get_instructions` again to receive the updated catalog.

A separate internal-only component list or category grouping system is **proposed**, not implemented.

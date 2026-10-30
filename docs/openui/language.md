# OpenUI Lang in Visual Lab

OpenUI Lang describes a component tree using named statements. Visual Lab expects a `root` statement whose component is `Stack`.

```text
root = Stack([title, body, card])
title = Text("Introduction", "default", "title")
body = Text("This is a document.", "muted")
card = Card("Example", "A simple content card")
```

Each named child is defined separately and referenced from its parent. Props are positional according to the order of fields in the component's Zod schema. Optional fields can be omitted. `$variables` with `@Set` / `@Reset` are enabled; see [Button](../components/button.md#actions).

## Current component signatures

```text
Stack(children, gap?, direction?, align?, justify?, wrap?, padding?, width?, flex?)
Text(value, tone?, preset?, as?, size?, weight?, align?, italic?, underline?, strikethrough?, highlight?, lineHeight?, wrap?, preserveWhitespace?, truncate?, lineClamp?)
Card(title?, body?, children?, variant?, padding?, gap?, radius?, shadow?, background?, border?, width?)
Markdown(source)
Image(src, alt, aspectRatio?, fit?, radius?, width?, caption?, loading?)
Divider(orientation?, tone?, spacing?, decorative?)
Icon(name, size?, tone?, label?)
Grid(children, columns?, gap?, rowGap?, columnGap?, align?, justify?, minColumnWidth?, width?)
Button(label, disabled?, variant?, size?, loading?, fullWidth?, leadingIcon?, trailingIcon?, action?)
```

The renderer is configured to use the custom library, not OpenUI's default catalog. The prompt disallows arbitrary unregistered components and asks for one OpenUI document per board.

## Validation

`lib/validate.ts` uses the generated JSON schema and `createParser`. It reports parse errors, missing root, schema errors, incomplete programs, unresolved references, and orphaned statements. `cleanCode` removes an enclosing Markdown code fence if present.

Use the board editor or MCP `display` to submit programs. For partial updates, see [MCP tools](../mcp/tools.md).

For the exact model-facing syntax and examples of the installed library, read `GET /api/prompt` or call MCP `get_instructions` while the app is running.

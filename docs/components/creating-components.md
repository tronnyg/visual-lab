# Creating a component

This guide follows the current code pattern. The example uses a small `Notice` component; it is **not** part of the current library.

## 1. Create a component folder

```text
visual/components/Notice/
  Notice.tsx
  Notice.openui.tsx
```

Colocated `Notice.css` is a proposed convention; the current repository puts component CSS in `styles/globals.css`.

## 2. Write a normal React component

```tsx
// visual/components/Notice/Notice.tsx
export interface NoticeProps { message: string }

export function Notice({ message }: NoticeProps) {
  return <aside className="vl-notice">{message}</aside>;
}
```

Style it with semantic variables, for example:

```css
.vl-notice {
  padding: var(--ui-space-3);
  border: 1px solid var(--ui-border);
  border-radius: var(--ui-radius-md);
  background: var(--ui-surface-muted);
  color: var(--ui-text);
}
```

## 3. Define its OpenUI interface

```tsx
// visual/components/Notice/Notice.openui.tsx
import { defineComponent } from "@openuidev/react-lang";
import { z } from "zod/v4";
import { Notice } from "./Notice";

export const noticeDefinition = defineComponent({
  name: "Notice",
  description: "A short informational notice.",
  props: z.object({ message: z.string().describe("Notice text") }),
  component: ({ props }) => <Notice {...props} />,
});
```

The schema controls what the model can supply. The React component can have additional internal props not exposed through OpenUI.

## 4. Register the component

Import `noticeDefinition` in `visual/registry.ts` and add it to the exported `definitions` array. Optionally add an example to `examples`:

```text
root = Stack([notice])
notice = Notice("Hello from Visual Lab")
```

## 5. Generate metadata and test

```sh
npm run gen:library
npm run typecheck
npm run build
```

Then run `npm run dev`, load the example in the editor, and check rendering and validation errors. The build and typecheck commands are documented checks, **not evidence that this example has been run**.

## 6. Test behavior and theme

Verify React usage, OpenUI usage, invalid props, light/dark styling, keyboard and focus behavior where relevant, and whether the component actually emits expected OpenUI actions. Do not assume a React `onClick` is automatically connected to OpenUI `onAction`.

## 7. Record provenance

If adapting source from another library, record its source/version and preserve applicable license notices. Keep the final public props and styling conventions consistent with Visual Lab.

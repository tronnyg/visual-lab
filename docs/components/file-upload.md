# FileUpload

Classification: `level: "composite"`, `family: "controls"`.

```text
visual/components/FileUpload/
  FileUpload.tsx            React component and public props
  fileRules.ts              Pure accept matching and size formatting
  FileUpload.css            Browse button, file list, rejections
  FileUpload.openui.tsx     OpenUI schema (deliberately narrow)
  FileUpload.examples.ts    OpenUI examples, spread into `examples` in registry.ts
```

`FileUpload.tsx` imports nothing from OpenUI, the board or MCP. It is a **browser file chooser with validation feedback**. It does not upload: there is no network code, no endpoint and no upload action. Files are browser-owned `File` objects that are never read, serialised, copied into state or turned into object URLs here; the consumer decides what to do with them.

## React API

| Prop | Type | Notes |
| --- | --- | --- |
| `accept` | `string` | Native `accept` syntax: `.pdf`, `image/png`, `image/*`, comma-separated. Non-matching files are rejected with a message |
| `multiple` | `boolean` | Several files; each choice adds to the list (the same file twice is added once). Without it a valid choice replaces the file |
| `maxFiles` | `number` | Most files at once (with `multiple`) |
| `maxSize` | `number` | Largest file in **bytes** (`2 * 1024 * 1024` is 2 MB); inclusive |
| `onFilesChange` | `(files: File[]) => void` | The accepted files, when the user adds or removes one; never on first render |
| `label` | `string` | Browse button text; default `Choose file` / `Choose files` |
| `name`, `required`, `disabled`, `id`, `aria-*` | | Passed to the native input |

## Behaviour and accessibility

A native `<input type="file">`, visually hidden but focusable, with a `<label>` drawn as the browse button: Tab focuses the input (the button shows the focus ring), Enter or Space opens the picker, and `required`, `name`, `disabled` are native. The chosen files are listed with name and size (`aria-label="Selected files"`), each with a "Remove name" button; after a removal focus moves to the next remove button, or back to the input when none is left. Constraints are shown as a hint that describes the input. Rejections (type, size, count) are listed in a polite live region with an icon and the text "Error:", set `aria-invalid`, and stay until the next choice. A rejected choice never discards a file that was already chosen, and cancelling the picker keeps the list. Drag and drop is not implemented.

## FormData

Accepted files are mirrored into the input's own file list through a `DataTransfer`, so they are what a surrounding form submits: **verified in the stories** (`FormData` story: accepted files are present, rejected and removed ones are not, and form reset clears both the list and the input). A browser without the `DataTransfer` constructor keeps its own list instead, which may then differ from the one shown. Uncontrolled only: the component has no `value`.

## OpenUI

```text
FileUpload(accept, multiple, maxFiles, maxSize, disabled, required, label)
```

The OpenUI contract is intentionally narrower than the React one. Files cannot be carried by an OpenUI document, its `$variables` or its actions (`@Set`, `@Reset`, `@ToAssistant`, `@OpenUrl`), so there is no value to bind, no `onFilesChange` and no upload action, and the model is told so. The control only lets someone choose and review files and explains rejections. A regression story checks that choosing files sends no action to the host and changes no variable. Wrap it in a `Field` to label it.

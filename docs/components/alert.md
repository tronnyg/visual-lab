# Alert

Classification: `level: "composite"`, `family: "feedback"` (an icon, a title and a message combined into one pattern).

```text
visual/components/Alert/
  Alert.tsx          React component and public props
  Alert.css          Layout and variant colours (imported from app/layout.tsx)
  Alert.openui.tsx   OpenUI schema: Alert(message, title?, variant?)
  Alert.examples.ts  OpenUI examples, spread into `examples` in registry.ts
```

`Alert.tsx` renders a `<div>` and imports nothing from OpenUI, the board or MCP; it uses the [Icon](icon.md) component for the variant icon. Alert is display-only: no dismiss button, timer, action or toast behavior, and no reactive binding.

## React API

| Prop | Type | Default |
| --- | --- | --- |
| `variant` | `"info" \| "success" \| "warning" \| "danger"` | `"info"` |
| `title` | `ReactNode` | none |

```tsx
<Alert title="Saved" variant="success">Your changes were saved.</Alert>
<Alert variant="danger" role="alert">The payment failed.</Alert>
```

The message is `children`. `className`, `style` and other `div` attributes are passed to the element, and `ref` (React 19 ref-as-prop) points at it.

## Variants

| Variant | Icon | Colour token |
| --- | --- | --- |
| `info` | `info` | `--ui-accent-solid` |
| `success` | `check-circle` | `--ui-success` |
| `warning` | `alert-triangle` | `--ui-warning` |
| `danger` | `alert-circle` | `--ui-danger` |

The background is an 8% tint of the colour over `--ui-surface`, with a 30% border. The title and icon mix the colour toward `--ui-text`; the message stays in `--ui-text`. Everything is a `--ui-*` token (corners use `--ui-radius-md`), so light and dark themes need no extra rules. The alert fills the width of its parent; long text wraps, and `\n` in the message becomes a line break.

## Accessibility

An Alert has **no ARIA role by default**. It is plain content, read in page order, and is never announced as a live region, so a static warning on a page does not interrupt anyone. The icon is decorative (`aria-hidden`), so put the meaning in the text ("Payment failed", not just a red box).

When a message appears after the page has loaded, pass the role yourself in React: `role="status"` for a polite announcement, or `role="alert"` for an urgent one such as a dynamically appearing error. OpenUI programs do not set a role.

## OpenUI API

```text
Alert(message, title?, variant?)
```

| Argument | Notes |
| --- | --- |
| `message` | String or number. May be an expression, e.g. `"You have used " + $used + "%"`; it updates when the variable changes. Use `\n` for line breaks |
| `title` | Optional bold first line. Skip it with `null` when you need a variant |
| `variant` | `info` (default), `success`, `warning`, `danger` |

```text
$used = 40
root = Stack([alert, pick])
alert = Alert("You have used " + $used + "% of your storage.", "Storage", $used > 70 ? "warning" : "info")
pick = Slider($used, "Storage used (%)", 0, 100)
```

Alert is accepted as a child of `Stack`, `Card` and `Grid`.

## Limitations

No dismiss button, action, timer, toast or notification queue, no custom icon, and no child components inside the message. Use [Text](text.md) for ordinary sentences, [Badge](badge.md) for a short label and [Button](button.md) for actions.

For a temporary notification that appears in a corner and dismisses itself, use [Toast](toast.md); an Alert stays in the page.

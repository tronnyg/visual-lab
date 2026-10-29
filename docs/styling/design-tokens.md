# Design tokens

## Source of truth

`styles/tokens.css` defines the light theme's `--ui-*` CSS variables. `styles/themes.css` overrides them under `[data-theme="dark"]`. `styles/globals.css` contains global rules, the board UI, and the current component CSS.

## Current semantic variables

| Token | Purpose |
| --- | --- |
| `--ui-canvas` | Document canvas background |
| `--ui-surface` | Main component and control surfaces |
| `--ui-surface-muted` | Secondary surfaces |
| `--ui-text` | Primary text |
| `--ui-text-muted` | Secondary text |
| `--ui-border` | Standard borders |
| `--ui-accent` | Primary teal accent |
| `--ui-accent-hover` | Hover accent |
| `--ui-accent-tint` | Subtle accent surface |
| `--ui-danger` | Error and destructive emphasis |
| `--ui-radius-sm/md/lg` | Corner radius scale: 2 / 4 / 6 px in light tokens |
| `--ui-space-1/2/3/4/6` | Spacing scale: 4 / 8 / 12 / 16 / 24 px |
| `--ui-font` | UI font stack |
| `--ui-shadow` | Floating surface shadow |

Current light accent is `#0d9488`. The light canvas is `#ffffff` in the current token file; inspect the actual CSS when tuning palette values.

## Usage

```css
.example {
  color: var(--ui-text);
  background: var(--ui-surface);
  border: 1px solid var(--ui-border);
  border-radius: var(--ui-radius-md);
  padding: var(--ui-space-4);
}
```

Use semantic tokens for normal component styling; hardcoded data colors may still be appropriate for charts or semantic visualizations.

## Proposed improvements

- Move individual component rules out of `styles/globals.css` into their own component folders.
- Add component-specific tokens only when a shared semantic token is insufficient.
- Document token changes alongside visual regression checks.

The token system currently uses `--ui-*` names; it is not a full copy of OpenUI's stock theme variable set.

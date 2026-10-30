# Themes

## Current behavior

The UI supports light and dark modes. The browser toggles `document.documentElement.dataset.theme` between `light` and `dark`, and stores the choice under `visual-lab-theme` in `localStorage`.

`styles/tokens.css` supplies the default light variables. `styles/themes.css` supplies dark overrides under `[data-theme="dark"]`.

The toolbar provides a theme toggle. A fresh browser with no stored choice starts in light mode; automatic system-theme detection is **not** implemented in the current source.

## Editing a theme

1. Change default values in `styles/tokens.css`.
2. Change dark overrides in `styles/themes.css`.
3. Check the board, editor, controls, and all components in both modes.
4. Confirm focus rings, muted text, borders, and hover states remain legible.

## Style direction

Minimal neutral surfaces, teal accent, restrained borders and shadows, mostly squared corners with small radii, white borderless document canvas. The board itself is a document-style test surface, not an infinite spatial canvas.

Button and Text styles are colocated in `Button.css` and `Text.css`; the other components' styles are currently in `styles/globals.css`; relocating them beside component files remains planned.

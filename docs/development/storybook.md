# Storybook

Storybook is the development and test environment for the plain React components in `visual/components/` (layer 1). It renders them directly: no board, MCP server or OpenUI renderer is involved.

Currently covered: all 24 components.

## Commands

```sh
npm run storybook        # dev server on http://localhost:6006
npm run build:storybook  # static build into storybook-static/ (git-ignored)
npm run test:storybook   # run every story in headless Chromium: render, play function, accessibility check
```

`test:storybook` needs a Playwright Chromium (`npx playwright install chromium`).

## Add a story for a component

1. Create `visual/components/Name/Name.stories.tsx` beside the component (picked up by the glob in `.storybook/main.ts`).
2. The component's CSS is already loaded through `styles/components.css` (imported by `.storybook/preview.ts`). Stories that need image files use root-relative paths into `public/` (served via `staticDirs`).
3. Write typed stories (`Meta`, `StoryObj` from `@storybook/react-vite`), title `Components/Name`. Controlled components need a small stateful `render` so the story is editable; see `Input.stories.tsx`.
4. Put interaction checks in a `play` function using `storybook/test` (`userEvent`, `expect`, `within`).

Stories are React examples. Do not convert `Name.examples.ts` (OpenUI programs) into stories.

## Themes

The toolbar's Theme control sets `data-theme` on `<html>`, the same mechanism as the board (`board/Board.tsx`). Storybook loads `styles/tokens.css`, `themes.css` and `globals.css` directly, so there is no second copy of the tokens. A story can pin a theme with `globals: {theme: "dark"}`.

## Accessibility and viewports

The Accessibility panel runs axe on each story. `.storybook/preview.ts` sets `a11y.test: "error"`, so `test:storybook` fails on violations. Use the Viewport toolbar to preview responsive widths.

## What belongs where

| Layer | Tool | Covers |
| --- | --- | --- |
| 1. Component | Storybook | Props, states, themes, accessibility, keyboard/pointer interaction, responsive layout |
| 2. OpenUI | OpenUI integration tests | Schemas, adapters, `$variable` bindings, renderer, program validation |
| 3. Board | Visual Lab board | AI-generated programs, MCP, persistence, end-to-end generative UI |

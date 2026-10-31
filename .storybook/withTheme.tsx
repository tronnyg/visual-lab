import {useEffect} from "react";
import type {Decorator} from "@storybook/react-vite";

export type StorybookTheme = "light" | "dark";

// Same mechanism as the board (board/Board.tsx): `data-theme` on <html>. Light is the :root default in styles/themes.css.
export function applyTheme(theme: StorybookTheme) {
  document.documentElement.dataset.theme = theme;
}

export const withTheme: Decorator = (Story, context) => {
  const theme: StorybookTheme = context.globals.theme === "dark" ? "dark" : "light";
  // Applied during render as well as in the effect so play functions and axe see the right tokens on first paint.
  applyTheme(theme);
  useEffect(() => applyTheme(theme), [theme]);
  return <Story />;
};

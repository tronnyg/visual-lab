import type {Preview} from "@storybook/react-vite";
import {withTheme} from "./withTheme";

// Same order as app/layout.tsx: tokens, themes, globals, then shared component CSS (add new components in styles/components.css).
import "../styles/tokens.css";
import "../styles/themes.css";
import "../styles/globals.css";
import "../styles/components.css";

const preview: Preview = {
  decorators: [withTheme],
  globalTypes: {
    theme: {
      description: "Visual Lab theme",
      toolbar: {
        title: "Theme",
        icon: "circlehollow",
        items: [
          {value: "light", title: "Light"},
          {value: "dark", title: "Dark"},
        ],
        dynamicTitle: true,
      },
    },
  },
  initialGlobals: {theme: "light"},
  parameters: {
    layout: "centered",
    controls: {matchers: {color: /(background|color)$/i}},
    a11y: {test: "error"},
  },
  tags: ["autodocs"],
};

export default preview;

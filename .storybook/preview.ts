import type {Preview} from "@storybook/react-vite";
import {withTheme} from "./withTheme";

// Same order as app/layout.tsx: tokens, themes, globals, then component CSS. Add a component's CSS here when it gets stories.
import "../styles/tokens.css";
import "../styles/themes.css";
import "../styles/globals.css";
import "../visual/components/Input/Input.css";
import "../visual/components/Select/Select.css";
import "../visual/components/Card/Card.css";

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

import type {StorybookConfig} from "@storybook/react-vite";

// Stories live beside their components. Storybook only renders the plain React components: no board, MCP or OpenUI code.
const config: StorybookConfig = {
  // public/ serves the sample images (/assets/*.svg) that the Image stories load, the same root-relative paths the board uses.
  staticDirs: ["../public"],
  stories: ["../visual/components/**/*.stories.@(ts|tsx)"],
  addons: ["@storybook/addon-a11y", "@storybook/addon-docs", "@storybook/addon-vitest"],
  framework: "@storybook/react-vite",
};

export default config;

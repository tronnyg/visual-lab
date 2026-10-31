import {defineConfig} from "vitest/config";
import {storybookTest} from "@storybook/addon-vitest/vitest-plugin";
import {playwright} from "@vitest/browser-playwright";

// Runs every story (render + play function + a11y check) in headless Chromium. Storybook tests only; no other suites exist yet.
export default defineConfig({
  test: {
    projects: [
      {
        extends: true,
        plugins: [storybookTest({configDir: ".storybook"})],
        test: {
          name: "storybook",
          browser: {
            enabled: true,
            headless: true,
            provider: playwright(),
            instances: [{browser: "chromium"}],
          },
        },
      },
    ],
  },
});

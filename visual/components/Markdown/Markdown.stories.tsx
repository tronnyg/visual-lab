import type {Meta, StoryObj} from "@storybook/react-vite";
import {expect, within} from "storybook/test";
import {Markdown} from "./Markdown";

const article = `# Field notes

A short paragraph with **bold**, *italic*, ~~struck~~ text and \`inline code\`. Read the [project site](https://example.com/lab) for more.

## Checklist

- Water the ferns
- Repot the **monstera**
  - Use the larger pot
  - Add fresh soil

1. Gather supplies
2. Prepare the bench
3. Begin

### Snippet

\`\`\`ts
const total = items.reduce((sum, item) => sum + item.price, 0);
\`\`\`

> Small, steady changes add up.

---

Closing paragraph after a rule.`;

const table = `| Plant | Light | Water |
| :---- | :---: | ----: |
| Fern | Low | Weekly |
| Cactus | Bright | Monthly |`;

const tasks = `- [x] Repot the fern
- [ ] Order soil`;

const meta = {
  title: "Components/Markdown",
  component: Markdown,
  args: {source: article},
  decorators: [Story => <div style={{width: 520, maxWidth: "100%"}}><Story /></div>],
  parameters: {layout: "padded"},
  argTypes: {
    source: {control: "text"},
    className: {control: false},
    style: {control: false},
  },
} satisfies Meta<typeof Markdown>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  play: async ({canvasElement}) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByRole("heading", {level: 1, name: "Field notes"})).toBeVisible();
    await expect(canvas.getByRole("heading", {level: 2, name: "Checklist"})).toBeVisible();
    // Nested list: the two sub-items sit inside the second item of the first list.
    await expect(canvas.getAllByRole("list")).toHaveLength(3);
    await expect(canvas.getAllByRole("listitem")).toHaveLength(7);
    // Inline code and a fenced block are different elements; the fenced one is inside <pre>.
    await expect(canvas.getByText("inline code").tagName).toBe("CODE");
    await expect(canvasElement.querySelector("pre code")).toHaveTextContent("items.reduce");
    // External links open in a new tab without handing over the opener.
    const link = canvas.getByRole("link", {name: "project site"});
    await expect(link).toHaveAttribute("href", "https://example.com/lab");
    await expect(link).toHaveAttribute("target", "_blank");
    await expect(link).toHaveAttribute("rel", "noopener noreferrer");
  },
};

export const Tables: Story = {
  args: {source: table},
  play: async ({canvasElement}) => {
    const canvas = within(canvasElement);
    // The table sits in a focusable, labelled region so a wide table can be scrolled by keyboard.
    await expect(canvas.getByRole("region", {name: "Table"})).toHaveAttribute("tabindex", "0");
    await expect(canvas.getByRole("columnheader", {name: "Light"})).toBeVisible();
    await expect(canvas.getAllByRole("row")).toHaveLength(3);
  },
};

// Known component issue: GFM task-list checkboxes have no accessible name, so axe reports `label`. Shown as a warning, not an error, until Markdown fixes it.
export const TaskList: Story = {
  args: {source: tasks},
  parameters: {a11y: {test: "todo"}},
  play: async ({canvasElement}) => {
    const canvas = within(canvasElement);
    // Task-list checkboxes are display-only.
    const [done, todo] = canvas.getAllByRole("checkbox");
    await expect(done).toBeChecked();
    await expect(done).toBeDisabled();
    await expect(todo).not.toBeChecked();
    await expect(todo).toBeDisabled();
  },
};

// The source is treated as untrusted: raw HTML is not rendered, and unsafe or relative URLs are dropped.
export const UntrustedSource: Story = {
  args: {
    source: [
      "Text with <script>window.__injected = true</script> and <b>raw html</b>.",
      "",
      "[Unsafe link](javascript:alert(1)) and [relative link](/board).",
      "",
      "![Relative image](/secret.png)",
    ].join("\n"),
  },
  play: async ({canvasElement}) => {
    const canvas = within(canvasElement);
    await expect(canvasElement.querySelector("script, b")).toBeNull();
    await expect((window as unknown as {__injected?: boolean}).__injected).toBeUndefined();
    // Refused URLs render their text without becoming links; a refused image falls back to its alt text.
    await expect(canvas.queryByRole("link")).toBeNull();
    await expect(canvas.getByText("Unsafe link", {exact: false})).toBeVisible();
    await expect(canvas.getByText("Relative image")).toBeVisible();
    await expect(canvasElement.querySelector("img")).toBeNull();
  },
};

// Known component issue: a scrollable <pre> is not keyboard-focusable (the table wrapper is), so axe reports scrollable-region-focusable. Shown as a warning, not an error, until Markdown fixes it.
export const LongCode: Story = {
  parameters: {a11y: {test: "todo"}},
  args: {source: "A code block scrolls sideways instead of widening the page:\n\n```\nconst message = \"a very long line of code that is wider than the column it sits in\";\n```"},
  play: async ({canvasElement}) => {
    const pre = canvasElement.querySelector("pre")!;
    await expect(pre.scrollWidth).toBeGreaterThan(pre.clientWidth);
    await expect(getComputedStyle(pre).overflowX).toBe("auto");
  },
};

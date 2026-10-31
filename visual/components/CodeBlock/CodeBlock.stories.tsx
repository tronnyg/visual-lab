import type {Meta, StoryObj} from "@storybook/react-vite";
import {expect, fn, userEvent, waitFor, within} from "storybook/test";
import {CodeBlock} from "./CodeBlock";

const sample = `const items = [1, 2, 3];

function total(list: number[]) {
  return list.reduce((sum, n) => sum + n, 0);
}

console.log(total(items));`;

const meta = {
  title: "Components/CodeBlock",
  component: CodeBlock,
  decorators: [Story => <div style={{width: 520, maxWidth: "100%"}}><Story /></div>],
  args: {code: "const total = items.length;"},
  argTypes: {
    code: {control: "text"},
    language: {control: "text"},
    showLineNumbers: {control: "boolean"},
    copyable: {control: "boolean"},
    wrap: {control: "boolean"},
    ref: {control: false},
    className: {control: false},
    style: {control: false},
  },
} satisfies Meta<typeof CodeBlock>;

export default meta;
type Story = StoryObj<typeof meta>;

// The clipboard is mocked: headless browsers refuse real clipboard access without a permission grant.
function mockClipboard(writeText: (text: string) => Promise<void>) {
  Object.defineProperty(navigator, "clipboard", {configurable: true, value: {writeText}});
  return () => { delete (navigator as {clipboard?: unknown}).clipboard; };
}

export const Basic: Story = {
  play: async ({canvasElement}) => {
    const code = canvasElement.querySelector("pre > code")!;
    await expect(code.textContent).toBe("const total = items.length;");
    // Without a language or copy button there is no header.
    await expect(canvasElement.querySelector(".vl-codeblock__header")).toBeNull();
  },
};

export const WithLanguage: Story = {
  args: {language: "typescript"},
  play: async ({canvasElement}) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByText("typescript")).toBeVisible();
    await expect(canvas.getByRole("region", {name: "typescript code"})).toBeVisible();
    // The language is a label only: the code has no highlighting markup.
    await expect(canvasElement.querySelector("pre code")!.querySelectorAll(":scope > *:not(.vl-codeblock__line)")).toHaveLength(0);
  },
};

export const Multiline: Story = {
  args: {code: sample, language: "typescript"},
  play: async ({canvasElement}) => {
    const code = canvasElement.querySelector("pre > code")!;
    await expect(code.querySelectorAll(".vl-codeblock__line")).toHaveLength(7);
    const lines = Array.from(code.querySelectorAll<HTMLElement>(".vl-codeblock__line"));
    // Indentation is kept, and a blank line still takes up a row.
    await expect(lines[3].textContent).toBe("  return list.reduce((sum, n) => sum + n, 0);");
    await expect(getComputedStyle(code.parentElement!).whiteSpaceCollapse).toBe("preserve");
    await expect(lines[1].getBoundingClientRect().height).toBeGreaterThan(10);
  },
};

export const LineNumbers: Story = {
  args: {code: sample, showLineNumbers: true},
  play: async ({canvasElement}) => {
    const lines = Array.from(canvasElement.querySelectorAll<HTMLElement>(".vl-codeblock__line"));
    // Each line draws its number from a CSS counter in a gutter; the gutter is not selectable.
    await expect(getComputedStyle(lines[0], "::before").content).toBe("counter(vl-codeblock-line)");
    await expect(getComputedStyle(lines[0], "::before").userSelect).toBe("none");
    await expect(parseFloat(getComputedStyle(lines[0]).paddingInlineStart)).toBeGreaterThan(10);
    // The numbers are CSS, so they are not part of the text.
    await expect(lines.map(line => line.textContent).join("\n")).toBe(sample);
  },
};

export const LongLinesScroll: Story = {
  args: {code: "const message = \"A deliberately long line of code that goes far beyond the width of its container and so must scroll sideways\";\nconst short = 1;", language: "typescript"},
  play: async ({canvasElement}) => {
    const scroll = within(canvasElement).getByRole("region", {name: "typescript code"});
    await expect(scroll.scrollWidth).toBeGreaterThan(scroll.clientWidth);
    await expect(canvasElement.querySelector<HTMLElement>(".vl-codeblock")!.getBoundingClientRect().width).toBeLessThanOrEqual(520);
    scroll.focus();
    await expect(scroll).toHaveFocus();
  },
};

export const LongLinesWrap: Story = {
  args: {...LongLinesScroll.args, wrap: true},
  play: async ({canvasElement}) => {
    const scroll = within(canvasElement).getByRole("region", {name: "typescript code"});
    await expect(scroll.scrollWidth).toBeLessThanOrEqual(scroll.clientWidth);
    const first = canvasElement.querySelector<HTMLElement>(".vl-codeblock__line")!;
    // Wrapped across several visual lines, but still one source line.
    await expect(first.getBoundingClientRect().height).toBeGreaterThan(40);
  },
};

export const WrapWithLineNumbers: Story = {
  args: {...LongLinesScroll.args, wrap: true, showLineNumbers: true},
  play: async ({canvasElement}) => {
    const [, second] = canvasElement.querySelectorAll<HTMLElement>(".vl-codeblock__line");
    await expect(getComputedStyle(second, "::before").content).toBe("counter(vl-codeblock-line)");
    // The number sits in its own gutter, so wrapped text never runs under it.
    await expect(parseFloat(getComputedStyle(second).paddingInlineStart)).toBeGreaterThan(10);
  },
};

export const CopySuccess: Story = {
  args: {code: sample, language: "typescript", copyable: true},
  play: async ({canvasElement}) => {
    const writeText = fn(async (_text: string) => {});
    const restore = mockClipboard(writeText);
    try {
      const canvas = within(canvasElement);
      await userEvent.click(canvas.getByRole("button"));
      await expect(writeText).toHaveBeenCalledWith(sample);
      await waitFor(() => expect(canvas.getByRole("button")).toHaveTextContent("Copied"));
      await expect(canvas.getByRole("status")).toHaveTextContent("Code copied to clipboard");
      // Leaving the button puts the label back.
      await userEvent.tab();
      await waitFor(() => expect(canvas.getByRole("button")).toHaveTextContent("Copy"));
      await expect(canvas.getByRole("status")).toBeEmptyDOMElement();
    } finally {
      restore();
    }
  },
};

export const CopyFailure: Story = {
  args: {code: sample, copyable: true},
  play: async ({canvasElement}) => {
    const restore = mockClipboard(async () => { throw new DOMException("Denied", "NotAllowedError"); });
    try {
      const canvas = within(canvasElement);
      await userEvent.click(canvas.getByRole("button"));
      await waitFor(() => expect(canvas.getByRole("button")).toHaveTextContent("Copy failed"));
      await expect(canvas.getByRole("status")).toHaveTextContent("Could not copy the code");
    } finally {
      restore();
    }
  },
};

// No Clipboard API at all (for example an insecure context): still no unhandled error.
export const CopyUnavailable: Story = {
  args: {code: sample, copyable: true},
  play: async ({canvasElement}) => {
    Object.defineProperty(navigator, "clipboard", {configurable: true, value: undefined});
    try {
      const canvas = within(canvasElement);
      await userEvent.click(canvas.getByRole("button"));
      await waitFor(() => expect(canvas.getByRole("button")).toHaveTextContent("Copy failed"));
    } finally {
      delete (navigator as {clipboard?: unknown}).clipboard;
    }
  },
};

export const KeyboardCopy: Story = {
  args: {code: sample, copyable: true},
  play: async ({canvasElement}) => {
    const writeText = fn(async (_text: string) => {});
    const restore = mockClipboard(writeText);
    try {
      await userEvent.tab();
      await expect(within(canvasElement).getByRole("button", {name: "Copy"})).toHaveFocus();
      await userEvent.keyboard("{Enter}");
      await expect(writeText).toHaveBeenCalledWith(sample);
    } finally {
      restore();
    }
  },
};

export const Empty: Story = {
  args: {code: "", language: "text"},
  play: async ({canvasElement}) => {
    await expect(canvasElement.querySelectorAll(".vl-codeblock__line")).toHaveLength(1);
  },
};

export const CrlfAndTrailingNewline: Story = {
  args: {code: "one\r\ntwo\r\n"},
  play: async ({canvasElement}) => {
    await expect(canvasElement.querySelectorAll(".vl-codeblock__line")).toHaveLength(2);
  },
};

import type {ComponentType} from "react";
import type {Meta, StoryObj} from "@storybook/react-vite";
import {expect, within} from "storybook/test";
import {Text, textAligns, textElements, textLineClamps, textLineHeights, textPresets, textSizes, textTones, textWeights, textWraps} from "./Text";
import type {TextElement, TextProps} from "./Text";

const sentence = "Visual Lab renders plain React components, so every typographic choice here comes from a preset or an override.";
const longText = `${sentence} ${sentence} ${sentence}`;

// TextProps is a union on `as` (only a label takes htmlFor), which Storybook's arg types cannot express; stories use this flat shape.
type StoryProps = Omit<TextProps, "as" | "htmlFor"> & {as?: Exclude<TextElement, "label">};

const meta = {
  title: "Components/Text",
  component: Text as ComponentType<StoryProps>,
  args: {children: sentence},
  decorators: [Story => <div style={{width: 420}}><Story /></div>],
  argTypes: {
    as: {control: "select", options: textElements},
    preset: {control: "select", options: textPresets},
    size: {control: "select", options: textSizes},
    weight: {control: "select", options: textWeights},
    lineHeight: {control: "select", options: textLineHeights},
    tone: {control: "select", options: textTones},
    align: {control: "select", options: textAligns},
    wrap: {control: "select", options: textWraps},
    lineClamp: {control: "select", options: textLineClamps},
    italic: {control: "boolean"},
    underline: {control: "boolean"},
    strikethrough: {control: "boolean"},
    highlight: {control: "boolean"},
    preserveWhitespace: {control: "boolean"},
    truncate: {control: "boolean"},
    children: {control: "text"},
    ref: {control: false},
    className: {control: false},
    style: {control: false},
  },
} satisfies Meta<StoryProps>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  play: async ({canvasElement}) => {
    // Rendered as a paragraph with the body preset unless told otherwise.
    const text = within(canvasElement).getByText(sentence);
    await expect(text.tagName).toBe("P");
    await expect(text).toHaveAttribute("data-preset", "body");
  },
};

// Every preset on its own line; the sample reads "Name preset" so the gallery labels itself.
export const Presets: Story = {
  render: () => (
    <div style={{display: "grid", gap: 12}}>
      {textPresets.map(preset => <Text key={preset} preset={preset}>{preset} preset</Text>)}
    </div>
  ),
  parameters: {controls: {disable: true}},
};

export const SizesAndWeights: Story = {
  render: () => (
    <div style={{display: "grid", gap: 16}}>
      <div style={{display: "grid", gap: 4}}>
        {textSizes.map(size => <Text key={size} size={size} lineHeight="tight">Size {size}</Text>)}
      </div>
      <div style={{display: "grid", gap: 4}}>
        {textWeights.map(weight => <Text key={weight} weight={weight}>Weight {weight}</Text>)}
      </div>
    </div>
  ),
  parameters: {controls: {disable: true}},
};

export const Tones: Story = {
  render: () => (
    <div style={{display: "grid", gap: 4}}>
      {textTones.map(tone => <Text key={tone} tone={tone}>{tone} tone</Text>)}
    </div>
  ),
  parameters: {controls: {disable: true}},
};

export const Decoration: Story = {
  render: () => (
    <div style={{display: "grid", gap: 8}}>
      <Text italic>Italic</Text>
      <Text underline>Underline</Text>
      <Text strikethrough>Strikethrough</Text>
      <Text underline strikethrough>Underline and strikethrough</Text>
      <Text highlight>Highlighted, with a marker-style background that follows wrapped lines across a long sentence.</Text>
    </div>
  ),
  parameters: {controls: {disable: true}},
};

export const Alignment: Story = {
  render: () => (
    <div style={{display: "grid", gap: 8}}>
      {textAligns.map(align => <Text key={align} align={align} size="sm">{align}: {sentence}</Text>)}
    </div>
  ),
  parameters: {controls: {disable: true}},
};

// `as` sets the element, `preset` sets the look; they are independent.
export const SemanticElements: Story = {
  render: () => (
    <div style={{display: "grid", gap: 8}}>
      <Text as="h2" preset="heading">Heading element, heading look</Text>
      <Text as="h3">Heading element, body look</Text>
      <Text as="p" preset="title">Paragraph element, title look</Text>
      <Text as="strong">Strong</Text>
      <Text as="em">Emphasis</Text>
      <Text as="label" htmlFor="semantic-field" preset="label">Label for the field</Text>
      <input id="semantic-field" />
    </div>
  ),
  parameters: {controls: {disable: true}},
  play: async ({canvasElement}) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByRole("heading", {level: 2, name: "Heading element, heading look"})).toHaveAttribute("data-preset", "heading");
    await expect(canvas.getByRole("heading", {level: 3, name: "Heading element, body look"})).toHaveAttribute("data-preset", "body");
    // The label is wired to its input, so it provides the field's accessible name.
    await expect(canvas.getByLabelText("Label for the field")).toBe(canvasElement.querySelector("#semantic-field"));
  },
};

export const Wrapping: Story = {
  render: () => (
    <div style={{display: "grid", gap: 16}}>
      {textWraps.map(wrap => (
        <div key={wrap} style={{width: 260, overflow: "hidden", border: "1px dashed var(--ui-border)", padding: 8}}>
          <Text wrap={wrap} preset="caption" tone="muted">{wrap}</Text>
          <Text wrap={wrap} size="sm" weight="semibold">A headline that is long enough to wrap across lines</Text>
        </div>
      ))}
    </div>
  ),
  parameters: {controls: {disable: true}},
};

export const Truncated: Story = {
  args: {truncate: true, children: longText},
  play: async ({canvasElement}) => {
    const text = within(canvasElement).getByText(longText);
    // One line with an ellipsis: the content is wider than the box it is clipped to.
    await expect(text.scrollWidth).toBeGreaterThan(text.clientWidth);
    await expect(getComputedStyle(text).textOverflow).toBe("ellipsis");
  },
};

export const LineClamped: Story = {
  args: {lineClamp: 2, children: longText},
  play: async ({canvasElement}) => {
    const text = within(canvasElement).getByText(longText);
    await expect(text.scrollHeight).toBeGreaterThan(text.clientHeight);
    // Two lines of 15px text at the body line height.
    await expect(Math.round(text.clientHeight)).toBeLessThanOrEqual(2 * 15 * 1.65 + 1);
  },
};

export const PreservedWhitespace: Story = {
  args: {preserveWhitespace: true, preset: "code", children: "line one\n  indented line\nline three"},
};

import type {Meta, StoryObj} from "@storybook/react-vite";
import {expect, within} from "storybook/test";
import {Spinner, spinnerSizes} from "./Spinner";

const meta = {
  title: "Components/Spinner",
  component: Spinner,
  args: {label: "Loading results"},
  argTypes: {
    size: {control: "select", options: spinnerSizes},
    label: {control: "text"},
    ref: {control: false},
    className: {control: false},
    style: {control: false},
  },
} satisfies Meta<typeof Spinner>;

export default meta;
type Story = StoryObj<typeof meta>;

// With a label the spinner is a status region; the text is read out, not displayed.
export const Labelled: Story = {
  play: async ({canvasElement}) => {
    const spinner = within(canvasElement).getByRole("status");
    await expect(spinner).toHaveTextContent("Loading results");
    await expect(getComputedStyle(spinner).animationName).not.toBe("none");
  },
};

// Without a label it is decorative and hidden from assistive technology.
export const Decorative: Story = {
  args: {label: undefined},
  play: async ({canvasElement}) => {
    await expect(within(canvasElement).queryByRole("status")).toBeNull();
    await expect(canvasElement.querySelector(".vl-spinner")).toHaveAttribute("aria-hidden", "true");
  },
};

export const Sizes: Story = {
  render: args => (
    <div style={{display: "flex", gap: 24, alignItems: "center"}}>
      {spinnerSizes.map(size => <Spinner key={size} {...args} size={size} label={`Loading ${size}`} />)}
    </div>
  ),
  parameters: {controls: {disable: true}},
  play: async ({canvasElement}) => {
    const widths = within(canvasElement).getAllByRole("status").map(spinner => spinner.getBoundingClientRect().width);
    await expect(widths).toEqual([16, 24, 32]);
  },
};

// The spinner takes the surrounding text colour, so it works inside a coloured control or message.
export const InContext: Story = {
  render: args => (
    <p style={{display: "flex", alignItems: "center", gap: 8, margin: 0, fontFamily: "var(--ui-font)", color: "var(--ui-text)", fontSize: 14}}>
      <Spinner {...args} size="sm" /> Fetching latest results
    </p>
  ),
  parameters: {controls: {disable: true}},
};

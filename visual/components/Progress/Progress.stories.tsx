import type {Meta, StoryObj} from "@storybook/react-vite";
import {expect, within} from "storybook/test";
import {Progress} from "./Progress";

const meta = {
  title: "Components/Progress",
  component: Progress,
  args: {label: "Upload progress", value: 40},
  decorators: [Story => <div style={{width: 320}}><Story /></div>],
  argTypes: {
    value: {control: {type: "range", min: 0, max: 100, step: 1}},
    max: {control: "number"},
    label: {control: "text"},
    ref: {control: false},
    className: {control: false},
    style: {control: false},
  },
} satisfies Meta<typeof Progress>;

export default meta;
type Story = StoryObj<typeof meta>;

const bar = (canvasElement: HTMLElement) => within(canvasElement).getByRole("progressbar", {name: "Upload progress"}) as HTMLProgressElement;

export const Default: Story = {
  play: async ({canvasElement}) => {
    const progress = bar(canvasElement);
    await expect(progress.value).toBe(40);
    await expect(progress.max).toBe(100);
  },
};

export const Empty: Story = {
  args: {value: 0},
  play: async ({canvasElement}) => {
    await expect(bar(canvasElement).value).toBe(0);
  },
};

export const Complete: Story = {
  args: {value: 100},
  play: async ({canvasElement}) => {
    await expect(bar(canvasElement).value).toBe(100);
  },
};

export const CustomMax: Story = {
  args: {value: 3, max: 5, label: "Upload progress"},
  play: async ({canvasElement}) => {
    const progress = bar(canvasElement);
    await expect(progress.value).toBe(3);
    await expect(progress.max).toBe(5);
    await expect(progress.position).toBeCloseTo(0.6);
  },
};

// Out-of-range values are clamped to 0..max rather than overflowing the bar.
export const ClampedValues: Story = {
  render: () => (
    <div style={{display: "grid", gap: 12}}>
      <Progress label="Below range" value={-20} />
      <Progress label="Above range" value={250} />
    </div>
  ),
  parameters: {controls: {disable: true}},
  play: async ({canvasElement}) => {
    const canvas = within(canvasElement);
    await expect((canvas.getByRole("progressbar", {name: "Below range"}) as HTMLProgressElement).value).toBe(0);
    await expect((canvas.getByRole("progressbar", {name: "Above range"}) as HTMLProgressElement).value).toBe(100);
  },
};

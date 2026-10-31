import type {Meta, StoryObj} from "@storybook/react-vite";
import {expect, waitFor, within} from "storybook/test";
import {Image, imageAspectRatios, imageFits, imageLoadings, imageRadii, imageWidths} from "./Image";

// Sample images come from public/ (served by staticDirs in .storybook/main.ts), so stories never need the network.
const landscape = "/assets/sample-landscape.svg";
const diagram = "/assets/sample-diagram.svg";

const meta = {
  title: "Components/Image",
  component: Image,
  args: {src: landscape, alt: "Rolling green hills under a pale sky", aspectRatio: "16:9"},
  decorators: [Story => <div style={{width: 360}}><Story /></div>],
  argTypes: {
    src: {control: "text"},
    alt: {control: "text"},
    aspectRatio: {control: "select", options: imageAspectRatios},
    fit: {control: "select", options: imageFits},
    radius: {control: "select", options: imageRadii},
    width: {control: "select", options: imageWidths},
    loading: {control: "select", options: imageLoadings},
    caption: {control: "text"},
    ref: {control: false},
    className: {control: false},
    style: {control: false},
  },
} satisfies Meta<typeof Image>;

export default meta;
type Story = StoryObj<typeof meta>;

const root = (el: HTMLElement) => el.querySelector<HTMLElement>(".vl-image")!;

export const Default: Story = {
  play: async ({canvasElement}) => {
    const img = await within(canvasElement).findByRole("img", {name: "Rolling green hills under a pale sky"});
    await waitFor(() => expect(root(canvasElement)).toHaveAttribute("data-state", "loaded"));
    await expect(img).toHaveAttribute("src", landscape);
  },
};

export const AspectRatios: Story = {
  render: args => (
    <div style={{display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 16}}>
      {imageAspectRatios.map(ratio => <Image key={ratio} {...args} aspectRatio={ratio} caption={ratio} width="full" />)}
    </div>
  ),
  parameters: {controls: {disable: true}},
  play: async ({canvasElement}) => {
    const frames = Array.from(canvasElement.querySelectorAll<HTMLElement>(".vl-image__frame"));
    // 1:1, 4:3 and 16:9 reserve a frame of that shape.
    const [, square, standard, wide] = frames.map(frame => frame.getBoundingClientRect().width / frame.getBoundingClientRect().height);
    await expect(square).toBeCloseTo(1, 1);
    await expect(standard).toBeCloseTo(4 / 3, 1);
    await expect(wide).toBeCloseTo(16 / 9, 1);
  },
};

// The diagram is 4:3; in a 16:9 frame cover crops it and contain shows all of it.
export const Fit: Story = {
  args: {src: diagram, alt: "Forces acting on a block at rest"},
  render: args => (
    <div style={{display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 16}}>
      {imageFits.map(fit => <Image key={fit} {...args} fit={fit} caption={fit} />)}
    </div>
  ),
  parameters: {controls: {disable: true}},
  play: async ({canvasElement}) => {
    const [cover, contain] = Array.from(canvasElement.querySelectorAll("img"));
    await expect(getComputedStyle(cover).objectFit).toBe("cover");
    await expect(getComputedStyle(contain).objectFit).toBe("contain");
  },
};

export const Radii: Story = {
  args: {aspectRatio: "1:1"},
  render: args => (
    <div style={{display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 12}}>
      {imageRadii.map(radius => <Image key={radius} {...args} radius={radius} caption={radius} />)}
    </div>
  ),
  parameters: {controls: {disable: true}},
};

// A caption switches the markup to figure/figcaption; it does not replace the alt text.
export const WithCaption: Story = {
  args: {src: diagram, alt: "Forces acting on a block at rest", aspectRatio: "auto", caption: "Figure 1. Forces acting on a stationary block."},
  play: async ({canvasElement}) => {
    const canvas = within(canvasElement);
    const figure = canvas.getByRole("figure");
    await expect(within(figure).getByText("Figure 1. Forces acting on a stationary block.").tagName).toBe("FIGCAPTION");
    await expect(within(figure).getByRole("img", {name: "Forces acting on a block at rest"})).toBeInTheDocument();
  },
};

// An empty alt marks the image as decorative: it is exposed as presentational, not as an image.
export const Decorative: Story = {
  args: {alt: ""},
  play: async ({canvasElement}) => {
    const img = canvasElement.querySelector("img")!;
    await expect(img).toHaveAttribute("alt", "");
    await expect(within(canvasElement).queryByRole("img")).toBeNull();
  },
};

// A missing file shows the quiet fallback, which keeps the alt text available to assistive technology.
export const FailedToLoad: Story = {
  args: {src: "/assets/does-not-exist.png", alt: "A revenue chart", caption: "The chart could not be loaded."},
  play: async ({canvasElement}) => {
    const fallback = await within(canvasElement).findByRole("img", {name: "A revenue chart (image unavailable)"});
    await expect(fallback).toBeVisible();
    await expect(root(canvasElement)).toHaveAttribute("data-state", "error");
    await expect(canvasElement.querySelector("img")).toBeNull();
  },
};

// Only absolute http(s) URLs and root-relative paths load; anything else is refused without a request.
export const UnsafeSource: Story = {
  args: {src: "javascript:alert(1)", alt: "Blocked image"},
  play: async ({canvasElement}) => {
    await expect(within(canvasElement).getByRole("img", {name: "Blocked image (image unavailable)"})).toBeVisible();
    await expect(canvasElement.querySelector("img")).toBeNull();
  },
};

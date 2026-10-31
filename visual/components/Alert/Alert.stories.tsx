import type {Meta, StoryObj} from "@storybook/react-vite";
import {expect, within} from "storybook/test";
import {Alert, alertVariants} from "./Alert";

const meta = {
  title: "Components/Alert",
  component: Alert,
  args: {children: "Your changes have been saved."},
  decorators: [Story => <div style={{width: 420}}><Story /></div>],
  argTypes: {
    variant: {control: "select", options: alertVariants},
    title: {control: "text"},
    children: {control: "text"},
    role: {control: "select", options: [undefined, "status", "alert"]},
    ref: {control: false},
    className: {control: false},
    style: {control: false},
  },
} satisfies Meta<typeof Alert>;

export default meta;
type Story = StoryObj<typeof meta>;

// No role by default: a static message is read in page order and never announced.
export const Default: Story = {
  play: async ({canvasElement}) => {
    await expect(within(canvasElement).getByText("Your changes have been saved.")).toBeVisible();
    await expect(within(canvasElement).queryByRole("alert")).toBeNull();
    await expect(within(canvasElement).queryByRole("status")).toBeNull();
  },
};

export const WithTitle: Story = {
  args: {variant: "info", title: "Heads up", children: "Maintenance starts at 22:00 UTC and lasts about ten minutes."},
};

export const Variants: Story = {
  render: () => (
    <div style={{display: "grid", gap: 12}}>
      <Alert variant="info" title="Info">A new version is available.</Alert>
      <Alert variant="success" title="Success">Your changes have been saved.</Alert>
      <Alert variant="warning" title="Warning">Storage is almost full.</Alert>
      <Alert variant="danger" title="Error">The payment could not be processed.</Alert>
    </div>
  ),
  parameters: {controls: {disable: true}},
  play: async ({canvasElement}) => {
    const variants = Array.from(canvasElement.querySelectorAll(".vl-alert")).map(alert => alert.getAttribute("data-variant"));
    await expect(variants).toEqual([...alertVariants]);
  },
};

// For a message that appears after load: `status` is polite, `alert` is urgent.
export const AnnouncedMessages: Story = {
  render: () => (
    <div style={{display: "grid", gap: 12}}>
      <Alert variant="success" role="status" title="Saved">Draft saved.</Alert>
      <Alert variant="danger" role="alert" title="Upload failed">The file is larger than 10 MB.</Alert>
    </div>
  ),
  parameters: {controls: {disable: true}},
  play: async ({canvasElement}) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByRole("status")).toHaveTextContent("Draft saved.");
    await expect(canvas.getByRole("alert")).toHaveTextContent("The file is larger than 10 MB.");
  },
};

// The icon is decorative; the meaning is in the text.
export const DecorativeIcon: Story = {
  args: {variant: "warning", title: "Check your input", children: "Some fields need attention."},
  play: async ({canvasElement}) => {
    await expect(canvasElement.querySelector(".vl-alert__icon")).toHaveAttribute("aria-hidden", "true");
  },
};

export const LongMessage: Story = {
  args: {
    variant: "info",
    title: "Terms updated",
    children: "We have updated how we store and process your data. Review the changes to continue using the service, and contact support if you have questions about how they affect your account.",
  },
};

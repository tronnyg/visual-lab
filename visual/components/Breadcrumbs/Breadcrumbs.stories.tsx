import type {Meta, StoryObj} from "@storybook/react-vite";
import {expect, userEvent, within} from "storybook/test";
import {Breadcrumbs} from "./Breadcrumbs";
import type {BreadcrumbItem} from "./Breadcrumbs";

const path: BreadcrumbItem[] = [
  {label: "Home", href: "#home"},
  {label: "Projects", href: "#projects"},
  {label: "Visual Lab"},
];

const meta = {
  title: "Components/Breadcrumbs",
  component: Breadcrumbs,
  decorators: [Story => <div style={{width: 480}}><Story /></div>],
  args: {items: path},
  argTypes: {
    items: {control: "object"},
    separator: {control: "text"},
    "aria-label": {control: "text"},
    ref: {control: false},
    className: {control: false},
  },
} satisfies Meta<typeof Breadcrumbs>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  play: async ({canvasElement}) => {
    const canvas = within(canvasElement);
    const nav = canvas.getByRole("navigation", {name: "Breadcrumb"});
    await expect(nav.tagName).toBe("NAV");
    await expect(within(nav).getByRole("list").tagName).toBe("OL");
    await expect(within(nav).getAllByRole("listitem")).toHaveLength(3);
    await expect(canvas.getAllByRole("link")).toHaveLength(2);
  },
};

// The last crumb is current by default. It has no href here, so it is text rather than a link.
export const CurrentItem: Story = {
  play: async ({canvasElement}) => {
    const canvas = within(canvasElement);
    const current = canvas.getByText("Visual Lab");
    await expect(current).toHaveAttribute("aria-current", "page");
    await expect(canvas.queryByRole("link", {name: "Visual Lab"})).toBeNull();
    await expect(canvasElement.querySelectorAll("[aria-current]")).toHaveLength(1);
  },
};

// A current crumb with an href stays a link, carrying aria-current.
export const CurrentLink: Story = {
  args: {items: [{label: "Docs", href: "#docs"}, {label: "Install", href: "#install"}]},
  play: async ({canvasElement}) => {
    const link = within(canvasElement).getByRole("link", {name: "Install"});
    await expect(link).toHaveAttribute("aria-current", "page");
    await expect(within(canvasElement).getByRole("link", {name: "Docs"})).not.toHaveAttribute("aria-current");
  },
};

export const ExplicitCurrent: Story = {
  args: {items: [{label: "Home", href: "#home"}, {label: "Projects", href: "#projects", current: true}, {label: "Archive", href: "#archive"}]},
  play: async ({canvasElement}) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByRole("link", {name: "Projects"})).toHaveAttribute("aria-current", "page");
    await expect(canvas.getByRole("link", {name: "Archive"})).not.toHaveAttribute("aria-current");
    await expect(canvasElement.querySelectorAll("[aria-current]")).toHaveLength(1);
  },
};

export const LinkBehavior: Story = {
  args: {items: [{label: "Home", href: "https://example.com/"}, {label: "Docs", href: "#docs", external: false}, {label: "Elsewhere", href: "https://example.org/", external: true}, {label: "Here"}]},
  play: async ({canvasElement}) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByRole("link", {name: "Home"})).toHaveAttribute("href", "https://example.com/");
    await expect(canvas.getByRole("link", {name: "Home"})).not.toHaveAttribute("target");
    await expect(canvas.getByRole("link", {name: "Elsewhere"})).toHaveAttribute("target", "_blank");
    await expect(canvas.getByRole("link", {name: "Elsewhere"})).toHaveAttribute("rel", "noopener noreferrer");
    // Links are in the tab order; plain text is not.
    await userEvent.tab();
    await expect(canvas.getByRole("link", {name: "Home"})).toHaveFocus();
    await userEvent.tab();
    await expect(canvas.getByRole("link", {name: "Docs"})).toHaveFocus();
    await userEvent.tab();
    await userEvent.tab();
    await expect(canvasElement.contains(document.activeElement)).toBe(false);
  },
};

// A crumb without a usable address is plain text, never a dead or script link.
export const NoninteractiveItems: Story = {
  args: {items: [{label: "Home", href: "#home"}, {label: "Section"}, {label: "Unsafe", href: "javascript:alert(1)"}, {label: "Page"}]},
  play: async ({canvasElement}) => {
    const canvas = within(canvasElement);
    await expect(canvas.getAllByRole("link")).toHaveLength(1);
    await expect(canvas.getByText("Section")).toBeVisible();
    await expect(canvas.queryByRole("link", {name: "Unsafe"})).toBeNull();
    await expect(canvasElement.querySelector('a[href^="javascript"]')).toBeNull();
  },
};

export const Separators: Story = {
  args: {separator: "›"},
  play: async ({canvasElement}) => {
    const separators = canvasElement.querySelectorAll(".vl-breadcrumbs__separator");
    await expect(separators).toHaveLength(2);
    for (const separator of separators) {
      await expect(separator).toHaveAttribute("aria-hidden", "true");
      await expect(separator).toHaveTextContent("›");
    }
  },
};

export const NoSeparator: Story = {
  args: {separator: ""},
  play: async ({canvasElement}) => {
    await expect(canvasElement.querySelectorAll(".vl-breadcrumbs__separator")).toHaveLength(0);
  },
};

export const CustomLabel: Story = {
  args: {"aria-label": "You are here"},
  play: async ({canvasElement}) => {
    await expect(within(canvasElement).getByRole("navigation", {name: "You are here"})).toBeVisible();
  },
};

export const SingleItem: Story = {
  args: {items: [{label: "Home"}]},
  play: async ({canvasElement}) => {
    const canvas = within(canvasElement);
    await expect(canvas.getAllByRole("listitem")).toHaveLength(1);
    await expect(canvas.getByText("Home")).toHaveAttribute("aria-current", "page");
    await expect(canvasElement.querySelectorAll(".vl-breadcrumbs__separator")).toHaveLength(0);
  },
};

export const Empty: Story = {
  args: {items: []},
  play: async ({canvasElement}) => {
    await expect(within(canvasElement).queryByRole("navigation")).toBeNull();
  },
};

export const LongLabels: Story = {
  args: {
    items: [
      {label: "Home", href: "#home"},
      {label: "Documentation for the extremely detailed reference section", href: "#docs"},
      {label: "Importing and exporting very large spreadsheets safely", href: "#import"},
      {label: "Troubleshooting_encoding_problems_in_imported_files_with_no_spaces_at_all_in_the_name"},
    ],
  },
  decorators: [Story => <div style={{width: 280}}><Story /></div>],
  play: async ({canvasElement}) => {
    // Labels wrap instead of overflowing the container.
    const nav = canvasElement.querySelector("nav") as HTMLElement;
    await expect(nav.scrollWidth).toBeLessThanOrEqual(nav.clientWidth + 1);
  },
};

export const Dark: Story = {globals: {theme: "dark"}};

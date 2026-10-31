import type {Meta, StoryObj} from "@storybook/react-vite";
import {expect, userEvent, within} from "storybook/test";
import {NavigationMenu} from "./NavigationMenu";
import type {NavigationItem} from "./NavigationMenu";

const items: NavigationItem[] = [
  {id: "home", label: "Home", href: "#home"},
  {id: "products", label: "Products", href: "#products"},
  {id: "pricing", label: "Pricing", href: "#pricing"},
  {id: "contact", label: "Contact", href: "#contact"},
];

const meta = {
  title: "Components/NavigationMenu",
  component: NavigationMenu,
  decorators: [Story => <div style={{width: 480}}><Story /></div>],
  args: {items, activeId: "products", "aria-label": "Main"},
  argTypes: {
    orientation: {control: "inline-radio", options: ["horizontal", "vertical"]},
    activeId: {control: "text"},
    items: {control: "object"},
    "aria-label": {control: "text"},
    ref: {control: false},
    className: {control: false},
  },
} satisfies Meta<typeof NavigationMenu>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Horizontal: Story = {
  play: async ({canvasElement}) => {
    const canvas = within(canvasElement);
    const nav = canvas.getByRole("navigation", {name: "Main"});
    await expect(nav).toHaveAttribute("data-orientation", "horizontal");
    await expect(within(nav).getAllByRole("listitem")).toHaveLength(4);
    await expect(canvas.getAllByRole("link")).toHaveLength(4);
    // Ordinary navigation semantics, not application-menu roles.
    await expect(canvasElement.querySelector('[role="menu"], [role="menubar"], [role="menuitem"]')).toBeNull();
  },
};

export const Vertical: Story = {
  args: {orientation: "vertical"},
  play: async ({canvasElement}) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByRole("navigation", {name: "Main"})).toHaveAttribute("data-orientation", "vertical");
    // The links stack: each starts below the previous one.
    const links = canvas.getAllByRole("link");
    await expect(links[1].getBoundingClientRect().top).toBeGreaterThan(links[0].getBoundingClientRect().top);
  },
};

export const ActiveDestination: Story = {
  play: async ({canvasElement}) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByRole("link", {name: "Products"})).toHaveAttribute("aria-current", "page");
    await expect(canvasElement.querySelectorAll("[aria-current]")).toHaveLength(1);
  },
};

export const NoActiveDestination: Story = {
  args: {activeId: undefined},
  play: async ({canvasElement}) => {
    await expect(canvasElement.querySelectorAll("[aria-current]")).toHaveLength(0);
  },
};

export const UnknownActiveId: Story = {
  args: {activeId: "nope"},
  play: async ({canvasElement}) => {
    await expect(canvasElement.querySelectorAll("[aria-current]")).toHaveLength(0);
  },
};

export const DisabledItem: Story = {
  args: {items: [items[0], {...items[1], disabled: true}, items[2]], orientation: "vertical"},
  play: async ({canvasElement}) => {
    const canvas = within(canvasElement);
    // A disabled destination is not a link: it cannot be focused or followed.
    await expect(canvas.queryByRole("link", {name: "Products"})).toBeNull();
    await expect(canvas.getByText("Products")).toHaveAttribute("aria-disabled", "true");
    await expect(canvas.getAllByRole("link")).toHaveLength(2);
    await userEvent.tab();
    await expect(canvas.getByRole("link", {name: "Home"})).toHaveFocus();
    await userEvent.tab();
    await expect(canvas.getByRole("link", {name: "Pricing"})).toHaveFocus();
  },
};

export const KeyboardNavigation: Story = {
  play: async ({canvasElement}) => {
    const canvas = within(canvasElement);
    await userEvent.tab();
    await expect(canvas.getByRole("link", {name: "Home"})).toHaveFocus();
    await userEvent.tab();
    await expect(canvas.getByRole("link", {name: "Products"})).toHaveFocus();
    await userEvent.tab({shift: true});
    await expect(canvas.getByRole("link", {name: "Home"})).toHaveFocus();
  },
};

export const LinkBehavior: Story = {
  args: {items: [{id: "a", label: "Docs", href: "https://example.com/docs"}, {id: "b", label: "Elsewhere", href: "https://example.org/", external: true}, {id: "c", label: "Text only"}, {id: "d", label: "Unsafe", href: "javascript:alert(1)"}], activeId: "a"},
  play: async ({canvasElement}) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByRole("link", {name: "Docs"})).toHaveAttribute("href", "https://example.com/docs");
    await expect(canvas.getByRole("link", {name: "Docs"})).not.toHaveAttribute("target");
    await expect(canvas.getByRole("link", {name: "Elsewhere"})).toHaveAttribute("target", "_blank");
    await expect(canvas.getByRole("link", {name: "Elsewhere"})).toHaveAttribute("rel", "noopener noreferrer");
    // An item without a usable address is text, never a dead or script link.
    await expect(canvas.getAllByRole("link")).toHaveLength(2);
    await expect(canvas.getByText("Text only")).toBeVisible();
    await expect(canvasElement.querySelector('a[href^="javascript"]')).toBeNull();
  },
};

export const DefaultLabel: Story = {
  args: {"aria-label": undefined},
  play: async ({canvasElement}) => {
    await expect(within(canvasElement).getByRole("navigation", {name: "Navigation"})).toBeVisible();
  },
};

export const Empty: Story = {
  args: {items: []},
  play: async ({canvasElement}) => {
    await expect(within(canvasElement).queryByRole("navigation")).toBeNull();
  },
};

export const SingleItem: Story = {
  args: {items: [items[0]], activeId: "home"},
  play: async ({canvasElement}) => {
    await expect(within(canvasElement).getAllByRole("listitem")).toHaveLength(1);
  },
};

export const LongLabels: Story = {
  args: {
    orientation: "vertical",
    items: [{id: "a", label: "A destination with a very long label that must wrap instead of overflowing", href: "#a"}, {id: "b", label: "Unbroken_label_with_no_spaces_at_all_in_the_name_of_this_destination", href: "#b"}],
    activeId: "a",
  },
  decorators: [Story => <div style={{width: 200}}><Story /></div>],
  play: async ({canvasElement}) => {
    const nav = canvasElement.querySelector("nav") as HTMLElement;
    await expect(nav.scrollWidth).toBeLessThanOrEqual(nav.clientWidth + 1);
  },
};

export const Dark: Story = {globals: {theme: "dark"}, args: {orientation: "vertical"}};

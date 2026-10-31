import {useState} from "react";
import type {Meta, StoryObj} from "@storybook/react-vite";
import {expect, fn, userEvent, within} from "storybook/test";
import {Pagination} from "./Pagination";
import {clampPage, getPageItems} from "./paginationModel";
import type {PageItem} from "./paginationModel";
import {Text} from "../Text/Text";

const meta = {
  title: "Components/Pagination",
  component: Pagination,
  args: {totalPages: 10, defaultPage: 1, onPageChange: fn()},
  argTypes: {
    variant: {control: "inline-radio", options: ["default", "compact"]},
    page: {control: "number"},
    defaultPage: {control: "number"},
    totalPages: {control: "number"},
    siblingCount: {control: "number"},
    boundaryCount: {control: "number"},
    disabled: {control: "boolean"},
    onPageChange: {control: false},
    ref: {control: false},
    className: {control: false},
  },
} satisfies Meta<typeof Pagination>;

export default meta;
type Story = StoryObj<typeof meta>;

const current = (canvasElement: HTMLElement) => within(canvasElement).getByRole("button", {current: "page"});
// Ellipsis items are aria-hidden, so they are read from the DOM rather than through role queries.
const labels = (canvasElement: HTMLElement) => [...canvasElement.querySelectorAll("li")].map(li => li.textContent);

export const FirstPage: Story = {
  play: async ({canvasElement}) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByRole("navigation", {name: "Pagination"})).toBeVisible();
    await expect(current(canvasElement)).toHaveAccessibleName("Page 1");
    await expect(canvas.getByRole("button", {name: "Previous page"})).toBeDisabled();
    await expect(canvas.getByRole("button", {name: "Next page"})).toBeEnabled();
    await expect(labels(canvasElement)).toEqual(["", "1", "2", "3", "4", "5", "…", "10", ""]);
  },
};

export const MiddlePage: Story = {
  args: {defaultPage: 5},
  play: async ({canvasElement}) => {
    await expect(labels(canvasElement)).toEqual(["", "1", "…", "4", "5", "6", "…", "10", ""]);
    await expect(current(canvasElement)).toHaveAccessibleName("Page 5");
  },
};

export const LastPage: Story = {
  args: {defaultPage: 10},
  play: async ({canvasElement}) => {
    const canvas = within(canvasElement);
    await expect(labels(canvasElement)).toEqual(["", "1", "…", "6", "7", "8", "9", "10", ""]);
    await expect(canvas.getByRole("button", {name: "Next page"})).toBeDisabled();
    await expect(canvas.getByRole("button", {name: "Previous page"})).toBeEnabled();
  },
};

export const LargePageCount: Story = {
  args: {totalPages: 100000, defaultPage: 50000, siblingCount: 2},
  play: async ({canvasElement}) => {
    // Two siblings and one boundary: 11 slots at most, however many pages there are.
    await expect(within(canvasElement).getAllByRole("button").length).toBeLessThanOrEqual(11);
    await expect(labels(canvasElement)).toEqual(["", "1", "…", "49998", "49999", "50000", "50001", "50002", "…", "100000", ""]);
  },
};

export const Ellipsis: Story = {
  args: {defaultPage: 5},
  play: async ({canvasElement}) => {
    const ellipses = canvasElement.querySelectorAll(".vl-pagination__ellipsis");
    await expect(ellipses).toHaveLength(2);
    // Not interactive and hidden from assistive technology.
    for (const item of ellipses) {
      await expect(item).toHaveAttribute("aria-hidden", "true");
      await expect(item.querySelector("button, a")).toBeNull();
    }
  },
};

export const FewPages: Story = {
  args: {totalPages: 5},
  play: async ({canvasElement}) => {
    await expect(labels(canvasElement)).toEqual(["", "1", "2", "3", "4", "5", ""]);
  },
};

export const SinglePage: Story = {
  args: {totalPages: 1},
  play: async ({canvasElement}) => {
    const canvas = within(canvasElement);
    await expect(current(canvasElement)).toHaveAccessibleName("Page 1");
    await expect(canvas.getByRole("button", {name: "Previous page"})).toBeDisabled();
    await expect(canvas.getByRole("button", {name: "Next page"})).toBeDisabled();
  },
};

export const ZeroPages: Story = {
  args: {totalPages: 0},
  play: async ({canvasElement}) => {
    await expect(within(canvasElement).queryByRole("navigation")).toBeNull();
  },
};

// An out-of-range or malformed page is clamped for display and never reported as a user change.
export const InvalidPage: Story = {
  args: {page: 99, totalPages: 7},
  play: async ({canvasElement, args}) => {
    await expect(current(canvasElement)).toHaveAccessibleName("Page 7");
    await expect(args.onPageChange).not.toHaveBeenCalled();
  },
};

export const InvalidValues: Story = {
  args: {page: Number.NaN, totalPages: 6.9, siblingCount: -3},
  play: async ({canvasElement}) => {
    await expect(current(canvasElement)).toHaveAccessibleName("Page 1");
    await expect(within(canvasElement).getByRole("button", {name: "Page 6"})).toBeVisible();
  },
};

export const Uncontrolled: Story = {
  play: async ({canvasElement, args}) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole("button", {name: "Next page"}));
    await expect(current(canvasElement)).toHaveAccessibleName("Page 2");
    await userEvent.click(canvas.getByRole("button", {name: "Page 4"}));
    await expect(current(canvasElement)).toHaveAccessibleName("Page 4");
    await userEvent.click(canvas.getByRole("button", {name: "Previous page"}));
    await expect(current(canvasElement)).toHaveAccessibleName("Page 3");
    await expect(args.onPageChange).toHaveBeenCalledTimes(3);
    await expect(args.onPageChange).toHaveBeenNthCalledWith(1, 2);
    await expect(args.onPageChange).toHaveBeenNthCalledWith(2, 4);
    await expect(args.onPageChange).toHaveBeenNthCalledWith(3, 3);
    // Choosing the current page again is not a change.
    await userEvent.click(current(canvasElement));
    await expect(args.onPageChange).toHaveBeenCalledTimes(3);
  },
};

export const Controlled: Story = {
  render: args => {
    const [page, setPage] = useState(3);
    return (
      <div style={{display: "grid", gap: 12}}>
        <Pagination {...args} page={page} onPageChange={next => { setPage(next); args.onPageChange?.(next); }} />
        <Text data-testid="state">Page: {page}</Text>
      </div>
    );
  },
  play: async ({canvasElement, args}) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole("button", {name: "Next page"}));
    await expect(canvas.getByTestId("state")).toHaveTextContent("Page: 4");
    await expect(args.onPageChange).toHaveBeenCalledWith(4);
  },
};

// A controlled page is authoritative: clicking asks for a change but the page stays until the parent updates it.
export const ControlledIgnoresClicks: Story = {
  args: {page: 2},
  play: async ({canvasElement, args}) => {
    await userEvent.click(within(canvasElement).getByRole("button", {name: "Next page"}));
    await expect(args.onPageChange).toHaveBeenCalledWith(3);
    await expect(current(canvasElement)).toHaveAccessibleName("Page 2");
  },
};

export const KeyboardUse: Story = {
  args: {defaultPage: 2},
  play: async ({canvasElement, args}) => {
    const canvas = within(canvasElement);
    await userEvent.tab();
    await expect(canvas.getByRole("button", {name: "Previous page"})).toHaveFocus();
    await userEvent.keyboard("{Enter}");
    await expect(current(canvasElement)).toHaveAccessibleName("Page 1");
    await expect(args.onPageChange).toHaveBeenCalledWith(1);
  },
};

export const Compact: Story = {
  args: {variant: "compact", defaultPage: 3},
  play: async ({canvasElement}) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByText("Page 3 of 10")).toBeVisible();
    await expect(canvas.getAllByRole("button")).toHaveLength(2);
    await userEvent.click(canvas.getByRole("button", {name: "Next page"}));
    await expect(canvas.getByText("Page 4 of 10")).toBeVisible();
  },
};

export const Disabled: Story = {
  args: {disabled: true, defaultPage: 4},
  play: async ({canvasElement, args}) => {
    const canvas = within(canvasElement);
    for (const button of canvas.getAllByRole("button")) await expect(button).toBeDisabled();
    await userEvent.click(canvas.getByRole("button", {name: "Next page"}));
    await expect(args.onPageChange).not.toHaveBeenCalled();
    await expect(current(canvasElement)).toHaveAccessibleName("Page 4");
  },
};

export const NoBoundaryPages: Story = {
  args: {boundaryCount: 0, defaultPage: 5},
  play: async ({canvasElement}) => {
    await expect(labels(canvasElement)).toEqual(["", "…", "4", "5", "6", "…", ""]);
  },
};

export const Dark: Story = {globals: {theme: "dark"}, args: {defaultPage: 5}};

// The page window is a pure function; these tables pin its behaviour.
export const PageWindowAlgorithm: Story = {
  render: () => <Text>Page window checks run in the play function.</Text>,
  play: async () => {
    const window = (page: number, totalPages: number, siblingCount?: number, boundaryCount?: number): PageItem[] => getPageItems({page, totalPages, siblingCount, boundaryCount});
    const S = "start-ellipsis", E = "end-ellipsis";
    await expect(window(1, 0)).toEqual([]);
    await expect(window(1, 1)).toEqual([1]);
    await expect(window(1, 7)).toEqual([1, 2, 3, 4, 5, 6, 7]);
    await expect(window(1, 8)).toEqual([1, 2, 3, 4, 5, E, 8]);
    await expect(window(4, 8)).toEqual([1, 2, 3, 4, 5, E, 8]);
    await expect(window(5, 8)).toEqual([1, S, 4, 5, 6, 7, 8]);
    await expect(window(8, 8)).toEqual([1, S, 4, 5, 6, 7, 8]);
    await expect(window(1, 10)).toEqual([1, 2, 3, 4, 5, E, 10]);
    await expect(window(5, 10)).toEqual([1, S, 4, 5, 6, E, 10]);
    await expect(window(6, 10)).toEqual([1, S, 5, 6, 7, E, 10]);
    await expect(window(10, 10)).toEqual([1, S, 6, 7, 8, 9, 10]);
    await expect(window(5, 10, 0)).toEqual([1, S, 5, E, 10]);
    await expect(window(5, 20, 2, 2)).toEqual([1, 2, 3, 4, 5, 6, 7, 8, E, 19, 20]);
    await expect(window(10, 20, 2, 2)).toEqual([1, 2, S, 8, 9, 10, 11, 12, E, 19, 20]);
    await expect(window(10, 20, 1, 0)).toEqual([S, 9, 10, 11, E]);
    // A gap of exactly one page shows that page rather than an ellipsis.
    await expect(window(4, 9)).toEqual([1, 2, 3, 4, 5, E, 9]);
    // Every window has the same number of slots once there are enough pages, and never repeats or skips backwards.
    for (const total of [9, 15, 100, 1000]) {
      for (let page = 1; page <= total; page += Math.max(1, Math.floor(total / 40))) {
        const items = window(page, total, 2, 1);
        await expect(items).toHaveLength(2 * 1 + 2 * 2 + 3);
        await expect(items).toContain(page);
        await expect(items[0]).toBe(1);
        await expect(items[items.length - 1]).toBe(total);
        const pages = items.filter((x): x is number => typeof x === "number");
        await expect(pages).toEqual([...pages].sort((a, b) => a - b));
        await expect(new Set(pages).size).toBe(pages.length);
      }
    }
    await expect(window(999, 12)).toEqual(window(12, 12));
    await expect(window(-4, 12)).toEqual(window(1, 12));
    await expect(window(Number.NaN, 12)).toEqual(window(1, 12));
    await expect(window(3, 12.8)).toEqual(window(3, 12));
    await expect(clampPage(0, 5)).toBe(1);
    await expect(clampPage(2.9, 5)).toBe(2);
    await expect(clampPage(3, 0)).toBe(0);
  },
};

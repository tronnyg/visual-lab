import {useState} from "react";
import type {ComponentType} from "react";
import type {Meta, StoryObj} from "@storybook/react-vite";
import {expect, fn, userEvent, waitFor, within} from "storybook/test";
import {DatePicker} from "./DatePicker";
import type {DatePickerProps} from "./DatePicker";
import {addDays, addMonths, clampDate, daysInMonth, endOfWeek, formatLongDate, isLeapYear, isValidDate, isWithin, parseDate, startOfWeek, todayLocal, weekday} from "./dateUtils";

// DatePickerProps requires a label or an aria-* name through a union that Storybook's arg types cannot express; stories use this flat shape.
type StoryProps = Omit<DatePickerProps, "label" | "aria-label" | "aria-labelledby"> & {label?: string; "aria-label"?: string};

const meta = {
  title: "Components/DatePicker",
  component: DatePicker as ComponentType<StoryProps>,
  decorators: [Story => <div style={{width: 300, minHeight: 380}}><Story /></div>],
  args: {label: "Appointment date", onValueChange: fn()},
  argTypes: {
    label: {control: "text"},
    value: {control: "text"},
    defaultValue: {control: "text"},
    min: {control: "text"},
    max: {control: "text"},
    disabled: {control: "boolean"},
    required: {control: "boolean"},
    onValueChange: {control: false},
    ref: {control: false},
    className: {control: false},
    style: {control: false},
  },
} satisfies Meta<StoryProps>;

export default meta;
type Story = StoryObj<typeof meta>;

const input = (canvas: ReturnType<typeof within>) => canvas.getByRole("textbox", {name: "Appointment date"}) as HTMLInputElement;
const toggle = (canvas: ReturnType<typeof within>) => canvas.getByRole("button", {name: /^(Choose date|Change date)/});
const openCalendar = async (canvas: ReturnType<typeof within>) => {
  await userEvent.click(toggle(canvas));
  await waitFor(() => expect(canvas.getByRole("dialog", {name: "Choose date"})).toBeVisible());
};
// Looked up inside the dialog: the toggle button's name also contains the selected date.
const day = (canvas: ReturnType<typeof within>, name: RegExp | string) => within(canvas.getByRole("dialog")).getByRole("button", {name});

export const Empty: Story = {
  play: async ({canvasElement}) => {
    const canvas = within(canvasElement);
    await expect(input(canvas)).toHaveValue("");
    await expect(input(canvas)).toHaveAttribute("placeholder", "YYYY-MM-DD");
    await expect(canvas.queryByRole("dialog")).toBeNull();
  },
};

// Uncontrolled: pick a day from the calendar; the field, the callback and focus follow.
export const BasicSelection: Story = {
  args: {defaultValue: "2026-03-15"},
  play: async ({canvasElement, args}) => {
    const canvas = within(canvasElement);
    await expect(input(canvas)).toHaveValue("2026-03-15");
    await openCalendar(canvas);
    await expect(toggle(canvas)).toHaveAttribute("aria-expanded", "true");
    await expect(day(canvas, /March 15, 2026/)).toHaveFocus();
    await expect(day(canvas, /March 15, 2026/).closest("td")).toHaveAttribute("aria-selected", "true");
    await userEvent.click(day(canvas, /March 20, 2026/));
    await expect(input(canvas)).toHaveValue("2026-03-20");
    await expect(args.onValueChange).toHaveBeenLastCalledWith("2026-03-20");
    await waitFor(() => expect(canvas.queryByRole("dialog")).toBeNull());
    await expect(toggle(canvas)).toHaveFocus();
  },
};

function ControlledPicker({onValueChange}: {onValueChange?: (date: string) => void}) {
  const [date, setDate] = useState("2026-05-01");
  return (
    <div style={{display: "grid", gap: 8}}>
      <DatePicker label="Appointment date" value={date} onValueChange={next => { setDate(next); onValueChange?.(next); }} />
      <span>Chosen: {date || "none"}</span>
      <button type="button" onClick={() => setDate("2027-01-31")}>Set externally</button>
    </div>
  );
}

export const Controlled: Story = {
  render: args => <ControlledPicker onValueChange={args.onValueChange} />,
  play: async ({canvasElement}) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByText("Chosen: 2026-05-01")).toBeVisible();
    await openCalendar(canvas);
    await userEvent.click(day(canvas, /May 9, 2026/));
    await expect(canvas.getByText("Chosen: 2026-05-09")).toBeVisible();
    await userEvent.click(canvas.getByRole("button", {name: "Set externally"}));
    await expect(input(canvas)).toHaveValue("2027-01-31");
  },
};

// A controlled value is authoritative: when the parent does not accept the change, the field returns to the value it was given.
export const ControlledStaysAuthoritative: Story = {
  args: {value: "2026-05-01"},
  play: async ({canvasElement, args}) => {
    const canvas = within(canvasElement);
    await openCalendar(canvas);
    await userEvent.click(day(canvas, /May 9, 2026/));
    await expect(args.onValueChange).toHaveBeenCalledWith("2026-05-09");
    await expect(input(canvas)).toHaveValue("2026-05-01");
  },
};

export const TypedDate: Story = {
  play: async ({canvasElement, args}) => {
    const canvas = within(canvasElement);
    await userEvent.type(input(canvas), "2026-04-02");
    // Only the complete date is a change; the partial text on the way is not.
    await expect(args.onValueChange).toHaveBeenCalledTimes(1);
    await expect(args.onValueChange).toHaveBeenCalledWith("2026-04-02");
    await expect(input(canvas).validity.valid).toBe(true);
    await openCalendar(canvas);
    await expect(day(canvas, /April 2, 2026/)).toHaveFocus();
  },
};

export const TypedInvalidDate: Story = {
  play: async ({canvasElement, args}) => {
    const canvas = within(canvasElement);
    await userEvent.type(input(canvas), "2026-02-30");
    await expect(args.onValueChange).not.toHaveBeenCalled();
    await expect(input(canvas).validity.customError).toBe(true);
    await expect(input(canvas).checkValidity()).toBe(false);
    await userEvent.tab();
    await expect(input(canvas)).toHaveAttribute("aria-invalid", "true");
  },
};

export const Today: Story = {
  play: async ({canvasElement}) => {
    const canvas = within(canvasElement);
    await openCalendar(canvas);
    // With no value the calendar opens on today, which carries aria-current="date".
    const today = canvasElement.querySelector('[aria-current="date"]') as HTMLElement;
    await expect(today).toHaveAccessibleName(formatLongDate(todayLocal(), "en-US"));
    await expect(today).toHaveFocus();
    await userEvent.click(canvas.getByRole("button", {name: "Today"}));
    await expect(input(canvas)).toHaveValue(todayLocal());
  },
};

export const ClearSelection: Story = {
  args: {defaultValue: "2026-03-15"},
  play: async ({canvasElement, args}) => {
    const canvas = within(canvasElement);
    await openCalendar(canvas);
    await userEvent.click(canvas.getByRole("button", {name: "Clear"}));
    await expect(input(canvas)).toHaveValue("");
    await expect(args.onValueChange).toHaveBeenLastCalledWith("");
  },
};

export const MinMax: Story = {
  args: {defaultValue: "2026-03-15", min: "2026-03-10", max: "2026-03-20"},
  play: async ({canvasElement}) => {
    const canvas = within(canvasElement);
    await openCalendar(canvas);
    await expect(day(canvas, /March 9, 2026/)).toBeDisabled();
    await expect(day(canvas, /March 10, 2026/)).toBeEnabled();
    await expect(day(canvas, /March 21, 2026/)).toBeDisabled();
    await expect(canvas.getByRole("button", {name: "Previous month"})).toBeDisabled();
    await expect(canvas.getByRole("button", {name: "Next month"})).toBeDisabled();
    // The keyboard cannot leave the range either.
    await userEvent.keyboard("{ArrowDown}");
    await expect(day(canvas, /March 20, 2026/)).toHaveFocus();
    await userEvent.keyboard("{PageDown}");
    await expect(day(canvas, /March 20, 2026/)).toHaveFocus();
    await userEvent.keyboard("{PageUp}");
    await expect(day(canvas, /March 10, 2026/)).toHaveFocus();
  },
};

export const OutOfRangeTypedDate: Story = {
  args: {min: "2026-03-10", max: "2026-03-20"},
  play: async ({canvasElement, args}) => {
    const canvas = within(canvasElement);
    await userEvent.type(input(canvas), "2026-04-01");
    await expect(args.onValueChange).not.toHaveBeenCalled();
    await expect(input(canvas).validationMessage).toBe("Choose a date from 2026-03-10 to 2026-03-20");
  },
};

export const KeyboardNavigation: Story = {
  args: {defaultValue: "2026-03-15"},
  play: async ({canvasElement, args}) => {
    const canvas = within(canvasElement);
    input(canvas).focus();
    await userEvent.keyboard("{Alt>}{ArrowDown}{/Alt}");
    await waitFor(() => expect(canvas.getByRole("dialog")).toBeVisible());
    await expect(day(canvas, /March 15, 2026/)).toHaveFocus();
    await userEvent.keyboard("{ArrowRight}");
    await expect(day(canvas, /March 16, 2026/)).toHaveFocus();
    await userEvent.keyboard("{ArrowDown}");
    await expect(day(canvas, /March 23, 2026/)).toHaveFocus();
    await userEvent.keyboard("{ArrowUp}{ArrowLeft}");
    await expect(day(canvas, /March 15, 2026/)).toHaveFocus();
    // March 15, 2026 is a Sunday: End goes to the Saturday, Home back to the Sunday.
    await userEvent.keyboard("{End}");
    await expect(day(canvas, /March 21, 2026/)).toHaveFocus();
    await userEvent.keyboard("{Home}");
    await expect(day(canvas, /March 15, 2026/)).toHaveFocus();
    // One tab stop: every other day is tabindex -1.
    await expect(canvasElement.querySelectorAll('[role="grid"] button[tabindex="0"]')).toHaveLength(1);
    await userEvent.keyboard("{PageDown}");
    await expect(day(canvas, /April 15, 2026/)).toHaveFocus();
    await expect(canvas.getByText("April 2026")).toBeVisible();
    await userEvent.keyboard("{Shift>}{PageUp}{/Shift}");
    await expect(day(canvas, /April 15, 2025/)).toHaveFocus();
    await userEvent.keyboard("{Enter}");
    await expect(input(canvas)).toHaveValue("2025-04-15");
    await expect(args.onValueChange).toHaveBeenLastCalledWith("2025-04-15");
    await expect(toggle(canvas)).toHaveFocus();
  },
};

export const SpaceSelects: Story = {
  args: {defaultValue: "2026-03-15"},
  play: async ({canvasElement}) => {
    const canvas = within(canvasElement);
    await openCalendar(canvas);
    await userEvent.keyboard("{ArrowRight} ");
    await expect(input(canvas)).toHaveValue("2026-03-16");
  },
};

export const EscapeClosesAndRestoresFocus: Story = {
  args: {defaultValue: "2026-03-15"},
  play: async ({canvasElement, args}) => {
    const canvas = within(canvasElement);
    await openCalendar(canvas);
    await userEvent.keyboard("{ArrowRight}{Escape}");
    await waitFor(() => expect(canvas.queryByRole("dialog")).toBeNull());
    await expect(toggle(canvas)).toHaveFocus();
    await expect(toggle(canvas)).toHaveAttribute("aria-expanded", "false");
    await expect(input(canvas)).toHaveValue("2026-03-15");
    await expect(args.onValueChange).not.toHaveBeenCalled();
  },
};

export const OutsidePressCloses: Story = {
  render: args => <div><DatePicker {...(args as DatePickerProps)} /><button type="button">Elsewhere</button></div>,
  play: async ({canvasElement}) => {
    const canvas = within(canvasElement);
    await openCalendar(canvas);
    await userEvent.click(canvas.getByRole("button", {name: "Elsewhere"}));
    await waitFor(() => expect(canvas.queryByRole("dialog")).toBeNull());
  },
};

export const MonthNavigation: Story = {
  args: {defaultValue: "2026-03-31"},
  play: async ({canvasElement}) => {
    const canvas = within(canvasElement);
    await openCalendar(canvas);
    await userEvent.click(canvas.getByRole("button", {name: "Next month"}));
    await expect(canvas.getByText("April 2026")).toBeVisible();
    // The day is kept where the month is long enough and shortened where it is not: 31 March becomes 30 April.
    await expect(day(canvas, /April 30, 2026/)).toHaveAttribute("tabindex", "0");
    await userEvent.click(canvas.getByRole("button", {name: "Previous month"}));
    await userEvent.click(canvas.getByRole("button", {name: "Previous month"}));
    await expect(canvas.getByText("February 2026")).toBeVisible();
    await expect(day(canvas, /February 28, 2026/)).toHaveAttribute("tabindex", "0");
  },
};

// 2024 is a leap year, 2026 is not, 2100 is not (divisible by 100), 2000 is (divisible by 400).
export const LeapYear: Story = {
  args: {defaultValue: "2024-02-28"},
  play: async ({canvasElement}) => {
    const canvas = within(canvasElement);
    await openCalendar(canvas);
    await userEvent.keyboard("{ArrowRight}");
    await expect(day(canvas, /February 29, 2024/)).toHaveFocus();
    await userEvent.keyboard("{ArrowRight}");
    await expect(day(canvas, /March 1, 2024/)).toHaveFocus();
    await expect(canvas.getByText("March 2024")).toBeVisible();
    // 31 January 2024 + one month is 29 February.
    await userEvent.keyboard("{PageUp}");
    await expect(day(canvas, /February 1, 2024/)).toHaveFocus();
  },
};

export const MonthBoundaryAcrossYears: Story = {
  args: {defaultValue: "2026-12-31"},
  play: async ({canvasElement}) => {
    const canvas = within(canvasElement);
    await openCalendar(canvas);
    await userEvent.keyboard("{ArrowRight}");
    await expect(canvas.getByText("January 2027")).toBeVisible();
    await expect(day(canvas, /January 1, 2027/)).toHaveFocus();
    await userEvent.keyboard("{ArrowLeft}");
    await expect(canvas.getByText("December 2026")).toBeVisible();
    await expect(day(canvas, /December 31, 2026/)).toHaveFocus();
  },
};

export const MondayFirst: Story = {
  args: {defaultValue: "2026-03-15", weekStartsOn: 1},
  play: async ({canvasElement}) => {
    const canvas = within(canvasElement);
    await openCalendar(canvas);
    await expect(canvasElement.querySelector("th")).toHaveAccessibleName("Monday");
    await userEvent.keyboard("{Home}");
    await expect(day(canvas, /March 9, 2026/)).toHaveFocus();
    await userEvent.keyboard("{End}");
    await expect(day(canvas, /March 15, 2026/)).toHaveFocus();
  },
};

export const Disabled: Story = {
  args: {defaultValue: "2026-03-15", disabled: true},
  play: async ({canvasElement}) => {
    const canvas = within(canvasElement);
    await expect(input(canvas)).toBeDisabled();
    await expect(canvas.getByRole("button", {name: /Change date/})).toBeDisabled();
  },
};

export const WithoutVisibleLabel: Story = {
  args: {label: undefined, "aria-label": "Birthday"},
  play: async ({canvasElement}) => {
    await expect(within(canvasElement).getByRole("textbox", {name: "Birthday"})).toBeVisible();
  },
};

function FormHarness({pickerProps}: {pickerProps: StoryProps}) {
  const [result, setResult] = useState("");
  return (
    <form
      aria-label="Booking"
      onSubmit={event => {
        event.preventDefault();
        setResult(JSON.stringify(Array.from(new FormData(event.currentTarget).entries())));
      }}
    >
      <DatePicker {...(pickerProps as DatePickerProps)} />
      <button type="submit">Book</button>
      <button type="reset">Reset</button>
      <output>{result}</output>
    </form>
  );
}

// The text input is the named control, so FormData holds exactly "YYYY-MM-DD" (or "" when empty).
export const FormData_: Story = {
  name: "FormData",
  render: args => <FormHarness pickerProps={{...args, name: "appointment", defaultValue: "2026-03-15"}} />,
  play: async ({canvasElement}) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole("button", {name: "Book"}));
    await expect(canvas.getByRole("status")).toHaveTextContent('[["appointment","2026-03-15"]]');
    await openCalendar(canvas);
    await userEvent.click(day(canvas, /March 3, 2026/));
    await userEvent.click(canvas.getByRole("button", {name: "Book"}));
    await expect(canvas.getByRole("status")).toHaveTextContent('[["appointment","2026-03-03"]]');
    // Form reset restores the default date.
    await userEvent.click(canvas.getByRole("button", {name: "Reset"}));
    await waitFor(() => expect(input(canvas)).toHaveValue("2026-03-15"));
  },
};

export const RequiredBlocksSubmit: Story = {
  render: args => <FormHarness pickerProps={{...args, name: "appointment", required: true}} />,
  play: async ({canvasElement}) => {
    const canvas = within(canvasElement);
    await expect(input(canvas)).toBeRequired();
    await expect((canvasElement.querySelector("form") as HTMLFormElement).checkValidity()).toBe(false);
    await userEvent.type(input(canvas), "2026-07-04");
    await expect((canvasElement.querySelector("form") as HTMLFormElement).checkValidity()).toBe(true);
    // Required means no Clear button: an empty value would be invalid.
    await openCalendar(canvas);
    await expect(canvas.queryByRole("button", {name: "Clear"})).toBeNull();
  },
};

export const NarrowLayout: Story = {
  args: {defaultValue: "2026-03-15"},
  decorators: [Story => <div style={{width: 200, minHeight: 380}}><Story /></div>],
  play: async ({canvasElement}) => {
    const canvas = within(canvasElement);
    await expect(canvasElement.querySelector(".vl-datepicker")!.getBoundingClientRect().width).toBeLessThanOrEqual(200);
    await openCalendar(canvas);
    const panel = canvas.getByRole("dialog").getBoundingClientRect();
    await expect(panel.left).toBeGreaterThanOrEqual(0);
    await expect(panel.right).toBeLessThanOrEqual(window.innerWidth);
  },
};

// The date helpers are pure, so they are asserted directly. They use whole-day arithmetic in UTC, so nothing here depends on the
// machine's timezone or on daylight-saving changes.
export const DateLogic: Story = {
  render: () => <span>Date logic</span>,
  play: async () => {
    await expect(isLeapYear(2024)).toBe(true);
    await expect(isLeapYear(2026)).toBe(false);
    await expect(isLeapYear(2100)).toBe(false);
    await expect(isLeapYear(2000)).toBe(true);
    await expect(daysInMonth(2024, 2)).toBe(29);
    await expect(daysInMonth(2026, 2)).toBe(28);
    await expect(daysInMonth(2026, 4)).toBe(30);
    // Parsing is strict.
    await expect(parseDate("2026-03-15")).toEqual({year: 2026, month: 3, day: 15});
    for (const bad of ["", undefined, null, "2026-3-5", "2026-13-01", "2026-02-29", "2026-04-31", "2026-00-10", "0000-01-01", "2026-03-15T00:00:00Z", " 2026-03-15"]) {
      await expect(isValidDate(bad as string | undefined)).toBe(false);
    }
    await expect(isValidDate("2024-02-29")).toBe(true);
    // Day and month arithmetic across boundaries, including the dates where US and EU clocks change.
    await expect(addDays("2026-12-31", 1)).toBe("2027-01-01");
    await expect(addDays("2024-02-28", 1)).toBe("2024-02-29");
    await expect(addDays("2026-02-28", 1)).toBe("2026-03-01");
    await expect(addDays("2026-03-08", 1)).toBe("2026-03-09");
    await expect(addDays("2026-03-29", 1)).toBe("2026-03-30");
    await expect(addDays("2026-10-25", 1)).toBe("2026-10-26");
    await expect(addDays("2026-11-01", -1)).toBe("2026-10-31");
    await expect(addDays("2026-03-15", 365)).toBe("2027-03-15");
    await expect(addDays("2024-02-15", 366)).toBe("2025-02-15");
    await expect(addMonths("2026-01-31", 1)).toBe("2026-02-28");
    await expect(addMonths("2024-01-31", 1)).toBe("2024-02-29");
    await expect(addMonths("2026-12-15", 1)).toBe("2027-01-15");
    await expect(addMonths("2026-01-15", -1)).toBe("2025-12-15");
    await expect(addMonths("2026-03-31", -13)).toBe("2025-02-28");
    // Weekdays: 1970-01-01 was a Thursday, 2024-02-29 a Thursday, 2026-03-15 a Sunday.
    await expect(weekday("1970-01-01")).toBe(4);
    await expect(weekday("2024-02-29")).toBe(4);
    await expect(weekday("2026-03-15")).toBe(0);
    await expect(startOfWeek("2026-03-18", 0)).toBe("2026-03-15");
    await expect(startOfWeek("2026-03-18", 1)).toBe("2026-03-16");
    await expect(startOfWeek("2026-03-15", 1)).toBe("2026-03-09");
    await expect(endOfWeek("2026-03-15", 0)).toBe("2026-03-21");
    // Range checks and clamping; open or invalid bounds are ignored.
    await expect(isWithin("2026-03-15", "2026-03-15", "2026-03-15")).toBe(true);
    await expect(isWithin("2026-03-14", "2026-03-15")).toBe(false);
    await expect(isWithin("2026-03-16", undefined, "2026-03-15")).toBe(false);
    await expect(isWithin("2026-03-16", "nonsense", "also nonsense")).toBe(true);
    await expect(clampDate("2026-01-01", "2026-03-10", "2026-03-20")).toBe("2026-03-10");
    await expect(clampDate("2026-12-01", "2026-03-10", "2026-03-20")).toBe("2026-03-20");
    await expect(clampDate("2026-03-12", "2026-03-10", "2026-03-20")).toBe("2026-03-12");
    // "Today" is the local calendar day, whatever the timezone: built from the local fields of a fixed local time.
    await expect(todayLocal(new Date(2026, 2, 8, 23, 59, 59))).toBe("2026-03-08");
    await expect(todayLocal(new Date(2026, 2, 8, 0, 0, 1))).toBe("2026-03-08");
    // Spoken dates are not shifted by the timezone either.
    await expect(formatLongDate("2026-03-15", "en-US")).toBe("Sunday, March 15, 2026");
    await expect(formatLongDate("2024-02-29", "en-US")).toBe("Thursday, February 29, 2024");
  },
};

export const Dark: Story = {
  globals: {theme: "dark"},
  args: {defaultValue: "2026-03-15", min: "2026-03-02"},
  play: async ({canvasElement}) => {
    await openCalendar(within(canvasElement));
  },
};

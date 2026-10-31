export const valueFormatStyles = ["number", "currency", "percent"] as const;
export type ValueFormatStyle = (typeof valueFormatStyles)[number];

/** How numbers are displayed. It changes display text only, never the plotted values. */
export interface ValueFormat {
  /** `percent` follows the standard convention: 0.25 is shown as 25%. Defaults to `number`. */
  style?: ValueFormatStyle;
  /** ISO 4217 code such as "USD". Used by the `currency` style; defaults to USD. */
  currency?: string;
  /** Digits kept after the decimal point (0 to 20). Defaults to the style's usual precision. */
  maximumFractionDigits?: number;
}

export type NumberFormatter = (value: number) => string;

// A fixed locale keeps the server render, the browser and the tests identical.
const LOCALE = "en-US";

function formatPlain(value: number) {
  // Rounds away floating-point noise such as 0.30000000000000004 without changing what the number means.
  return String(Number(value.toPrecision(12)));
}

/** Builds a formatter from a `ValueFormat`. An invalid configuration (unknown currency, impossible digit count) falls back to the plain number format instead of throwing. */
export function createValueFormatter(format?: ValueFormat): NumberFormatter {
  if (format) {
    try {
      const style = format.style ?? "number";
      const formatter = new Intl.NumberFormat(LOCALE, {
        ...(style === "number" ? {} : {style}),
        ...(style === "currency" ? {currency: format.currency ?? "USD"} : {}),
        ...(format.maximumFractionDigits != null ? {maximumFractionDigits: format.maximumFractionDigits} : {}),
      });
      return value => formatter.format(value);
    } catch {
      // Falls through to the default formatter below.
    }
  }
  const fallback = new Intl.NumberFormat(LOCALE, {maximumFractionDigits: 3});
  return value => fallback.format(value);
}

/** Formats a number used as a position or label (an X value) without grouping separators, so 2024 stays "2024". */
export function formatAxisNumber(value: number) {
  return formatPlain(value);
}

const shareFormatter = new Intl.NumberFormat(LOCALE, {style: "percent", maximumFractionDigits: 1});
/** Formats a calculated share of a whole (0.256 becomes "25.6%"). Not a raw-value format: use `createValueFormatter` for that. */
export function formatShare(share: number) {
  return shareFormatter.format(share);
}

export const NO_VALUE = "No value";

/** Shortens long category labels on an axis. The full label stays in tooltips and the data table. */
export function truncateLabel(label: string, max: number) {
  return label.length > max ? `${label.slice(0, Math.max(1, max - 1))}…` : label;
}

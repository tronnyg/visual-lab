import type {ChartState} from "../../charts/ChartFrame";
import {formatAxisNumber} from "../../charts/chartFormatting";

export const chartTypes = ["bar", "line", "area", "scatter"] as const;
export type ChartType = (typeof chartTypes)[number];

export type ChartValue = string | number | null;
export type ChartRow = Record<string, ChartValue>;

export interface ChartSeries {
  /** Key of the row field that holds this series' numbers. */
  dataKey: string;
  /** Name shown in the legend, tooltip and data table. Defaults to `dataKey`. */
  label?: string;
}

export interface PlotSeries {
  /** Internal key (`s0`, `s1`, …) used for the plotted data, so a `dataKey` such as "net.sales" is never read as a nested path. */
  key: string;
  label: string;
}

export interface PlotRow {
  /** The X position: a number on a numeric axis, otherwise the label text. */
  x: string | number;
  /** The X value as text, for tooltips, ticks and the data table. */
  label: string;
  /** One entry per series. `null` is a missing value, never 0. */
  values: (number | null)[];
}

export interface ChartModel {
  state?: ChartState;
  xKind: "category" | "number";
  series: PlotSeries[];
  /** Rows in the order they were given. The data table uses this order. */
  rows: PlotRow[];
  /** Rows as drawn. A numeric Line or Area axis is drawn in ascending X order, otherwise this equals `rows`. */
  plotRows: PlotRow[];
}

interface ChartModelInput {
  type: ChartType;
  data: readonly ChartRow[];
  xKey: string;
  series: readonly ChartSeries[];
}

const invalid = (details: string[]): ChartModel => ({
  state: {kind: "invalid", message: "This chart can’t be drawn because its data is invalid.", details},
  xKind: "category", series: [], rows: [], plotRows: [],
});
const empty = (message: string): ChartModel => ({
  state: {kind: "empty", message},
  xKind: "category", series: [], rows: [], plotRows: [],
});

const own = (row: object, key: string) => (Object.hasOwn(row, key) ? (row as Record<string, unknown>)[key] : undefined);
const describe = (value: unknown) => (typeof value === "string" ? `“${value}”` : String(value));

/** Validates the data against the chart type and turns it into plot-ready rows.
 *  It never repairs bad data: anything that would change the meaning of the chart makes the whole chart invalid. */
export function buildChartModel({type, data, xKey, series}: ChartModelInput): ChartModel {
  if (!Array.isArray(data)) return invalid(["`data` must be an array of row objects."]);
  if (data.length === 0) return empty("No data to display.");
  if (!Array.isArray(series) || series.length === 0) return invalid(["Add at least one series to plot."]);
  if (typeof xKey !== "string" || xKey === "") return invalid(["`xKey` must name the field that holds the X values."]);

  const problems: string[] = [];
  const plotSeries: PlotSeries[] = [];
  const seen = new Set<string>();
  series.forEach((s, i) => {
    if (!s || typeof s.dataKey !== "string" || s.dataKey === "") {
      problems.push(`Series ${i + 1} has no \`dataKey\`.`);
      return;
    }
    if (seen.has(s.dataKey)) problems.push(`Series “${s.dataKey}” is listed more than once.`);
    seen.add(s.dataKey);
    plotSeries.push({key: `s${i}`, label: s.label?.trim() ? s.label : s.dataKey});
  });
  if (problems.length) return invalid(problems);

  // Pass 1: read every X and Y exactly as given.
  const rawX: unknown[] = [];
  const rows: PlotRow[] = [];
  const present = series.map(() => false);
  data.forEach((row, r) => {
    const n = r + 1;
    if (row === null || typeof row !== "object") {
      problems.push(`Row ${n} is not an object.`);
      return;
    }
    const x = own(row, xKey);
    if (x === undefined || x === null || (typeof x === "string" && x.trim() === "")) {
      problems.push(`Row ${n} has no “${xKey}” value.`);
    } else if (typeof x === "number" ? !Number.isFinite(x) : typeof x !== "string") {
      problems.push(`Row ${n}: X value ${describe(x)} must be text or a finite number.`);
    }
    const values = series.map((s, i) => {
      const y = own(row, s.dataKey);
      if (y !== undefined) present[i] = true;
      if (y === undefined || y === null) return null;
      if (typeof y === "number" && Number.isFinite(y)) return y;
      problems.push(`Row ${n}, “${s.dataKey}”: ${describe(y)} is not a finite number.`);
      return null;
    });
    rawX.push(x);
    rows.push({x: x as string | number, label: "", values});
  });
  series.forEach((s, i) => {
    if (!present[i]) problems.push(`Series “${s.dataKey}” does not appear in any row.`);
  });
  if (problems.length) return invalid(problems);

  // Pass 2: the X values must suit the chart type.
  const numbers = rawX.filter(x => typeof x === "number").length;
  const strings = rawX.length - numbers;
  let xKind: ChartModel["xKind"] = "category";
  if (type === "scatter") {
    if (strings) return invalid([`Scatter needs a number for every X value, but ${strings === 1 ? "1 row has" : `${strings} rows have`} text.`]);
    xKind = "number";
  } else if (type !== "bar") {
    if (numbers && strings) return invalid(["X values mix text and numbers. Use all text for a categorical axis or all numbers for a numeric axis."]);
    xKind = numbers ? "number" : "category";
  }

  rows.forEach(row => {
    row.label = typeof row.x === "number" ? formatAxisNumber(row.x) : row.x;
    if (xKind === "category") row.x = row.label;
  });

  // A categorical axis puts each X in its own slot, so a repeated label would draw two rows on top of each other.
  if (xKind === "category") {
    const labels = new Set<string>();
    const duplicates = new Set<string>();
    rows.forEach(row => (labels.has(row.label) ? duplicates.add(row.label) : labels.add(row.label)));
    if (duplicates.size) return invalid([...duplicates].map(label => `X value “${label}” appears more than once on a categorical axis.`));
  }

  if (!rows.some(row => row.values.some(v => v !== null))) return empty("There are no values to plot.");

  const plotRows = xKind === "number" && type !== "scatter" ? [...rows].sort((a, b) => (a.x as number) - (b.x as number)) : rows;
  return {xKind, series: plotSeries, rows, plotRows};
}

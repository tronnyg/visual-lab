import type {ChartState} from "../../charts/ChartFrame";

export const proportionChartTypes = ["pie", "donut"] as const;
export type ProportionChartType = (typeof proportionChartTypes)[number];

export type ProportionValue = string | number | null;
export type ProportionRow = Record<string, ProportionValue>;

export interface ProportionPart {
  name: string;
  /** The value exactly as given. */
  value: number;
  /** `value` divided by the total of all values (0 to 1). */
  share: number;
}

export interface ProportionModel {
  state?: ChartState;
  /** Every category in the order given, including zero-value ones. The data table lists all of them. */
  parts: ProportionPart[];
  /** The categories with a value above zero, which are the ones drawn. */
  slices: ProportionPart[];
}

const invalid = (details: string[]): ProportionModel => ({
  state: {kind: "invalid", message: "This chart can’t be drawn because its data is invalid.", details},
  parts: [], slices: [],
});

const own = (row: object, key: string) => (Object.hasOwn(row, key) ? (row as Record<string, unknown>)[key] : undefined);
const describe = (value: unknown) => (typeof value === "string" ? `“${value}”` : String(value));

/** Validates the data and calculates each category's share of the actual total.
 *  Values are never interpreted as percentages and never repaired: a negative, missing or non-finite value makes the chart invalid. */
export function buildProportionModel({data, nameKey, valueKey}: {data: readonly ProportionRow[]; nameKey: string; valueKey: string}): ProportionModel {
  if (!Array.isArray(data)) return invalid(["`data` must be an array of row objects."]);
  if (data.length === 0) return {state: {kind: "empty", message: "No data to display."}, parts: [], slices: []};
  if (typeof nameKey !== "string" || nameKey === "") return invalid(["`nameKey` must name the field that holds the category names."]);
  if (typeof valueKey !== "string" || valueKey === "") return invalid(["`valueKey` must name the field that holds the values."]);

  const problems: string[] = [];
  const names = new Set<string>();
  const rows: {name: string; value: number}[] = [];
  data.forEach((row, r) => {
    const n = r + 1;
    if (row === null || typeof row !== "object") {
      problems.push(`Row ${n} is not an object.`);
      return;
    }
    const rawName = own(row, nameKey);
    const rawValue = own(row, valueKey);
    const nameOk = (typeof rawName === "string" && rawName.trim() !== "") || (typeof rawName === "number" && Number.isFinite(rawName));
    if (!nameOk) problems.push(`Row ${n} has no “${nameKey}” name.`);
    else if (names.has(String(rawName))) problems.push(`The name “${rawName}” appears more than once.`);
    else names.add(String(rawName));
    if (rawValue === undefined || rawValue === null) problems.push(`Row ${n} has no “${valueKey}” value.`);
    else if (typeof rawValue !== "number" || !Number.isFinite(rawValue)) problems.push(`Row ${n}: ${describe(rawValue)} is not a finite number.`);
    else if (rawValue < 0) problems.push(`Row ${n}: ${rawValue} is negative. A part of a whole cannot be below zero.`);
    else if (nameOk) rows.push({name: String(rawName), value: rawValue});
  });
  if (problems.length) return invalid(problems);

  const total = rows.reduce((sum, row) => sum + row.value, 0);
  if (!(total > 0)) return {state: {kind: "empty", message: "Every value is zero, so there is nothing to show."}, parts: [], slices: []};
  if (!Number.isFinite(total)) return invalid(["The values are too large to add up."]);
  const parts = rows.map(row => ({...row, share: row.value / total}));
  return {parts, slices: parts.filter(part => part.value > 0)};
}

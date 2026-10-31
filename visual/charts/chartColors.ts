export const chartColorCount = 6;

/** The CSS colour for the series at `index`. The six `--ui-chart-*` tokens are defined for both themes and the palette repeats after the sixth. */
export function chartColor(index: number) {
  return `var(--ui-chart-${(index % chartColorCount) + 1})`;
}

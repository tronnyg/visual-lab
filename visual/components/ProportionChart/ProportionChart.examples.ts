// Positional args: ProportionChart(type, data, nameKey, valueKey, title, description, valueFormat, showLegend, showLabels, height)
// Figures are illustrative; each title says so where a reader might take them for real data.
export const proportionChartExamples = [
  {
    title: "Donut chart of traffic by device",
    code: 'root = ProportionChart("donut", data, "category", "value", "Traffic by device (illustrative)")\ndata = [{category: "Desktop", value: 55}, {category: "Mobile", value: 35}, {category: "Tablet", value: 10}]',
  },
  {
    title: "Pie chart with slice labels",
    code: 'root = ProportionChart("pie", data, "source", "visits", "Visits by source (illustrative)", "Share of all visits this month.", null, true, true)\ndata = [{source: "Search", visits: 4200}, {source: "Direct", visits: 2600}, {source: "Referral", visits: 1500}, {source: "Social", visits: 900}]',
  },
  {
    title: "Pie chart with currency values",
    code: 'root = ProportionChart("pie", data, "item", "amount", "Budget allocation (illustrative)", null, {style: "currency", currency: "USD", maximumFractionDigits: 0})\ndata = [{item: "Engineering", amount: 120000}, {item: "Marketing", amount: 45000}, {item: "Operations", amount: 35000}]',
  },
  {
    title: "Donut chart in a card",
    code: 'root = Card(null, null, [heading, chart])\nheading = Text("Storage used", "default", "subheading")\nchart = ProportionChart("donut", data, "kind", "gb", null, "Illustrative figures, in GB", null, true, false, 240)\ndata = [{kind: "Documents", gb: 42}, {kind: "Media", gb: 118}, {kind: "Backups", gb: 64}, {kind: "Other", gb: 0}]',
  },
] as const;

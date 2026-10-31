// Positional args: Chart(type, data, xKey, series, title, description, xAxisLabel, yAxisLabel, valueFormat, showLegend, showPoints, horizontal, height)
// Figures are illustrative; each title says so where a reader might take them for real data.
export const chartExamples = [
  {
    title: "Bar chart comparing categories",
    code: 'root = Chart("bar", data, "team", [{dataKey: "tickets", label: "Tickets closed"}], "Tickets closed per team (illustrative)")\ndata = [{team: "Support", tickets: 142}, {team: "Billing", tickets: 96}, {team: "Onboarding", tickets: 118}, {team: "Platform", tickets: 64}]',
  },
  {
    title: "Grouped horizontal bars",
    code: 'root = Chart("bar", data, "region", [{dataKey: "q1", label: "Q1"}, {dataKey: "q2", label: "Q2"}], "Revenue by region (illustrative)", null, null, null, {style: "currency", currency: "USD", maximumFractionDigits: 0}, null, null, true)\ndata = [{region: "North America", q1: 120000, q2: 138000}, {region: "Europe", q1: 98000, q2: 104000}, {region: "Asia Pacific", q1: 76000, q2: 91000}]',
  },
  {
    title: "Line chart with two series",
    code: 'root = Chart("line", data, "month", [{dataKey: "sales", label: "Sales"}, {dataKey: "expenses", label: "Expenses"}], "Monthly performance (illustrative)", null, "Month", "Amount (USD)")\ndata = [{month: "Jan", sales: 120, expenses: 80}, {month: "Feb", sales: 160, expenses: 95}, {month: "Mar", sales: 140, expenses: 110}, {month: "Apr", sales: 185, expenses: 120}]',
  },
  {
    title: "Line chart with a numeric axis and a gap",
    code: 'root = Chart("line", data, "year", [{dataKey: "users", label: "Active users"}], "Active users by year (illustrative)", "A missing value leaves a gap instead of a zero.", "Year", null, null, null, true)\ndata = [{year: 2019, users: 1200}, {year: 2020, users: 1850}, {year: 2021, users: null}, {year: 2023, users: 3400}, {year: 2024, users: 4100}]',
  },
  {
    title: "Area chart as percentages",
    code: 'root = Chart("area", data, "week", [{dataKey: "completion", label: "Completion"}], "Project completion (illustrative)", null, "Week", null, {style: "percent"})\ndata = [{week: "W1", completion: 0.1}, {week: "W2", completion: 0.28}, {week: "W3", completion: 0.55}, {week: "W4", completion: 0.8}]',
  },
  {
    title: "Scatter plot of two numeric variables",
    code: 'root = Chart("scatter", data, "hours", [{dataKey: "score", label: "Exam score"}], "Study time against score (illustrative)", null, "Hours studied", "Score")\ndata = [{hours: 1, score: 52}, {hours: 2, score: 58}, {hours: 3.5, score: 67}, {hours: 4, score: 64}, {hours: 6, score: 81}, {hours: 7.5, score: 88}]',
  },
  {
    title: "Chart in a card",
    code: 'root = Card(null, null, [heading, chart])\nheading = Text("Weekly signups", "default", "subheading")\nchart = Chart("area", data, "day", [{dataKey: "signups", label: "Signups"}], null, "Illustrative figures", null, null, null, null, true, false, 220)\ndata = [{day: "Mon", signups: 34}, {day: "Tue", signups: 41}, {day: "Wed", signups: 38}, {day: "Thu", signups: 52}, {day: "Fri", signups: 47}]',
  },
] as const;

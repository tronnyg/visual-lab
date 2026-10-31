// Positional args: Breadcrumbs(items, separator). Each item is {label, href?, current?}. Links must be full URLs, mailto:, tel: or #anchors.
export const breadcrumbsExamples = [
  {
    title: "Short breadcrumb path",
    code: 'root = Breadcrumbs([{label: "Home", href: "https://example.com"}, {label: "Projects", href: "https://example.com/projects"}, {label: "Visual Lab"}])',
  },
  {
    title: "Breadcrumbs with a custom separator",
    code: 'root = Breadcrumbs([{label: "Docs", href: "https://example.com/docs"}, {label: "Components", href: "https://example.com/docs/components"}, {label: "Breadcrumbs"}], ">")',
  },
  {
    title: "Long breadcrumb path",
    code: 'root = Breadcrumbs([{label: "Home", href: "https://example.com"}, {label: "Documentation", href: "https://example.com/docs"}, {label: "Guides", href: "https://example.com/docs/guides"}, {label: "Working with data", href: "https://example.com/docs/guides/data"}, {label: "Importing and exporting large spreadsheets", href: "https://example.com/docs/guides/data/spreadsheets"}, {label: "Troubleshooting encoding problems in imported files"}])',
  },
  {
    title: "Breadcrumbs above a page",
    code: 'root = Stack([trail, title, intro], "sm")\ntrail = Breadcrumbs([{label: "Settings", href: "#settings"}, {label: "Security", href: "#security"}, {label: "Two-factor sign-in"}])\ntitle = Text("Two-factor sign-in", "default", "title", "h1")\nintro = Text("Add a second step when you sign in.", "muted")',
  },
] as const;

// Positional args: Icon(name, size, tone, label)
// name is required and must be one of the allowlisted names; skip optional arguments you do not need with null.
// Defaults: md size, inherits the surrounding text colour, decorative (no label).
// Set label only when the icon carries meaning by itself; beside text, leave it off so the icon is hidden from assistive technology.
export const iconExamples = [
  {
    title: "Icons beside text with sizes and tones",
    code: `root = Stack([Text("Status", "default", "heading", "h2"), saved, warning, failed, sizes], "md")\nsaved = Stack([Icon("check-circle", "md", "success"), Text("Changes saved", "default")], "sm", "horizontal", "center")\nwarning = Stack([Icon("alert-triangle", "md", "warning"), Text("Storage is almost full", "default")], "sm", "horizontal", "center")\nfailed = Stack([Icon("x-circle", "md", "danger"), Text("Upload failed", "default")], "sm", "horizontal", "center")\nsizes = Stack([Icon("star", "xs"), Icon("star", "sm"), Icon("star", "md"), Icon("star", "lg"), Icon("star", "xl")], "md", "horizontal", "center")`,
  },
  {
    title: "Icons in a Card with a meaningful labelled icon",
    code: `root = Card(null, null, [Stack([Icon("info", "lg", "accent"), Text("Heads up", "default", "subheading", "h3")], "sm", "horizontal", "center"), Text("Icons inherit text colour unless a tone is set.", "muted"), Divider(), Stack([Icon("lock", "sm", "muted", "Private board"), Text("Only you can see this", "muted", "caption")], "xs", "horizontal", "center")], "default", "md", "sm")`,
  },
  {
    title: "Icons in a Grid of navigation shortcuts",
    code: `root = Grid([home, search, calendar, settings], 4, "md", null, null, null, "center", "none")\nhome = Stack([Icon("home", "xl", "accent"), Text("Home", "default", "caption")], "xs", "vertical", "center")\nsearch = Stack([Icon("search", "xl", "accent"), Text("Search", "default", "caption")], "xs", "vertical", "center")\ncalendar = Stack([Icon("calendar", "xl", "accent"), Text("Calendar", "default", "caption")], "xs", "vertical", "center")\nsettings = Stack([Icon("settings", "xl", "accent"), Text("Settings", "default", "caption")], "xs", "vertical", "center")`,
  },
];

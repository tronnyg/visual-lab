// Positional args: Divider(orientation, tone, spacing, decorative)
// All arguments are optional; skip one you do not need with null. Defaults: horizontal, subtle, sm, decorative.
// A vertical Divider needs a horizontal Stack with a height (a row with text beside it), where it stretches to the row's height.
export const dividerExamples = [
  {
    title: "Divider between text sections",
    code: `root = Stack([intro, Divider(), details, Divider("horizontal", "strong", "md"), footer], "md")\nintro = Text("Overview", "default", "heading", "h2")\ndetails = Text("A divider separates sections without adding a heading or a surface.", "muted")\nfooter = Text("Divider is purely visual, so it takes no content of its own.", "muted", "caption")`,
  },
  {
    title: "Divider tones and spacing",
    code: `root = Stack([Text("Tones", "default", "subheading", "h3"), Divider("horizontal", "subtle"), Divider("horizontal", "default"), Divider("horizontal", "strong"), Text("Spacing sets the margin around the line", "default", "subheading", "h3"), Text("none", "muted", "caption"), Divider("horizontal", "default", "none"), Text("lg", "muted", "caption"), Divider("horizontal", "default", "lg"), Text("end", "muted", "caption")], "none")`,
  },
  {
    title: "Divider inside a Card and between row items",
    code: `root = Stack([card, row], "lg")\ncard = Card(null, null, [Text("Account", "default", "subheading", "h3"), Text("Signed in as the project owner.", "muted"), Divider("horizontal", "subtle", "xs"), Text("Last updated today.", "muted", "caption")], "default", "md", "sm")\nrow = Stack([Text("Draft", "default", "label"), Divider("vertical", "default"), Text("3 comments", "muted"), Divider("vertical", "default"), Text("Updated today", "muted")], "none", "horizontal", "stretch", "start", true)`,
  },
  {
    title: "Decorative and semantic dividers",
    code: `root = Stack([Text("Decorative (default): hidden from assistive technology", "muted"), Divider("horizontal", "default", "sm", true), Text("Semantic: exposed as a separator between two regions", "muted"), Divider("horizontal", "strong", "sm", false)], "sm")`,
  },
];

// Positional args: Markdown(source)
// The source is a Markdown string written as an OpenUI string literal, so line breaks are \n and quotes are \".
// Sources are written as plain Markdown below and encoded with JSON.stringify, whose escapes are valid OpenUI string escapes.
const doc = (source: string) => `root = Markdown(${JSON.stringify(source)})`;

const explanation = `# Why the sky is blue

Sunlight looks white, but it is a mix of **all colours**. As it crosses the atmosphere, air molecules scatter *short wavelengths* (blue) far more than long ones (red).

## What you see

- Blue light is scattered in every direction, so the whole sky glows.
- At sunset the light travels through more air, so the blue is scattered away and **red and orange** remain.

## Remember

1. Sunlight is a mix of colours.
2. Shorter wavelengths scatter more.
3. Your eyes see the scattered blue from every direction.`;

const technical = `## Debouncing input

Call \`debounce(fn, wait)\` to delay \`fn\` until the user has stopped typing for \`wait\` milliseconds.

\`\`\`ts
function debounce<T extends unknown[]>(fn: (...args: T) => void, wait: number) {
  let timer: ReturnType<typeof setTimeout> | undefined;
  return (...args: T) => {
    clearTimeout(timer);
    timer = setTimeout(() => fn(...args), wait);
  };
}
\`\`\`

Each new call cancels the pending one, so \`fn\` runs once, after the last call.`;

const comparison = `## Renewable energy at a glance

| Source | Typical capacity factor | Best suited to | Main drawback |
| --- | :---: | --- | --- |
| Solar | 15–25% | Sunny regions, rooftops | Output stops at night |
| Wind | 25–45% | Coasts, open plains | Variable with weather |
| Hydro | 35–55% | Rivers with elevation | Needs suitable geography |

*Illustrative ranges only.*`;

const quote = `> The measure of intelligence is the ability to change.
>
> — attributed to Albert Einstein

Read more on [Wikipedia](https://en.wikipedia.org/wiki/Albert_Einstein) or visit [the Nobel Prize site](https://www.nobelprize.org/prizes/physics/1921/einstein/facts/).`;

// Verified to load at the time of writing; external availability is not guaranteed.
const image = `## Portrait

![Portrait of Isaac Newton by Godfrey Kneller, 1689](https://upload.wikimedia.org/wikipedia/commons/3/39/GodfreyKneller-IsaacNewton-1689.jpg)

Images keep their proportions and never grow wider than the column.`;

const mixed = `# Release notes — v2.4

A **small release** focused on reliability. See the [changelog](https://example.com/changelog) for every change.

## Highlights

- Faster startup
  - Lazy-loaded plugins
  - Cached configuration
- Clearer error messages
- ~~Legacy export~~ removed

## Upgrade checklist

- [x] Back up your data
- [x] Read the notes
- [ ] Run \`npm install\`
- [ ] Restart the service

## Configuration

Set the log level in \`config.json\`:

\`\`\`json
{
  "logLevel": "info",
  "retries": 3
}
\`\`\`

## Compatibility

| Platform | Supported |
| --- | --- |
| Linux | Yes |
| macOS | Yes |
| Windows | Partial |

> **Note:** Windows support is in beta.

---

Questions? Open an issue.`;

export const markdownExamples = [
  {title: "Markdown: formatted explanation", code: doc(explanation)},
  {title: "Markdown: technical document with code", code: doc(technical)},
  {title: "Markdown: comparison table", code: doc(comparison)},
  {title: "Markdown: blockquote and links", code: doc(quote)},
  {title: "Markdown: image", code: doc(image)},
  {title: "Markdown: longer mixed-content document", code: doc(mixed)},
  {
    title: "Markdown inside Card and Stack, with Text",
    code: 'root = Stack([heading, row], "lg")\nheading = Text("Study guide", "default", "title", "h1")\nrow = Stack([notes, summary], "md", "horizontal", "stretch", "start", true)\nnotes = Card(null, null, [notesBody], "default")\nnotesBody = Markdown("## Key ideas\\n\\n- **Force** equals mass times acceleration\\n- Use `F = ma` for net force")\nsummary = Card(null, null, [label, summaryBody], "filled")\nlabel = Text("Summary", "muted", "overline")\nsummaryBody = Markdown("Short **reminder** with a [link](https://example.com).")',
  },
  {
    title: "Reactive Markdown",
    code: 'root = Stack([doc, add], "sm")\n$count = 0\ndoc = Markdown("## Counter\\n\\nClicked **" + $count + "** times.")\nadd = Button("Add one", false, "primary", "default", false, false, "plus", null, @Set($count, $count + 1))',
  },
] as const;

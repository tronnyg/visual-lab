// Everything the AI reads that Visual Lab controls beyond the component definitions: groups, rules and corrections to SDK boilerplate.
// Per-component guidance lives in each component's `description`; the Zod `.describe()` text on props does not reach the prompt.
export const componentGroups=[
  {name:"Layout",components:["Stack","Grid","Divider","Spacer"],notes:[
    "- Stack is for one-dimensional layout (a column, or a row with direction \"horizontal\"). Grid is for two-dimensional layout (equal columns that wrap into rows). Do not wrap horizontal Stacks to imitate a grid.",
    "- Card is for visual grouping, not layout. Spacer is for exceptional spacing; use gap for ordinary spacing.",
  ]},
  {name:"Containers",components:["Card"]},
  {name:"Feedback",components:["Badge","Alert","Progress","Spinner"],notes:[
    "- Badge is a small non-interactive label: Badge(\"New\", \"success\"). Variants: default, secondary, outline, success, warning, danger. Put the meaning in the text, not only the colour. Badge(\"Items: \" + $count) updates live. Use Button for actions.",
    "- Alert is a static inline message: Alert(message, title, variant), e.g. Alert(\"Your changes were saved.\", \"Saved\", \"success\"). Variants: info (default), success, warning, danger. Title is optional (pass null to skip it before a variant). Use \\n in the message for line breaks. It has no dismiss button and is not a toast; use Text for plain sentences.",
    "- Progress is a display-only bar: Progress(value, max, label), e.g. Progress($done, 100, \"Upload progress\"). Max defaults to 100; out-of-range values are clamped. It follows any number or $variable, such as a Slider's, but cannot be dragged and draws no text, so add a Text for a visible label or percentage and set label for accessibility.",
    "- Spinner is a decorative loading indicator: Spinner(size, label), e.g. Spinner(\"md\", \"Loading results\"). Sizes: sm, md (default), lg. It spins forever and tracks no state, so show it only for content that is really loading. Set label when the spinner is the only sign of loading; omit it beside visible text like \"Saving…\". Use Progress when the amount done is known.",
  ]},
  {name:"Content",components:["Text","Markdown","Image","Icon"]},
  {name:"Data",components:["Table","List","KeyValue","CodeBlock"],notes:[
    "- Table is a read-only data table: Table(columns, rows, caption, density, striped, emptyMessage). Columns are objects {key: \"score\", header: \"Score\", align: \"end\"} (align: start, center, end; use end for numbers) and each row is an object keyed by column key, {name: \"Alpha\", score: 82}. Values are text, numbers or null for an empty cell. Always set a caption. Use density \"compact\" for dense data and striped for long tables. It cannot sort, filter or hold components in cells; use Markdown for a table with rich text.",
    "- List is a bulleted or numbered list of short text items: List(items, variant, start, density), e.g. List([\"Prepare materials\", \"Review results\"], \"ordered\"). Variants: unordered (default) and ordered (steps in a sequence). An item with a nested list is an object {content: \"Phase 1\", items: [\"Task\", \"Task\"]}, one nested level only. Items are plain text; use Markdown for links or bold text, and Table for rows of data.",
    "- KeyValue shows label/value facts about one thing: KeyValue(items, layout, dividers, emptyMessage), e.g. KeyValue([{label: \"Status\", value: \"Active\"}, {label: \"Owner\", value: \"Alex\"}], \"inline\", true). Values are text, numbers or null. Layouts: inline (default; stacks automatically in a narrow space) and stacked. Use Table for many records with the same columns.",
    "- CodeBlock is read-only source code, commands or logs: CodeBlock(code, language, showLineNumbers, copyable, wrap), e.g. CodeBlock(\"const total = items.length;\\nconsole.log(total);\", \"typescript\", true, true). Write line breaks as \\n and escape quotes as \\\". The language is only a label: there is no syntax highlighting. Set copyable for code people will paste; set wrap to wrap long lines instead of scrolling. Use Markdown for prose with a short snippet.",
  ]},
  {name:"Navigation",components:["Tabs"],notes:[
    "- Tabs show one of several related views at a time: Tabs(items, value, variant, orientation), e.g. Tabs([{id: \"overview\", label: \"Overview\", content: overview}, {id: \"data\", label: \"Data\", content: table}]). Each item is {id, label, content, disabled}; content is ONE component defined elsewhere (wrap several in a Stack) and every panel keeps its state while hidden. Ids must be unique. Pass a bare $variable declared with a tab id as value to read or set the selected tab elsewhere; a string literal only picks the initial tab, and null starts on the first enabled tab. Variants: line (default) and contained; orientation horizontal (default) or vertical. Tabs are for mutually exclusive views, not for steps or page navigation.",
  ]},
  {name:"Disclosure",components:["Accordion","Collapsible"],notes:[
    "- Accordion is a set of expandable sections: Accordion(items, type, open, collapsible), e.g. Accordion([{id: \"ship\", title: \"Shipping\", content: shipText}, {id: \"ret\", title: \"Returns\", content: retText}], \"single\", [\"ship\"]). Each item is {id, title, content, disabled}; content is ONE component defined elsewhere (wrap several in a Stack) and closed sections keep their state. Ids must be unique. type: single (default; opening one closes the others) or multiple. open lists the ids that start open. collapsible (single mode, default true) controls whether the open section can be closed. Its open state is local and cannot be bound to a $variable. Use Tabs for exclusive views.",
    "- Collapsible is one optional detail region behind a toggle button: Collapsible(title, content, open, disabled, variant), e.g. Collapsible(\"Advanced options\", options, false, null, \"bordered\"). content is ONE component defined elsewhere (wrap several in a Stack) and keeps its state while hidden. open is true/false for the initial state, or a bare boolean $variable declared with a default (e.g. $open = false) to read or set it elsewhere: Text($open ? \"Shown\" : \"Hidden\"). Variants: plain (default) and bordered. Use Accordion for several related sections.",
  ]},
  {name:"Visualization",components:["Chart","ProportionChart"],notes:[
    "- Chart draws records as a bar, line, area or scatter chart: Chart(type, data, xKey, series, title, description, xAxisLabel, yAxisLabel, valueFormat, showLegend, showPoints, horizontal, height), e.g. Chart(\"line\", [{month: \"Jan\", sales: 120, expenses: 80}, {month: \"Feb\", sales: 160, expenses: 95}], \"month\", [{dataKey: \"sales\", label: \"Sales\"}, {dataKey: \"expenses\", label: \"Expenses\"}], \"Monthly performance\"). Data is an array of objects, xKey names the X field and each series {dataKey, label} names a numeric field. Choose the type by the question: bar compares categories, line shows a trend over an ordered axis, area emphasizes magnitude over an ordered axis, scatter shows the relationship between two numeric variables (xKey must be numeric). Use Table when precise values matter more than the shape, and ProportionChart for a few parts of a whole. Always set a title. null is a gap, never 0; do not invent values to fill gaps. Text X values are categories and must not repeat; a line or area's X values must be all text or all numbers. Series are not stacked. valueFormat only changes how numbers are shown: {style: \"currency\", currency: \"USD\"}, or {style: \"percent\"} for fractions such as 0.25. A bar chart with horizontal set suits long category names.",
    "- ProportionChart shows parts of a whole as a pie or donut: ProportionChart(type, data, nameKey, valueKey, title, description, valueFormat, showLegend, showLabels, height), e.g. ProportionChart(\"donut\", [{category: \"Desktop\", value: 55}, {category: \"Mobile\", value: 35}, {category: \"Tablet\", value: 10}], \"category\", \"value\", \"Traffic by device\"). Values are amounts, not percentages: each share is calculated from their total, so never pre-compute percentages unless they are the real values. Use it only when the categories are meaningful parts of one whole and there are few of them (about 2 to 6); do not choose a pie or donut just because the data has categories. For many categories, or when readers must compare values precisely, use Chart with type \"bar\"; use Table for exact figures. Values must not be negative, names must be unique, a zero value has no slice and all-zero data shows a message. The legend shows each share; showLabels also labels the slices.",
  ]},
  {name:"Controls",components:["Button","Input","Textarea","Checkbox","Slider","RadioGroup","Select"],notes:[
    "- Input needs a bare $variable as its first argument, declared with a default (e.g. $name = \"\"), so typing writes to it. Text(\"Hello, \" + $name) updates live with no request. Give each field its own variable. An expression or string literal makes a read-only field. Reset one with @Reset($name).",
    "- Textarea works like Input but is multiline: Textarea($notes, placeholder, disabled, label, rows). Use it for longer free text; use Input for short single-line values.",
    "- Checkbox needs a bare boolean $variable as its first argument, declared with a default (e.g. $agree = false): Checkbox($agree, \"I agree\"). Toggling updates Text($agree ? \"Yes\" : \"No\") live. Give each checkbox its own variable. Reset with @Reset($agree).",
    "- Slider needs a bare number $variable as its first argument, declared with a default (e.g. $volume = 40): Slider($volume, \"Volume\", min, max, step). Defaults are 0, 100 and 1. Dragging updates Text(\"Volume: \" + $volume) live. Give each slider its own variable and always set a label. Reset with @Reset($volume).",
    "- RadioGroup needs a bare string $variable as its first argument, declared with a default equal to one option's value (e.g. $plan = \"Free\"): RadioGroup($plan, [\"Free\", \"Pro\"], \"Plan\"). Options are strings, or {label: \"Small\", value: \"s\"} when the stored value should differ from the shown text. Choosing one updates Text(\"Plan: \" + $plan) live. Give each group its own variable and always set a label. Reset with @Reset($plan).",
    "- Select is a dropdown with the same arguments as RadioGroup plus an optional placeholder: Select($country, [\"Canada\", \"Peru\"], \"Country\", false, \"Choose a country\"). Use Select for 5 or more options and RadioGroup for fewer. Start the variable at \"\" to show the placeholder, or at one option's value. Reset with @Reset($country).",
  ]},
];
export const promptOptions={
  preamble:"Generate only OpenUI Lang. Every board contains one OpenUI document whose root can be any registered component. Do not include markdown fences.",
  additionalRules:[
    "Only use the components listed under Component Signatures.",
    "To skip an optional argument that comes before one you need, pass null (or false for a boolean), e.g. Card(null, null, [children]). Never use named arguments.",
    "Do not fabricate factual data; label illustrative examples.",
    "A Button with no action does nothing and does not message the assistant. Use @Set and @Reset for local reactive interactions, and @ToAssistant(\"message\") only when a click should be sent to the assistant.",
  ],
  bindings:true,
  toolCalls:false,
};
// The SDK hard-codes a few passages that describe the stock library, not ours, and offers no option to change them.
// Each rewrite must match exactly once: if an SDK upgrade changes the text, generation fails instead of silently shipping stale guidance.
const rewrites:[string,string][]=[
  ["every program must define `root = Stack(...)`","every program must define `root = Component(...)`, where Component is any registered component"],
  ["1. `root = Stack(...)` — UI shell appears immediately","1. `root = ...` — UI shell appears immediately"],
  ["Always write the root = Stack(...) statement first","Always write the `root = ...` statement first"],
  ["1. root = Stack(...) is the FIRST line","1. `root = ...` is the FIRST line"],
  ["for KPIs/chart values, ","for KPIs and computed values, "],
  ["use with @Sum, @Avg, charts, tables.","use with @Sum, @Avg."],
  ["- Choose components that best represent the content (tables for comparisons, charts for trends, forms for input, etc.)","- Choose the registered components that best represent the content."],
  ["Pass one @-prefixed step bare, e.g. Button(\"Ask\", @ToAssistant(\"Tell me more\")). Put several steps in Action([...]), e.g. Button(\"Read\", Action([@OpenUrl(\"https://example.com\"), @ToAssistant(\"Summarize this page\")])). Steps execute in order.\nButtons without an action automatically send their label to the assistant (equivalent to @ToAssistant(label)).",
   "The action is the LAST (9th) Button argument, so fill the earlier ones with false/null/defaults: Button(\"Ask\", false, \"primary\", \"default\", false, false, null, null, @ToAssistant(\"Tell me more\")). Pass one @-prefixed step bare, or put several in Action([...]). Steps execute in order.\nA Button with no action does nothing and does not message the assistant."],
  ["viewBtn = Button(\"View\", @OpenUrl(\"https://example.com\"))","viewBtn = Button(\"View\", false, \"primary\", \"default\", false, false, null, null, @OpenUrl(\"https://example.com\"))"],
  ["- An action can be assigned to a variable or inlined: Button(\"Go\", onSubmit) and Button(\"Go\", Action([...])) both work","- An action can be assigned to a name (onSubmit = Action([...])) and passed as the last Button argument, or written inline there"],
];
export function correctStockText(prompt:string){
  return rewrites.reduce((p,[from,to])=>{
    const n=p.split(from).length-1;
    if(n!==1)throw new Error(`Stock prompt text expected exactly once, found ${n}: ${from.slice(0,70)}`);
    return p.replace(from,()=>to);
  },prompt);
}

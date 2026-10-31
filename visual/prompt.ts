// Everything the AI reads that Visual Lab controls beyond the component definitions: groups, rules and corrections to SDK boilerplate.
// Per-component guidance lives in each component's `description`; the Zod `.describe()` text on props does not reach the prompt.
export const componentGroups=[
  {name:"Layout",components:["Stack","Grid","Divider","Spacer"],notes:[
    "- Stack is for one-dimensional layout (a column, or a row with direction \"horizontal\"). Grid is for two-dimensional layout (equal columns that wrap into rows). Do not wrap horizontal Stacks to imitate a grid.",
    "- Card is for visual grouping, not layout. Spacer is for exceptional spacing; use gap for ordinary spacing.",
  ]},
  {name:"Containers",components:["Card"]},
  {name:"Content",components:["Text","Markdown","Image","Icon"]},
  {name:"Controls",components:["Button","Input","Textarea","Checkbox"],notes:[
    "- Input needs a bare $variable as its first argument, declared with a default (e.g. $name = \"\"), so typing writes to it. Text(\"Hello, \" + $name) updates live with no request. Give each field its own variable. An expression or string literal makes a read-only field. Reset one with @Reset($name).",
    "- Textarea works like Input but is multiline: Textarea($notes, placeholder, disabled, label, rows). Use it for longer free text; use Input for short single-line values.",
    "- Checkbox needs a bare boolean $variable as its first argument, declared with a default (e.g. $agree = false): Checkbox($agree, \"I agree\"). Toggling updates Text($agree ? \"Yes\" : \"No\") live. Give each checkbox its own variable. Reset with @Reset($agree).",
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

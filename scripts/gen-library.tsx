import {mkdirSync,writeFileSync} from "node:fs";
import {createParser,type LibraryJSONSchema} from "@openuidev/lang-core";
import {openuiLibrary} from "@openuidev/react-ui/genui-lib";
import {library,promptOptions,customExamples} from "../visual/library";
import {correctStockText} from "../visual/prompt";
import {validateProgram} from "../lib/validateProgram";
const fail=(heading:string,lines:string[])=>{console.error(`\n${heading}\n${lines.map(l=>`  ${l}`).join("\n")}`);process.exit(1)};
const schema=library.toJSONSchema();
const prompt=correctStockText(library.prompt(promptOptions));
const components=Object.entries(library.components).map(([name,c])=>({name,description:(c as {description?:string}).description??""}));
// Every example must be a valid program, or it would teach the model something the validator rejects.
const parser=createParser(schema,library.root??"Stack");
const invalid=customExamples.flatMap(e=>{const v=validateProgram(parser,e.code);return v.ok?[]:[`"${e.title}"`,...v.problems.map(p=>`  - ${p}`)]});
if(invalid.length)fail("Invalid examples (generation aborted):",invalid);
// Guards against stock-library guidance returning. They look for stock component calls, not mentions in prose.
const ownNames=components.map(c=>c.name);
const stockCalls=Object.keys(openuiLibrary.components).filter(n=>!ownNames.includes(n)).filter(n=>new RegExp(`\\b${n}\\(`).test(prompt));
const problems=[
  ...stockCalls.map(n=>`prompt calls unregistered stock component ${n}(...)`),
  ...ownNames.filter(n=>!new RegExp(`^${n}\\(`,"m").test(prompt)).map(n=>`registered component ${n} has no signature in the prompt`),
  ...(/root = Stack\(\.\.\.\)/.test(prompt)?["prompt still requires Stack as the root"]:[]),
  ...(/automatically send/.test(prompt)?["prompt still says a Button without an action messages the assistant"]:[]),
  ...(/^### Other$/m.test(prompt)?["a component is missing from componentGroups"]:[]),
];
if(problems.length)fail("Generated prompt failed checks (generation aborted):",problems);
mkdirSync("generated",{recursive:true});
writeFileSync("generated/library.json",JSON.stringify({root:library.root,prompt,schema,components,groups:library.toSpec().componentGroups??[],examples:customExamples},null,2));
console.log(`Visual Lab: ${components.length} registered components, ${customExamples.length} examples validated`);

import {mkdirSync,writeFileSync} from "node:fs";
import {library,promptOptions,customExamples} from "../visual/library";
const components=Object.entries(library.components).map(([name,c])=>({name,description:(c as {description?:string}).description??""}));
mkdirSync("generated",{recursive:true});
writeFileSync("generated/library.json",JSON.stringify({root:library.root,prompt:library.prompt(promptOptions),schema:library.toJSONSchema(),components,groups:library.toSpec().componentGroups??[],examples:customExamples},null,2));
console.log(`Visual Lab: ${components.length} registered components`);

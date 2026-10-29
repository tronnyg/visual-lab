import {openuiLibrary} from "@openuidev/react-ui/genui-lib";
import {definitions,examples} from "./registry";
// Replace the stock catalog with only the components we own.
// extend() forbids add for existing names and removing the root, so names we share with the base are overridden.
const baseNames=Object.keys(openuiLibrary.components);
const ownNames=definitions.map(d=>d.name);
export const library=openuiLibrary.extend({components:{
  remove:baseNames.filter(n=>!ownNames.includes(n)) as (keyof typeof openuiLibrary.components)[],
  override:definitions.filter(d=>baseNames.includes(d.name)),
  add:definitions.filter(d=>!baseNames.includes(d.name)),
}});
export const customExamples=examples;
export const promptOptions={preamble:"Generate only OpenUI Lang. Every board contains one document rooted at Stack. Do not include markdown fences.",additionalRules:["Only use registered components.","Do not fabricate factual data; label illustrative examples."],examples:examples.map(e=>`Example — ${e.title}:\n\n${e.code}`),bindings:false,toolCalls:false};

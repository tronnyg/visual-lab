import {createLibrary} from "@openuidev/react-lang";
import {definitions,examples} from "./registry";
import {componentGroups,promptOptions as options} from "./prompt";
// Built with createLibrary rather than extending the stock openuiLibrary, so the stock component groups and their notes never reach the prompt.
// Stack stays the root component: the parser only uses it as a fallback when a program has no `root =` statement, and any component may be the root.
export const library=createLibrary({components:definitions,componentGroups,root:"Stack"});
export const customExamples=examples;
export const promptOptions={...options,examples:examples.map(e=>`Example — ${e.title}:\n\n${e.code}`)};

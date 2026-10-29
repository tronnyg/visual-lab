import { createParser, type LibraryJSONSchema } from "@openuidev/lang-core";
import data from "@/generated/library.json";

const parser = createParser(data.schema as unknown as LibraryJSONSchema, data.root ?? "Stack");

export const promptText: string = data.prompt;
export const catalogue = { components: data.components, examples: data.examples, groups: data.groups };

export interface Validation {
  ok: boolean;
  /** Problems that stop the program from showing correctly. Written so the model can fix them. */
  problems: string[];
}

/** Models like to wrap output in a code fence even when told not to. */
export function cleanCode(code: string): string {
  const m = code.match(/```(?:openui(?:-lang)?|lang)?\s*\n([\s\S]*?)```/);
  return (m ? m[1] : code).trim();
}

export function validate(code: string): Validation {
  const problems: string[] = [];
  let r;
  try {
    r = parser.parse(code);
  } catch (e) {
    return { ok: false, problems: [`The program could not be parsed: ${(e as Error).message}`] };
  }
  if (!r.root) problems.push("No `root = ...` statement was found, or it could not be built. The program must define `root = Stack([...])`.");
  for (const e of r.meta.errors) problems.push(e.message);
  if (r.meta.incomplete) problems.push("The program looks cut off (unbalanced brackets or quotes).");
  // A cut-off program leaves dangling references; the cut-off message is the useful one.
  if (!r.meta.incomplete) for (const u of r.meta.unresolved) problems.push(`\`${u}\` is used but never defined, so it renders as nothing. Define \`${u} = ...\`.`);
  for (const o of r.meta.orphaned) problems.push(`\`${o}\` is defined but never used by any parent, so it will not render. Reference it from its parent or delete it.`);
  const unique = [...new Set(problems)];
  return { ok: unique.length === 0, problems: unique };
}

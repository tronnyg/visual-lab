import { createParser, type LibraryJSONSchema } from "@openuidev/lang-core";
import data from "@/generated/library.json";
import { validateProgram, type Validation } from "./validateProgram";

export type { Validation };

const parser = createParser(data.schema as unknown as LibraryJSONSchema, data.root ?? "Stack");

export const promptText: string = data.prompt;
export const catalogue = { components: data.components, examples: data.examples, groups: data.groups };

/** Models like to wrap output in a code fence even when told not to. */
export function cleanCode(code: string): string {
  const m = code.match(/```(?:openui(?:-lang)?|lang)?\s*\n([\s\S]*?)```/);
  return (m ? m[1] : code).trim();
}

export function validate(code: string): Validation {
  return validateProgram(parser, code);
}

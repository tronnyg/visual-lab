/** Makes an arbitrary item id safe inside a DOM id (and an aria-controls/labelledby token): no spaces or punctuation, still collision-free. */
export function idPart(id: string): string {
  return id.replace(/[^A-Za-z0-9_-]/g, c => `_${c.charCodeAt(0).toString(16)}_`);
}

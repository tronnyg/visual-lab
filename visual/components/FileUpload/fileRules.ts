// Pure rules for FileUpload: which files are acceptable and how sizes are written. No DOM, so they are easy to test.

/** Whether a file matches an `accept` list the way the browser's picker reads it: `.ext`, `type/subtype` and `type/*`, comma-separated. An empty list accepts everything. */
export function matchesAccept(file: Pick<File, "name" | "type">, accept: string | undefined): boolean {
  const tokens = (accept ?? "").split(",").map(token => token.trim().toLowerCase()).filter(Boolean);
  if (!tokens.length) return true;
  const name = file.name.toLowerCase();
  const type = file.type.toLowerCase();
  return tokens.some(token =>
    token.startsWith(".") ? name.endsWith(token)
      : token.endsWith("/*") ? type.startsWith(token.slice(0, -1))
        : type === token);
}

/** Bytes as B, KB or MB (1 KB is 1024 bytes), with one decimal below 10 and none above. */
export function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  const units = ["KB", "MB", "GB"];
  let value = bytes / 1024;
  let unit = 0;
  while (value >= 1024 && unit < units.length - 1) { value /= 1024; unit++; }
  return `${value >= 10 ? Math.round(value) : Math.round(value * 10) / 10} ${units[unit]}`;
}

export const sameFile = (a: File, b: File) => a.name === b.name && a.size === b.size && a.lastModified === b.lastModified;

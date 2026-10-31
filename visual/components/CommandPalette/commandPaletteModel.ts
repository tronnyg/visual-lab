export interface CommandItem {
  /** Unique within the palette. Passed to `onSelect`. */
  id: string;
  /** The command's name; the main thing searched and shown. */
  label: string;
  /** Secondary text under the label. Searched too. */
  description?: string;
  /** Heading the command is listed under. Commands without one are listed first, with no heading. */
  group?: string;
  /** Extra words that find the command but are not shown, e.g. synonyms. */
  keywords?: readonly string[];
  /** Shown dimmed; cannot be highlighted or selected. */
  disabled?: boolean;
}

export interface CommandGroup {
  /** The heading text; "" for commands without a group. */
  label: string;
  commands: CommandItem[];
}

const normalize = (text: string): string => text.toLocaleLowerCase().trim();

/**
 * Case-insensitive search over label, description and keywords. The query is split on whitespace and every word must match somewhere
 * in the command (a substring match), so "new file" finds "Create new file". An empty query keeps every command. Order is preserved:
 * no ranking, so results are predictable.
 */
export function filterCommands(commands: readonly CommandItem[], query: string): CommandItem[] {
  const words = normalize(query).split(/\s+/).filter(Boolean);
  if (words.length === 0) return [...commands];
  return commands.filter(command => {
    const haystack = normalize([command.label, command.description ?? "", ...(command.keywords ?? [])].join("\n"));
    return words.every(word => haystack.includes(word));
  });
}

/** Groups commands under their `group`, in order of first appearance, keeping each command's relative order. */
export function groupCommands(commands: readonly CommandItem[]): CommandGroup[] {
  const groups = new Map<string, CommandItem[]>();
  for (const command of commands) {
    const key = command.group?.trim() ?? "";
    const list = groups.get(key);
    if (list) list.push(command); else groups.set(key, [command]);
  }
  return [...groups].map(([label, list]) => ({label, commands: list}));
}

/** Commands in the order they appear on screen (grouped), which is the order the keyboard moves through. */
export function flattenGroups(groups: readonly CommandGroup[]): CommandItem[] {
  return groups.flatMap(group => group.commands);
}

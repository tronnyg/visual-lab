import {useCallback, useEffect, useId, useMemo, useRef, useState} from "react";
import type {ComponentPropsWithoutRef, KeyboardEvent, Ref} from "react";
import {useControllableState} from "../../shared/useControllableState";
import {idPart} from "../../shared/idPart";
import {filterCommands, flattenGroups, groupCommands} from "./commandPaletteModel";
import type {CommandItem} from "./commandPaletteModel";

export type {CommandItem} from "./commandPaletteModel";

interface CommandPaletteOwnProps {
  /** The commands to search, in order. Ids must be unique. */
  commands: readonly CommandItem[];
  /** Whether the palette is open. Makes the component controlled. */
  open?: boolean;
  /** Whether the palette starts open when uncontrolled. Defaults to `false`. */
  defaultOpen?: boolean;
  /** Called with the new state when the user opens (shortcut) or dismisses the palette (Escape, backdrop, or choosing a command). */
  onOpenChange?: (open: boolean) => void;
  /** Called with the command's id when the user chooses an enabled command. The palette then closes. */
  onSelect?: (id: string) => void;
  /** Placeholder of the search field. Defaults to `Search commands…`. */
  placeholder?: string;
  /** Shown when nothing matches. Defaults to `No results found.` */
  emptyMessage?: string;
  /** Accessible name of the dialog. Defaults to `Command palette`. */
  label?: string;
  /** Opt in to Cmd/Ctrl+K opening the palette from anywhere on the page. Ignored while typing in a text field. Defaults to `false`. */
  shortcut?: boolean;
  ref?: Ref<HTMLDialogElement>;
}

export type CommandPaletteProps = CommandPaletteOwnProps & Omit<ComponentPropsWithoutRef<"dialog">, keyof CommandPaletteOwnProps | "children" | "open">;

// Palettes that opted in to the shortcut, in mount order. Only the first one answers it, so several palettes on a page never all open at once.
const shortcutOwners: symbol[] = [];

function isEditable(target: EventTarget | null): boolean {
  return target instanceof HTMLElement && (target.isContentEditable || /^(INPUT|TEXTAREA|SELECT)$/.test(target.tagName));
}

/**
 * A searchable list of commands in a modal dialog. It uses the native `<dialog>` opened with `showModal()`, so the browser provides the
 * focus trap, the inert page behind it, Escape handling and focus return to whatever opened it; there is no portal and nothing is
 * rendered on the server beyond the closed dialog. Focus stays in the search field (ARIA combobox with `aria-activedescendant`) while
 * Arrow Up/Down move the highlight and Enter chooses. It reports the choice through `onSelect` and does nothing else: no action
 * language, no scripts.
 */
export function CommandPalette({commands, open, defaultOpen, onOpenChange, onSelect, placeholder, emptyMessage, label, shortcut, className, ref, onClick, ...rest}: CommandPaletteProps) {
  const [isOpen, setOpen] = useControllableState<boolean>({value: open, defaultValue: defaultOpen ?? false, onChange: onOpenChange});
  const dialogRef = useRef<HTMLDialogElement | null>(null);
  const isOpenRef = useRef(isOpen);
  isOpenRef.current = isOpen;
  const setOpenRef = useRef(setOpen);
  setOpenRef.current = setOpen;

  const setDialog = useCallback((node: HTMLDialogElement | null) => {
    dialogRef.current = node;
    if (typeof ref === "function") ref(node); else if (ref) ref.current = node;
  }, [ref]);

  // The dialog follows the state: showModal() makes the page behind it inert and moves focus in; close() returns focus to the opener.
  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    if (isOpen && !dialog.open) {
      dialog.showModal();
      dialog.querySelector<HTMLInputElement>("input")?.focus();
    } else if (!isOpen && dialog.open) dialog.close();
  }, [isOpen]);

  // The opt-in Cmd/Ctrl+K shortcut: cleaned up on unmount, answered by one palette at a time, and ignored while typing in a field.
  useEffect(() => {
    if (!shortcut) return;
    const owner = Symbol("command-palette");
    shortcutOwners.push(owner);
    const onKeyDown = (event: globalThis.KeyboardEvent) => {
      if (event.key.toLowerCase() !== "k" || !(event.metaKey || event.ctrlKey) || event.altKey || event.shiftKey) return;
      if (event.defaultPrevented || event.repeat || shortcutOwners[0] !== owner || isEditable(event.target)) return;
      event.preventDefault();
      if (!isOpenRef.current) setOpenRef.current(true);
    };
    window.addEventListener("keydown", onKeyDown);
    return () => {
      window.removeEventListener("keydown", onKeyDown);
      shortcutOwners.splice(shortcutOwners.indexOf(owner), 1);
    };
  }, [shortcut]);

  return (
    <dialog
      {...rest}
      ref={setDialog}
      aria-label={rest["aria-label"] ?? label ?? "Command palette"}
      className={className ? `vl-command-palette ${className}` : "vl-command-palette"}
      // Escape: keep the state authoritative instead of letting the browser close the dialog on its own.
      onCancel={event => { event.preventDefault(); if (isOpenRef.current) setOpen(false); }}
      // The browser can also close it (for example when the page removes it); keep the state in step.
      onClose={() => { if (isOpenRef.current) setOpen(false); }}
      // A click on the dialog itself, outside its panel, is a click on the backdrop.
      onClick={event => { onClick?.(event); if (event.target === event.currentTarget) setOpen(false); }}
    >
      {isOpen && <Panel commands={commands} placeholder={placeholder} emptyMessage={emptyMessage} onChoose={id => { onSelect?.(id); setOpen(false); }} onDismiss={() => setOpen(false)} />}
    </dialog>
  );
}

function Panel({commands, placeholder, emptyMessage, onChoose, onDismiss}: {commands: readonly CommandItem[]; placeholder?: string; emptyMessage?: string; onChoose: (id: string) => void; onDismiss: () => void}) {
  const baseId = useId();
  const [query, setQuery] = useState("");
  const [highlighted, setHighlighted] = useState<string | undefined>();
  const listRef = useRef<HTMLDivElement>(null);
  const [scrollable, setScrollable] = useState(false);

  const groups = useMemo(() => groupCommands(filterCommands(commands, query)), [commands, query]);
  const flat = useMemo(() => flattenGroups(groups), [groups]);
  const enabled = useMemo(() => flat.filter(command => !command.disabled), [flat]);
  // The highlight is the command last chosen with the keyboard or pointer if it is still listed, otherwise the first enabled result, so typing always lands on a real choice.
  const activeId = enabled.find(command => command.id === highlighted)?.id ?? enabled[0]?.id;
  const optionId = (id: string) => `${baseId}-option-${idPart(id)}`;

  // Only a list that actually scrolls becomes a tab stop, so the keyboard can scroll it (WCAG 2.1.1) without a pointless stop on short lists.
  // The observer also catches the moment the dialog is first shown: the panel mounts a moment before showModal(), while it has no size.
  useEffect(() => {
    const el = listRef.current;
    if (!el) return;
    const measure = () => setScrollable(el.scrollHeight > el.clientHeight);
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(el);
    return () => observer.disconnect();
  }, [groups]);
  useEffect(() => {
    if (activeId === undefined) return;
    listRef.current?.querySelector(`#${CSS.escape(optionId(activeId))}`)?.scrollIntoView({block: "nearest"});
  }, [activeId]);

  function onKeyDown(event: KeyboardEvent<HTMLInputElement>) {
    if (event.nativeEvent.isComposing) return;
    // The browser's own Escape handling (the dialog's cancel event) covers focus elsewhere in the dialog; this makes the search field explicit.
    if (event.key === "Escape") { event.preventDefault(); onDismiss(); return; }
    const index = enabled.findIndex(command => command.id === activeId);
    if (event.key === "ArrowDown" || event.key === "ArrowUp") {
      event.preventDefault();
      if (!enabled.length) return;
      const step = event.key === "ArrowDown" ? 1 : -1;
      setHighlighted(enabled[(index + step + enabled.length) % enabled.length].id);
    } else if (event.key === "Enter" && activeId !== undefined) {
      event.preventDefault();
      onChoose(activeId);
    }
  }

  const hasResults = flat.length > 0;
  const listId = `${baseId}-list`;
  return (
    <div className="vl-command-palette__panel">
      <div className="vl-command-palette__search">
        <span className="vl-command-palette__icon" aria-hidden="true" />
        <input
          className="vl-command-palette__input"
          type="text"
          role="combobox"
          aria-label="Search commands"
          aria-autocomplete="list"
          aria-expanded={hasResults}
          aria-controls={hasResults ? listId : undefined}
          aria-activedescendant={activeId === undefined ? undefined : optionId(activeId)}
          autoComplete="off"
          autoCorrect="off"
          spellCheck={false}
          placeholder={placeholder ?? "Search commands…"}
          value={query}
          onChange={event => { setQuery(event.target.value); setHighlighted(undefined); }}
          onKeyDown={onKeyDown}
        />
      </div>
      <div className="vl-command-palette__results" ref={listRef} tabIndex={scrollable ? 0 : undefined}>
        {hasResults && (
          <div id={listId} role="listbox" aria-label="Commands" className="vl-command-palette__list">
            {groups.map((group, index) => {
              const headingId = `${baseId}-group-${index}`;
              return (
                <div key={group.label || "none"} role="group" aria-labelledby={group.label ? headingId : undefined} className="vl-command-palette__group">
                  {group.label && <div id={headingId} role="presentation" className="vl-command-palette__heading">{group.label}</div>}
                  {group.commands.map(command => (
                    <div
                      key={command.id}
                      id={optionId(command.id)}
                      role="option"
                      aria-selected={command.id === activeId}
                      aria-disabled={command.disabled ? true : undefined}
                      className="vl-command-palette__option"
                      onMouseMove={() => { if (!command.disabled && command.id !== activeId) setHighlighted(command.id); }}
                      onClick={() => { if (!command.disabled) onChoose(command.id); }}
                    >
                      <span className="vl-command-palette__label">{command.label}</span>
                      {command.description && <span className="vl-command-palette__description">{command.description}</span>}
                    </div>
                  ))}
                </div>
              );
            })}
          </div>
        )}
        {/* One live region: the visible message when nothing matches, otherwise a screen-reader-only result count. */}
        <p className="vl-command-palette__status" role="status" data-empty={hasResults ? undefined : "true"}>
          {hasResults ? `${flat.length} ${flat.length === 1 ? "result" : "results"}` : emptyMessage ?? "No results found."}
        </p>
      </div>
      <div className="vl-command-palette__hint" aria-hidden="true">
        <span><kbd>↑</kbd><kbd>↓</kbd> navigate</span>
        <span><kbd>↵</kbd> select</span>
        <span><kbd>esc</kbd> close</span>
      </div>
    </div>
  );
}

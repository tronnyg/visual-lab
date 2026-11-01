import {useId, useLayoutEffect, useRef, useState} from "react";
import type {ChangeEvent, ComponentPropsWithoutRef, Ref} from "react";
import {useFormReset} from "../../shared/useFormReset";
import {Icon} from "../Icon/Icon";
import {formatBytes, matchesAccept, sameFile} from "./fileRules";

interface FileUploadOwnProps {
  /** Allowed files, as in the native `accept` attribute: `.pdf`, `image/png`, `image/*`, comma-separated. Files that do not match are rejected with a message. */
  accept?: string;
  /** Lets more than one file be chosen. Each choice then adds to the list. Without it a new valid choice replaces the file. */
  multiple?: boolean;
  /** The most files that can be selected at once (with `multiple`). Extra files are rejected with a message. */
  maxFiles?: number;
  /** The largest allowed file, in **bytes** (`2 * 1024 * 1024` is 2 MB). Larger files are rejected with a message. */
  maxSize?: number;
  /** Called with the accepted files, as `File` objects owned by the browser, when the user adds or removes one. Never on first render. Nothing is uploaded. */
  onFilesChange?: (files: File[]) => void;
  /** Text of the browse button. Defaults to `Choose file` or `Choose files`. */
  label?: string;
  ref?: Ref<HTMLInputElement>;
}

export type FileUploadProps = FileUploadOwnProps & Omit<ComponentPropsWithoutRef<"input">, keyof FileUploadOwnProps | "type" | "value" | "defaultValue" | "children" | "onChange" | "checked" | "defaultChecked" | "min" | "max">;

/**
 * Chooses files in the browser and reports them. It does not upload anything and has no server: the files stay `File` objects held by the
 * browser (never read, serialised or copied here), and the consumer decides what to do with them in `onFilesChange`.
 *
 * It is a native `<input type="file">`, visually hidden but focusable, with a styled label as the browse button, so the picker, Tab,
 * Enter and Space, `required`, `name` and `disabled` all come from the browser. Accepted files are mirrored back into the input's own file
 * list through a `DataTransfer`, so they are what a surrounding form submits: removing a file removes it from the `FormData`, and a
 * rejected file never reaches it. (A browser without the `DataTransfer` constructor keeps the browser's own list instead, which may then differ from the one shown.)
 * Rejections are listed in a polite live region and stay until the next choice. Drag and drop is not part of this component.
 */
export function FileUpload({
  accept, multiple = false, maxFiles, maxSize, onFilesChange, label, className, style, id, disabled, required, name, onFocus, onBlur, ref, ...rest
}: FileUploadProps) {
  const generatedId = useId();
  const inputId = id ?? generatedId;
  const hintId = `${generatedId}-hint`;
  const errorId = `${generatedId}-errors`;
  const [files, setFiles] = useState<File[]>([]);
  const [problems, setProblems] = useState<string[]>([]);
  const inputRef = useRef<HTMLInputElement | null>(null);
  const listRef = useRef<HTMLUListElement | null>(null);
  const refocus = useRef<number | null>(null);
  const limit = multiple ? maxFiles : 1;

  // Mirrors the accepted files into the input, which is what a form reads. Setting `files` fires no event.
  function mirror(next: File[]) {
    const input = inputRef.current;
    if (!input) return;
    try {
      const transfer = new DataTransfer();
      next.forEach(file => transfer.items.add(file));
      input.files = transfer.files;
    } catch {
      // No DataTransfer constructor: the browser's own list stays.
    }
  }

  function apply(next: File[], nextProblems: string[]) {
    mirror(next);
    setProblems(nextProblems);
    if (next.length !== files.length || next.some((file, index) => file !== files[index])) {
      setFiles(next);
      onFilesChange?.(next);
    }
  }

  function onInputChange(event: ChangeEvent<HTMLInputElement>) {
    const picked = Array.from(event.target.files ?? []);
    // Cancelling the picker clears the input in some browsers; the list shown stays as it was.
    if (!picked.length) { mirror(files); return; }
    const found: string[] = [];
    const valid = picked.filter(file => {
      if (!matchesAccept(file, accept)) { found.push(`${file.name}: file type is not accepted`); return false; }
      if (maxSize !== undefined && file.size > maxSize) { found.push(`${file.name}: larger than ${formatBytes(maxSize)}`); return false; }
      return true;
    });
    let next = multiple ? [...files, ...valid.filter(file => !files.some(existing => sameFile(existing, file)))] : valid.length ? [valid[0]] : files;
    if (limit !== undefined && next.length > limit) {
      const dropped = next.length - limit;
      found.push(`Only ${limit} ${limit === 1 ? "file is" : "files are"} allowed: ${dropped} ${dropped === 1 ? "file was" : "files were"} not added`);
      next = next.slice(0, limit);
    }
    apply(next, found);
  }

  function remove(index: number) {
    refocus.current = index;
    apply(files.filter((_, i) => i !== index), []);
  }

  // After a removal, focus goes to the next file's remove button, or the previous one, or the browse input when the list is empty.
  useLayoutEffect(() => {
    if (refocus.current === null) return;
    const buttons = listRef.current?.querySelectorAll<HTMLButtonElement>("button") ?? [];
    (buttons[Math.min(refocus.current, buttons.length - 1)] ?? inputRef.current)?.focus();
    refocus.current = null;
  }, [files]);

  useFormReset(inputRef, () => { setFiles([]); setProblems([]); });

  const hints = [
    accept?.trim() && `Accepted: ${accept.split(",").map(token => token.trim()).filter(Boolean).join(", ")}`,
    maxSize !== undefined && `Up to ${formatBytes(maxSize)}${multiple ? " each" : ""}`,
    multiple && maxFiles !== undefined && `Up to ${maxFiles} ${maxFiles === 1 ? "file" : "files"}`,
  ].filter(Boolean) as string[];
  const describedby = [rest["aria-describedby"], hints.length ? hintId : undefined, problems.length ? errorId : undefined].filter(Boolean).join(" ") || undefined;

  return (
    <div className={className ? `vl-fileupload ${className}` : "vl-fileupload"} style={style} data-disabled={disabled || undefined}>
      <input
        {...rest}
        ref={node => { inputRef.current = node; if (typeof ref === "function") ref(node); else if (ref) ref.current = node; }}
        id={inputId}
        type="file"
        name={name}
        className="vl-fileupload__input"
        accept={accept}
        multiple={multiple}
        disabled={disabled}
        required={required}
        aria-describedby={describedby}
        aria-invalid={rest["aria-invalid"] ?? (problems.length ? true : undefined)}
        onChange={onInputChange}
        onFocus={onFocus}
        onBlur={onBlur}
      />
      <label htmlFor={inputId} className="vl-fileupload__button">
        <Icon name="upload" size="sm" />
        {label?.trim() || (multiple ? "Choose files" : "Choose file")}
      </label>
      {hints.length > 0 && <p id={hintId} className="vl-fileupload__hint">{hints.join(" · ")}</p>}
      {files.length > 0 && (
        <ul ref={listRef} className="vl-fileupload__list" aria-label="Selected files">
          {files.map((file, index) => (
            <li key={`${file.name}-${file.size}-${file.lastModified}-${index}`} className="vl-fileupload__file">
              <Icon name="file" size="sm" />
              <span className="vl-fileupload__name">{file.name}</span>
              <span className="vl-fileupload__size">{formatBytes(file.size)}</span>
              <button type="button" className="vl-fileupload__remove" disabled={disabled} aria-label={`Remove ${file.name}`} onClick={() => remove(index)}>
                <Icon name="x" size="sm" />
              </button>
            </li>
          ))}
        </ul>
      )}
      {/* Always present so its id and live region are stable; messages are announced when they appear. */}
      <div id={errorId} className="vl-fileupload__problems" aria-live="polite">
        {problems.length > 0 && (
          <ul>
            {problems.map(problem => <li key={problem}><Icon name="alert-circle" size="sm" /><span><span className="vl-fileupload__sr">Error: </span>{problem}</span></li>)}
          </ul>
        )}
      </div>
    </div>
  );
}

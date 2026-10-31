import {useState, type ComponentPropsWithoutRef, type CSSProperties, type Ref} from "react";
import {Button} from "../Button/Button";
import {Icon} from "../Icon/Icon";

type CopyStatus = "idle" | "copied" | "failed";

interface CodeBlockOwnProps {
  /** The source text, shown exactly as given: indentation, blank lines and long lines are preserved. */
  code: string;
  /** Descriptive label shown in the header, e.g. `typescript`. It is metadata only: no syntax highlighting is applied. */
  language?: string;
  /** Number each line in a gutter. The numbers are not selected or copied. */
  showLineNumbers?: boolean;
  /** Show a copy-to-clipboard button. */
  copyable?: boolean;
  /** Wrap long lines. When off (the default) they scroll sideways. */
  wrap?: boolean;
  ref?: Ref<HTMLDivElement>;
}

export type CodeBlockProps = CodeBlockOwnProps & Omit<ComponentPropsWithoutRef<"div">, keyof CodeBlockOwnProps | "children">;

const copyLabels: Record<CopyStatus, string> = {idle: "Copy", copied: "Copied", failed: "Copy failed"};
const copyAnnouncements: Record<CopyStatus, string> = {idle: "", copied: "Code copied to clipboard", failed: "Could not copy the code"};

/** A read-only code viewer on native `pre` and `code`. It does not highlight syntax and never changes the code. */
export function CodeBlock({code, language, showLineNumbers = false, copyable = false, wrap = false, className, ...rest}: CodeBlockProps) {
  const [status, setStatus] = useState<CopyStatus>("idle");
  const name = language?.trim();
  const lines = code.replace(/\r\n?/g, "\n").split("\n");
  // A final newline ends the last line; it does not start another.
  if (lines.length > 1 && lines[lines.length - 1] === "") lines.pop();

  // Clipboard access can be missing (insecure context) or refused (permissions), so every failure becomes a visible, announced state.
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(code);
      setStatus("copied");
    } catch {
      setStatus("failed");
    }
  };

  return (
    <div
      {...rest}
      className={className ? `vl-codeblock ${className}` : "vl-codeblock"}
      data-wrap={wrap || undefined}
      data-line-numbers={showLineNumbers || undefined}
    >
      {name || copyable ? (
        <div className="vl-codeblock__header">
          <span className="vl-codeblock__language">{name}</span>
          {copyable ? (
            <Button
              variant="ghost"
              size="xs"
              leadingIcon={<Icon name={status === "copied" ? "check" : "copy"} size="xs" />}
              onClick={copy}
              onBlur={() => setStatus("idle")}
              onMouseLeave={() => setStatus("idle")}
            >
              {copyLabels[status]}
            </Button>
          ) : null}
        </div>
      ) : null}
      <div className="vl-codeblock__scroll" role="region" tabIndex={0} aria-label={name ? `${name} code` : "Code"}>
        <pre className="vl-codeblock__pre" style={{"--vl-codeblock-digits": String(lines.length).length} as CSSProperties}>
          <code {...(name ? {"data-language": name} : {})}>
            {lines.map((line, i) => <span key={i} className="vl-codeblock__line">{line}</span>)}
          </code>
        </pre>
      </div>
      <span className="vl-codeblock__sr" role="status">{copyAnnouncements[status]}</span>
    </div>
  );
}

import type {ComponentPropsWithoutRef} from "react";
import ReactMarkdown, {defaultUrlTransform, type Components, type UrlTransform} from "react-markdown";
import remarkGfm from "remark-gfm";
import {Text, type TextElement, type TextPreset, type TextTone, type TextWeight} from "../Text/Text";

export interface MarkdownProps extends Omit<ComponentPropsWithoutRef<"div">, "children"> {
  /** Markdown source (CommonMark plus GitHub Flavored Markdown). Treated as untrusted: raw HTML is never rendered. */
  source: string;
}

// Links may only go to the web, a mail or phone app, or an anchor on the page. Relative paths are refused because
// they would resolve against the Visual Lab host and navigate away from the board.
const safeLink = /^(https?:|mailto:|tel:|#)/i;
// Images must be absolute http(s) URLs. Boards have no asset directory to resolve relative paths against.
const safeImage = /^https?:\/\//i;

// defaultUrlTransform already refuses javascript:, data:, vbscript: and other schemes (it returns ""); the patterns above narrow what remains.
const urlTransform: UrlTransform = (url, _key, node) => {
  const safe = defaultUrlTransform(url);
  return (node.tagName === "img" ? safeImage : safeLink).test(safe) ? safe : "";
};

type MdProps<T extends keyof React.JSX.IntrinsicElements> = ComponentPropsWithoutRef<T> & {node?: unknown};

// Headings and paragraphs are rendered with Text so they share its presets (size, weight, line height) and cannot drift from it.
// h4-h6 have no larger preset of their own, so they step down through weights and the label preset.
function heading(as: Exclude<TextElement, "label">, extra: {preset?: TextPreset; weight?: TextWeight; tone?: TextTone}) {
  return function Heading({node: _node, ...props}: MdProps<"h1">) {
    return <Text {...(props as object)} as={as} {...extra} />;
  };
}

function Paragraph({node: _node, ...props}: MdProps<"p">) {
  return <Text {...(props as object)} />;
}

function Link({node: _node, href, ...props}: MdProps<"a">) {
  // Absolute links leave the board, so open them in a new tab without handing over window.opener or the referrer.
  const external = href !== undefined && /^https?:/i.test(href);
  return <a {...props} href={href || undefined} {...(external ? {target: "_blank", rel: "noopener noreferrer"} : {})} />;
}

function Image({node: _node, src, alt}: MdProps<"img">) {
  // A refused URL arrives as an empty src: show the description instead of a broken image.
  if (typeof src !== "string" || !src) return alt ? <span className="vl-markdown__no-image">{alt}</span> : null;
  return <img src={src} alt={alt ?? ""} loading="lazy" decoding="async" referrerPolicy="no-referrer" />;
}

// A wrapper lets wide tables scroll sideways instead of stretching the board.
function Table({node: _node, ...props}: MdProps<"table">) {
  return (
    <div className="vl-markdown__table" tabIndex={0} role="region" aria-label="Table">
      <table {...props} />
    </div>
  );
}

// GFM task-list checkboxes are display-only.
function Input({node: _node, ...props}: MdProps<"input">) {
  return <input {...props} type="checkbox" disabled readOnly />;
}

const components: Components = {
  h1: heading("h1", {preset: "title"}),
  h2: heading("h2", {preset: "heading"}),
  h3: heading("h3", {preset: "subheading"}),
  h4: heading("h4", {weight: "semibold"}),
  h5: heading("h5", {preset: "label", weight: "semibold"}),
  h6: heading("h6", {preset: "label", tone: "muted"}),
  p: Paragraph,
  a: Link,
  img: Image,
  table: Table,
  input: Input,
};

const plugins = [remarkGfm];

/** Renders a Markdown string as styled, semantic HTML. Stateless; raw HTML in the source is ignored. */
export function Markdown({source, className, ...rest}: MarkdownProps) {
  return (
    <div {...rest} className={className ? `vl-markdown ${className}` : "vl-markdown"}>
      <ReactMarkdown remarkPlugins={plugins} components={components} urlTransform={urlTransform}>
        {source}
      </ReactMarkdown>
    </div>
  );
}

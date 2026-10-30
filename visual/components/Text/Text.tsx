import type {ComponentPropsWithoutRef, ComponentType, Ref} from "react";

export const textElements = ["h1", "h2", "h3", "h4", "h5", "h6", "p", "span", "strong", "em", "label"] as const;
// Presets bundle size, weight, line height and spacing. The first three are the original Text sizes.
export const textPresets = ["body", "title", "heading", "subheading", "label", "caption", "overline", "code"] as const;
export const textSizes = ["xs", "sm", "md", "lg", "xl", "2xl", "3xl", "4xl"] as const;
export const textWeights = ["regular", "medium", "semibold", "bold"] as const;
export const textLineHeights = ["none", "tight", "snug", "normal", "relaxed"] as const;
export const textTones = ["default", "muted", "accent", "danger"] as const;
export const textAligns = ["start", "center", "end", "justify"] as const;
export const textWraps = ["wrap", "nowrap", "balance", "pretty"] as const;
export const textLineClamps = [1, 2, 3, 4, 5, 6] as const;

export type TextElement = (typeof textElements)[number];
export type TextPreset = (typeof textPresets)[number];
export type TextSize = (typeof textSizes)[number];
export type TextWeight = (typeof textWeights)[number];
export type TextLineHeight = (typeof textLineHeights)[number];
export type TextTone = (typeof textTones)[number];
export type TextAlign = (typeof textAligns)[number];
export type TextWrap = (typeof textWraps)[number];
export type TextLineClamp = (typeof textLineClamps)[number];

interface TextOwnProps {
  /** Semantic element. Independent of appearance: `as="h1"` without a `preset` still looks like body text. Defaults to `p`. */
  as?: TextElement;
  /** Visual preset. Defaults to `body`. */
  preset?: TextPreset;
  /** Font size from the named scale; overrides the preset's size. */
  size?: TextSize;
  /** Font weight; overrides the preset's weight. */
  weight?: TextWeight;
  /** Line height; overrides the preset's line height. */
  lineHeight?: TextLineHeight;
  /** Semantic colour. Defaults to `default`. */
  tone?: TextTone;
  align?: TextAlign;
  italic?: boolean;
  underline?: boolean;
  strikethrough?: boolean;
  /** Marker-style background behind the text. */
  highlight?: boolean;
  /** Line wrapping. `nowrap` never wraps; `balance` and `pretty` improve the rag of wrapped lines. Defaults to `wrap`. */
  wrap?: TextWrap;
  /** Keep spaces and line breaks in the content (still wraps unless `wrap="nowrap"`). */
  preserveWhitespace?: boolean;
  /** Single line with an ellipsis where it overflows. Makes the element block-level. */
  truncate?: boolean;
  /** Limit to this many lines with an ellipsis. Takes precedence over `truncate`. */
  lineClamp?: TextLineClamp;
  ref?: Ref<HTMLElement>;
}

// htmlFor only makes sense on a label.
type TextElementProps =
  | {as: "label"; htmlFor?: string}
  | {as?: Exclude<TextElement, "label">; htmlFor?: never};

export type TextProps = TextOwnProps & TextElementProps & Omit<ComponentPropsWithoutRef<"p">, keyof TextOwnProps>;

export function Text({
  as,
  preset,
  size,
  weight,
  lineHeight,
  tone,
  align,
  italic,
  underline,
  strikethrough,
  highlight,
  wrap,
  preserveWhitespace,
  truncate,
  lineClamp,
  className,
  children,
  ...rest
}: TextProps) {
  // The tag name is chosen at runtime, so type it as one component accepting the shared props rather than a union of tags.
  const Element = (as ?? "p") as unknown as ComponentType<ComponentPropsWithoutRef<"p"> & {ref?: Ref<HTMLElement>; htmlFor?: string}>;
  return (
    <Element
      {...rest}
      className={className ? `vl-text ${className}` : "vl-text"}
      data-preset={preset ?? "body"}
      data-tone={tone ?? "default"}
      data-size={size}
      data-weight={weight}
      data-line-height={lineHeight}
      data-align={align}
      data-italic={italic || undefined}
      data-underline={underline || undefined}
      data-strikethrough={strikethrough || undefined}
      data-highlight={highlight || undefined}
      data-wrap={wrap}
      data-preserve-whitespace={preserveWhitespace || undefined}
      data-truncate={truncate || undefined}
      data-line-clamp={lineClamp}
    >
      {children}
    </Element>
  );
}

import type {ComponentPropsWithoutRef, Ref} from "react";

export const stackDirections = ["vertical", "horizontal"] as const;
// Spacing steps map to the --ui-space-* tokens. sm, md and lg are the original Stack gaps.
export const stackSpacings = ["none", "xs", "sm", "md", "lg"] as const;
export const stackAligns = ["start", "center", "end", "stretch", "baseline"] as const;
export const stackJustifies = ["start", "center", "end", "between", "around", "evenly"] as const;
export const stackWidths = ["auto", "full", "sm", "md", "lg"] as const;
export const stackFlexes = ["grow", "shrink", "none"] as const;

export type StackDirection = (typeof stackDirections)[number];
export type StackSpacing = (typeof stackSpacings)[number];
export type StackAlign = (typeof stackAligns)[number];
export type StackJustify = (typeof stackJustifies)[number];
export type StackWidth = (typeof stackWidths)[number];
export type StackFlex = (typeof stackFlexes)[number];

interface StackOwnProps {
  /** Main axis. `vertical` stacks children in a column. Defaults to `vertical`. */
  direction?: StackDirection;
  /** Space between children. Defaults to `md`. */
  gap?: StackSpacing;
  /** Cross-axis alignment of children. Defaults to `stretch`. */
  align?: StackAlign;
  /** Distribution of children along the main axis. Defaults to `start`. */
  justify?: StackJustify;
  /** Let children wrap onto further lines when they do not fit. Defaults to `false`. */
  wrap?: boolean;
  /** Space between the Stack's edge and its children. Defaults to `none`. */
  padding?: StackSpacing;
  /** `auto` sizes to the parent's layout, `full` fills the parent's width, `sm`/`md`/`lg` fill it up to a maximum width. Defaults to `auto`. */
  width?: StackWidth;
  /** How the Stack behaves as a flex child: `grow` shares spare space, `shrink` may get smaller than its content, `none` keeps its size. Unset leaves the browser default. */
  flex?: StackFlex;
  ref?: Ref<HTMLDivElement>;
}

export type StackProps = StackOwnProps & Omit<ComponentPropsWithoutRef<"div">, keyof StackOwnProps>;

/** Layout only: arranges its children with Flexbox and draws nothing itself. */
export function Stack({direction, gap, align, justify, wrap, padding, width, flex, className, children, ...rest}: StackProps) {
  return (
    <div
      {...rest}
      className={className ? `vl-stack ${className}` : "vl-stack"}
      data-direction={direction ?? "vertical"}
      data-gap={gap ?? "md"}
      data-align={align}
      data-justify={justify}
      data-wrap={wrap || undefined}
      data-padding={padding}
      data-width={width}
      data-flex={flex}
    >
      {children}
    </div>
  );
}

import type {ComponentPropsWithoutRef, Ref} from "react";

export const dividerOrientations = ["horizontal", "vertical"] as const;
export const dividerTones = ["subtle", "default", "strong"] as const;
// Spacing steps map to the --ui-space-* tokens, the same scale Stack and Card use.
export const dividerSpacings = ["none", "xs", "sm", "md", "lg"] as const;

export type DividerOrientation = (typeof dividerOrientations)[number];
export type DividerTone = (typeof dividerTones)[number];
export type DividerSpacing = (typeof dividerSpacings)[number];

interface DividerOwnProps {
  /** `horizontal` fills the available width, `vertical` fills the height of a suitably sized parent. Defaults to `horizontal`. */
  orientation?: DividerOrientation;
  /** Line strength: `subtle`, `default` or `strong`. Defaults to `subtle`. */
  tone?: DividerTone;
  /** Margin on both sides of the line (not its thickness). Defaults to `sm`. */
  spacing?: DividerSpacing;
  /** Decorative dividers are hidden from assistive technology. Set to `false` to expose a `separator` role. Defaults to `true`. */
  decorative?: boolean;
  ref?: Ref<HTMLDivElement>;
}

export type DividerProps = DividerOwnProps & Omit<ComponentPropsWithoutRef<"div">, keyof DividerOwnProps | "children">;

/** A one-pixel line that separates sections of content. No state, events or interaction. */
export function Divider({orientation = "horizontal", tone = "subtle", spacing = "sm", decorative = true, className, ...rest}: DividerProps) {
  return (
    <div
      {...rest}
      className={className ? `vl-divider ${className}` : "vl-divider"}
      data-orientation={orientation}
      data-tone={tone}
      data-spacing={spacing}
      {...(decorative ? {"aria-hidden": true} : {role: "separator", "aria-orientation": orientation})}
    />
  );
}

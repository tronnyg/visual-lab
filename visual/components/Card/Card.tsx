import type {ComponentPropsWithoutRef, Ref} from "react";

export const cardVariants = ["default", "outline", "filled", "subtle"] as const;
// Spacing steps map to the --ui-space-* tokens, the same scale Stack uses.
export const cardSpacings = ["none", "xs", "sm", "md", "lg"] as const;
export const cardRadii = ["none", "sm", "md", "lg"] as const;
export const cardShadows = ["none", "sm", "md"] as const;
export const cardBackgrounds = ["canvas", "surface", "muted", "accent"] as const;
export const cardWidths = ["auto", "full", "sm", "md", "lg"] as const;

export type CardVariant = (typeof cardVariants)[number];
export type CardSpacing = (typeof cardSpacings)[number];
export type CardRadius = (typeof cardRadii)[number];
export type CardShadow = (typeof cardShadows)[number];
export type CardBackground = (typeof cardBackgrounds)[number];
export type CardWidth = (typeof cardWidths)[number];

interface CardOwnProps {
  /** Overall look: `default` surface with border, `outline` border only, `filled` muted fill, `subtle` faint fill with border. Defaults to `default`. */
  variant?: CardVariant;
  /** Space between the Card's edge and its children. Defaults to `md`. */
  padding?: CardSpacing;
  /** Space between children, which are stacked vertically. Defaults to `md`. */
  gap?: CardSpacing;
  /** Corner rounding. Defaults to `md`. */
  radius?: CardRadius;
  /** Elevation. Unset means none. */
  shadow?: CardShadow;
  /** Surface colour; overrides the variant's own background. */
  background?: CardBackground;
  /** Show or hide the border; overrides the variant's own choice. */
  border?: boolean;
  /** `auto` sizes to the parent's layout, `full` fills the parent's width, `sm`/`md`/`lg` fill it up to a maximum width. Defaults to `auto`. */
  width?: CardWidth;
  ref?: Ref<HTMLDivElement>;
}

export type CardProps = CardOwnProps & Omit<ComponentPropsWithoutRef<"div">, keyof CardOwnProps>;

/** Visual grouping only: a padded, optionally bordered surface that stacks its children vertically. */
export function Card({variant, padding, gap, radius, shadow, background, border, width, className, children, ...rest}: CardProps) {
  return (
    <div
      {...rest}
      className={className ? `vl-card ${className}` : "vl-card"}
      data-variant={variant ?? "default"}
      data-padding={padding ?? "md"}
      data-gap={gap ?? "md"}
      data-radius={radius ?? "md"}
      data-shadow={shadow}
      data-background={background}
      data-border={border === undefined ? undefined : String(border)}
      data-width={width}
    >
      {children}
    </div>
  );
}

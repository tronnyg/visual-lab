import type {ComponentPropsWithoutRef, Ref} from "react";

export const badgeVariants = ["default", "secondary", "outline", "success", "warning", "danger"] as const;

export type BadgeVariant = (typeof badgeVariants)[number];

interface BadgeOwnProps {
  /** Visual style. Defaults to `default`. */
  variant?: BadgeVariant;
  ref?: Ref<HTMLSpanElement>;
}

export type BadgeProps = BadgeOwnProps & Omit<ComponentPropsWithoutRef<"span">, keyof BadgeOwnProps>;

/** A compact, non-interactive label for a category or status. Colour is never the only signal: the text always states the meaning. */
export function Badge({variant = "default", className, children, ...rest}: BadgeProps) {
  return (
    <span {...rest} className={className ? `vl-badge ${className}` : "vl-badge"} data-variant={variant}>
      {children}
    </span>
  );
}

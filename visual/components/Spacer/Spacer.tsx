import type {ComponentPropsWithoutRef, Ref} from "react";

// Fixed sizes match Stack's spacing scale (xs, sm, md, lg) plus xl; `grow` takes whatever room is left.
export const spacerSizes = ["xs", "sm", "md", "lg", "xl", "grow"] as const;

export type SpacerSize = (typeof spacerSizes)[number];

interface SpacerOwnProps {
  /** Fixed space (`xs` 4px, `sm` 8px, `md` 16px, `lg` 24px, `xl` 48px) or `grow` to fill the remaining room. Defaults to `md`. */
  size?: SpacerSize;
  ref?: Ref<HTMLDivElement>;
}

export type SpacerProps = SpacerOwnProps & Omit<ComponentPropsWithoutRef<"div">, keyof SpacerOwnProps | "children">;

/** Intentional empty space along the main axis of a Stack or Card. Adds to the parent's gap rather than replacing it. Draws nothing. */
export function Spacer({size = "md", className, ...rest}: SpacerProps) {
  return <div {...rest} className={className ? `vl-spacer ${className}` : "vl-spacer"} data-size={size} aria-hidden="true" />;
}

import type {ComponentPropsWithoutRef, CSSProperties, Ref} from "react";

export const skeletonVariants = ["text", "rectangle", "circle"] as const;
export type SkeletonVariant = (typeof skeletonVariants)[number];

interface SkeletonOwnProps {
  /** `text` is one or more lines, `rectangle` a block (an image or card area), `circle` an avatar. Defaults to `text`. */
  variant?: SkeletonVariant;
  /** A number is pixels; a string is any CSS length (`"60%"`, `"12rem"`). Defaults to the full width, or 40px for a circle. */
  width?: string | number;
  /** Same units as `width`. Defaults to 14px (one line of text, for `text` the height of each line), 96px for a rectangle, and the width for a circle. */
  height?: string | number;
  /** Number of text lines (1 to 20). The last of several lines is shorter. Only for `text`. Defaults to `1`. */
  lines?: number;
  /** A subtle pulse while loading. It is off when the user prefers reduced motion. Defaults to `true`. */
  animated?: boolean;
  ref?: Ref<HTMLDivElement>;
}

export type SkeletonProps = SkeletonOwnProps & Omit<ComponentPropsWithoutRef<"div">, keyof SkeletonOwnProps | "children">;

const size = (value: string | number | undefined) => (typeof value === "number" ? `${value}px` : value);

/**
 * A decorative loading placeholder. It is hidden from assistive technology (`aria-hidden`) and shows no text, so it can never be mistaken
 * for real content. It says nothing about loading, so the container that is loading should: for example `aria-busy="true"` on it, or a
 * visible or live "Loading…" message. Compose several in a Stack, Grid or Card to sketch a layout.
 */
export function Skeleton({variant = "text", width, height, lines, animated = true, className, style, ref, ...rest}: SkeletonProps) {
  const count = variant === "text" ? Math.min(20, Math.max(1, Math.floor(lines ?? 1) || 1)) : 1;
  const circle = variant === "circle" ? size(width ?? height ?? 40) : undefined;
  // For text, `height` is the height of each line; for the other shapes it is the height of the shape.
  const styles: CSSProperties & Record<`--${string}`, string | undefined> = {
    width: circle ?? size(width),
    height: variant === "text" ? undefined : circle ?? size(height),
    "--vl-skeleton-line": variant === "text" ? size(height) : undefined,
    ...style,
  };
  return (
    <div
      {...rest}
      ref={ref}
      aria-hidden="true"
      className={className ? `vl-skeleton ${className}` : "vl-skeleton"}
      data-variant={variant}
      data-animated={animated ? "true" : undefined}
      style={styles}
    >
      {variant === "text" && Array.from({length: count}, (_, index) => <span key={index} className="vl-skeleton__line" data-last={count > 1 && index === count - 1 ? "true" : undefined} />)}
    </div>
  );
}

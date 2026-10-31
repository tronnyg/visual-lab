import type {ComponentPropsWithoutRef, Ref} from "react";

export const spinnerSizes = ["sm", "md", "lg"] as const;

export type SpinnerSize = (typeof spinnerSizes)[number];

interface SpinnerOwnProps {
  /** sm 16px, md 24px, lg 32px. Defaults to `md`. */
  size?: SpinnerSize;
  /** Accessible loading message, e.g. "Loading results". It is not displayed. Without it the spinner is decorative and hidden from assistive technology. */
  label?: string;
  ref?: Ref<HTMLSpanElement>;
}

export type SpinnerProps = SpinnerOwnProps & Omit<ComponentPropsWithoutRef<"span">, keyof SpinnerOwnProps | "children">;

/** An indeterminate loading indicator. Purely presentational: it does not know or manage any loading state. */
export function Spinner({size = "md", label, className, ...rest}: SpinnerProps) {
  const name = label?.trim();
  return (
    <span
      {...rest}
      className={className ? `vl-spinner ${className}` : "vl-spinner"}
      data-size={size}
      {...(name ? {role: "status"} : {"aria-hidden": true})}
    >
      {name ? <span className="vl-spinner__label">{name}</span> : null}
    </span>
  );
}

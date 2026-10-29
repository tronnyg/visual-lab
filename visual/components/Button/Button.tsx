import type {ComponentPropsWithRef, MouseEvent, ReactNode} from "react";

export const buttonVariants = ["primary", "secondary", "outline", "ghost", "destructive", "link"] as const;
export const buttonSizes = ["xs", "sm", "default", "lg"] as const;
export type ButtonVariant = (typeof buttonVariants)[number];
export type ButtonSize = (typeof buttonSizes)[number];

interface ButtonOwnProps {
  /** Visual emphasis. Defaults to `primary`. */
  variant?: ButtonVariant;
  /** Height, padding, type and icon scale. Defaults to `default`. */
  size?: ButtonSize;
  /** Shows a spinner and ignores activation. The button stays focusable and keeps its width. */
  loading?: boolean;
  /** Stretch to the width of the container. */
  fullWidth?: boolean;
  /** Decorative icon before the content. Hidden from assistive technology. */
  leadingIcon?: ReactNode;
  /** Decorative icon after the content. Hidden from assistive technology. */
  trailingIcon?: ReactNode;
}

interface LabelledButtonProps {
  iconOnly?: false;
  children?: ReactNode;
}

// Icon-only buttons have no visible text, so the type system requires an accessible name.
type IconOnlyButtonProps = {
  /** Render a square button whose only content (`children`) is an icon. */
  iconOnly: true;
  children: ReactNode;
} & ({"aria-label": string} | {"aria-labelledby": string});

export type ButtonProps = ButtonOwnProps &
  Omit<ComponentPropsWithRef<"button">, "children"> &
  (LabelledButtonProps | IconOnlyButtonProps);

export function Button({
  variant = "primary",
  size = "default",
  loading = false,
  fullWidth = false,
  iconOnly = false,
  leadingIcon,
  trailingIcon,
  type = "button",
  disabled,
  className,
  children,
  onClick,
  ref,
  ...rest
}: ButtonProps) {
  // `loading` uses aria-disabled rather than `disabled` so keyboard focus is not lost mid-action.
  const handleClick = (event: MouseEvent<HTMLButtonElement>) => {
    if (loading) {
      event.preventDefault();
      return;
    }
    onClick?.(event);
  };

  return (
    <button
      {...rest}
      ref={ref}
      type={type}
      className={className ? `vl-button ${className}` : "vl-button"}
      disabled={disabled}
      aria-disabled={loading || undefined}
      aria-busy={loading || undefined}
      data-variant={variant}
      data-size={size}
      data-icon-only={iconOnly || undefined}
      data-full-width={fullWidth || undefined}
      data-loading={loading || undefined}
      onClick={handleClick}
    >
      {loading && <span className="vl-button__spinner" aria-hidden="true" />}
      <span className="vl-button__content">
        {iconOnly ? (
          <span className="vl-button__icon" aria-hidden="true">{children}</span>
        ) : (
          <>
            {leadingIcon && <span className="vl-button__icon" aria-hidden="true">{leadingIcon}</span>}
            {children}
            {trailingIcon && <span className="vl-button__icon" aria-hidden="true">{trailingIcon}</span>}
          </>
        )}
      </span>
      {loading && <span className="vl-button__sr">Loading</span>}
    </button>
  );
}

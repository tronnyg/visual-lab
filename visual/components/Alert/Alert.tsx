import type {ComponentPropsWithoutRef, ReactNode, Ref} from "react";
import {Icon, type IconName} from "../Icon/Icon";

export const alertVariants = ["info", "success", "warning", "danger"] as const;

export type AlertVariant = (typeof alertVariants)[number];

const alertIcons: Record<AlertVariant, IconName> = {
  info: "info",
  success: "check-circle",
  warning: "alert-triangle",
  danger: "alert-circle",
};

interface AlertOwnProps {
  /** Semantic style and icon. Defaults to `info`. */
  variant?: AlertVariant;
  /** Optional bold first line. */
  title?: ReactNode;
  ref?: Ref<HTMLDivElement>;
}

export type AlertProps = AlertOwnProps & Omit<ComponentPropsWithoutRef<"div">, keyof AlertOwnProps>;

/** A static contextual message. It has no role by default, so it is read in page order and never announced. For a message that appears
 *  after load, pass `role="status"` (polite) or `role="alert"` (urgent). The icon is decorative: put the meaning in the text. */
export function Alert({variant = "info", title, className, children, ...rest}: AlertProps) {
  return (
    <div {...rest} className={className ? `vl-alert ${className}` : "vl-alert"} data-variant={variant}>
      <Icon name={alertIcons[variant]} className="vl-alert__icon" />
      <div className="vl-alert__body">
        {title ? <div className="vl-alert__title">{title}</div> : null}
        <div className="vl-alert__message">{children}</div>
      </div>
    </div>
  );
}

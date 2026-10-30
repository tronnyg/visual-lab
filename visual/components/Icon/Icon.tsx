import {
  AlertCircle, AlertTriangle, ArrowDown, ArrowLeft, ArrowRight, ArrowUp, Bell, Calendar, Check, CheckCircle, ChevronDown, ChevronLeft,
  ChevronRight, ChevronUp, Clock, Copy, Download, ExternalLink, Eye, File, Folder, Heart, HelpCircle, Home, Image, Info, Lightbulb, Link,
  Lock, Mail, Menu, Minus, Pencil, Plus, RefreshCw, Search, Send, Settings, Star, Trash2, Upload, User, X, XCircle,
  type LucideIcon,
} from "lucide-react";
import type {ComponentPropsWithoutRef, Ref} from "react";

// The one icon vocabulary: a curated subset of Lucide, keyed by kebab-case name. Button's leadingIcon and trailingIcon use it too.
// Add an icon by importing it above and listing it here; the OpenUI schema and the docs follow from this object.
const iconComponents = {
  // Navigation
  "arrow-right": ArrowRight, "arrow-left": ArrowLeft, "arrow-up": ArrowUp, "arrow-down": ArrowDown,
  "chevron-right": ChevronRight, "chevron-left": ChevronLeft, "chevron-up": ChevronUp, "chevron-down": ChevronDown,
  "external-link": ExternalLink, home: Home, menu: Menu,
  // Actions
  plus: Plus, minus: Minus, check: Check, x: X, edit: Pencil, trash: Trash2, copy: Copy, download: Download, upload: Upload,
  send: Send, search: Search, settings: Settings, refresh: RefreshCw,
  // Status
  info: Info, "alert-circle": AlertCircle, "alert-triangle": AlertTriangle, "check-circle": CheckCircle, "x-circle": XCircle,
  "help-circle": HelpCircle, clock: Clock, bell: Bell,
  // Content
  file: File, folder: Folder, image: Image, link: Link, calendar: Calendar, mail: Mail, user: User, star: Star, heart: Heart,
  lock: Lock, eye: Eye, lightbulb: Lightbulb,
} satisfies Record<string, LucideIcon>;

export type IconName = keyof typeof iconComponents;
export const iconNames = Object.keys(iconComponents) as [IconName, ...IconName[]];
export const iconSizes = ["xs", "sm", "md", "lg", "xl"] as const;
export const iconTones = ["default", "muted", "accent", "success", "warning", "danger"] as const;

export type IconSize = (typeof iconSizes)[number];
export type IconTone = (typeof iconTones)[number];

interface IconOwnProps {
  /** Which icon to draw, from the curated allowlist. */
  name: IconName;
  /** Preset size: xs 12px, sm 14px, md 16px, lg 20px, xl 24px. Defaults to `md`. */
  size?: IconSize;
  /** Semantic colour. Unset inherits the surrounding text colour. */
  tone?: IconTone;
  /** Accessible name for an icon that conveys meaning on its own. Without it the icon is decorative and hidden from assistive technology. */
  label?: string;
  ref?: Ref<SVGSVGElement>;
}

export type IconProps = IconOwnProps & Omit<ComponentPropsWithoutRef<"svg">, keyof IconOwnProps | "children">;

/** A standalone interface icon. Drawn by Lucide; sized and coloured with Visual Lab tokens. */
export function Icon({name, size = "md", tone, label, className, ...rest}: IconProps) {
  const Glyph = iconComponents[name];
  if (!Glyph) return null;
  return (
    <Glyph
      {...rest}
      className={className ? `vl-icon ${className}` : "vl-icon"}
      data-size={size}
      data-tone={tone}
      {...(label ? {role: "img", "aria-label": label} : {"aria-hidden": true})}
      focusable="false"
    />
  );
}

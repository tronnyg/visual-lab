import {useState, type HTMLAttributes, type Ref} from "react";

export const imageAspectRatios = ["auto", "1:1", "4:3", "16:9"] as const;
export const imageFits = ["cover", "contain"] as const;
export const imageRadii = ["none", "sm", "md", "lg"] as const;
export const imageWidths = ["auto", "full", "sm", "md", "lg"] as const;
export const imageLoadings = ["lazy", "eager"] as const;

export type ImageAspectRatio = (typeof imageAspectRatios)[number];
export type ImageFit = (typeof imageFits)[number];
export type ImageRadius = (typeof imageRadii)[number];
export type ImageWidth = (typeof imageWidths)[number];
export type ImageLoading = (typeof imageLoadings)[number];

// Only absolute http(s) URLs and root-relative paths are loaded. Everything else (javascript:, data:, blob:, file:, relative paths) is refused.
// Whitespace, control characters and backslashes are refused because browsers strip or rewrite them, which could turn "/\t/host" or "/\host" into the protocol-relative URL "//host".
const httpUrl = /^https?:\/\/[^/?#]/i;
const rootRelative = /^\/(?![/\\])/;
const forbidden = /[\u0000- \u007f\\]/;

/** True when `src` is an absolute http(s) URL or a root-relative path such as `/assets/diagram.png`. */
export function isSafeImageSrc(src: string): boolean {
  return !forbidden.test(src) && (httpUrl.test(src) || rootRelative.test(src));
}

interface ImageOwnProps {
  /** Image address: an absolute http(s) URL or a root-relative path. Any other form is refused and shows the fallback. */
  src: string;
  /** Text alternative describing the image. Use an empty string for a purely decorative image. Not replaced by `caption`. */
  alt: string;
  /** Shape of the image area. `auto` keeps the image's natural proportions. Defaults to `auto`. */
  aspectRatio?: ImageAspectRatio;
  /** How the image fills a fixed aspect ratio: `cover` crops, `contain` shows all of it. Ignored for `auto`. Defaults to `cover`. */
  fit?: ImageFit;
  /** Corner rounding. Defaults to `md`. */
  radius?: ImageRadius;
  /** `auto` uses the image's natural width up to the parent's, `full` fills the parent, `sm`/`md`/`lg` fill it up to a maximum width. Defaults to `full`. */
  width?: ImageWidth;
  /** Visible caption below the image. Switches the markup to `<figure>` and `<figcaption>`. */
  caption?: string;
  /** Defaults to `lazy`. */
  loading?: ImageLoading;
  ref?: Ref<HTMLElement>;
}

export type ImageProps = ImageOwnProps & Omit<HTMLAttributes<HTMLElement>, keyof ImageOwnProps>;

// The outcome is stored with the src it belongs to, so a new src is "loading" again without an effect to reset anything.
type Outcome = {src: string; state: "loaded" | "error"};

/** A responsive image with an optional caption, a neutral placeholder while loading and a quiet fallback when it cannot be shown. */
export function Image({src, alt, aspectRatio, fit, radius, width, caption, loading, className, ref, ...rest}: ImageProps) {
  const [outcome, setOutcome] = useState<Outcome | null>(null);
  const safe = isSafeImageSrc(src);
  const state = !safe ? "error" : outcome?.src === src ? outcome.state : "loading";

  // An image that finished before React attached its handlers (cached, or loaded before hydration) never fires onLoad/onError again.
  const settle = (img: HTMLImageElement | null) => {
    if (!img || state !== "loading" || !img.complete) return;
    setOutcome({src, state: img.naturalWidth > 0 ? "loaded" : "error"});
  };

  const Root = caption ? "figure" : "div";
  return (
    <Root
      {...rest}
      ref={ref as Ref<HTMLDivElement>}
      className={className ? `vl-image ${className}` : "vl-image"}
      data-aspect={aspectRatio ?? "auto"}
      data-fit={fit ?? "cover"}
      data-radius={radius ?? "md"}
      data-width={width ?? "full"}
      data-state={state}
    >
      <div className="vl-image__frame">
        {state === "error" ? (
          // role="img" keeps the alt text available to assistive technology; a decorative image stays hidden.
          <div className="vl-image__fallback" role={alt ? "img" : undefined} aria-label={alt ? `${alt} (image unavailable)` : undefined} aria-hidden={alt ? undefined : true}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <rect x="3" y="4" width="18" height="16" rx="2" />
              <circle cx="9" cy="10" r="1.5" />
              <path d="m21 16-5-5-8 8" />
            </svg>
            <span aria-hidden="true">Image unavailable</span>
          </div>
        ) : (
          <img
            ref={settle}
            src={src}
            alt={alt}
            loading={loading ?? "lazy"}
            decoding="async"
            referrerPolicy="no-referrer"
            onLoad={() => setOutcome({src, state: "loaded"})}
            onError={() => setOutcome({src, state: "error"})}
          />
        )}
      </div>
      {caption ? <figcaption className="vl-image__caption">{caption}</figcaption> : null}
    </Root>
  );
}

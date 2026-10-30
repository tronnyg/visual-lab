# Image

A single responsive image with required alt text and an optional caption. Classification: `level: "primitive"`, `family: "data-display"`.

```text
visual/components/Image/
  Image.tsx            React component
  Image.css            Frame, aspect ratio, placeholder, fallback, caption (imported from app/layout.tsx)
  Image.openui.tsx     OpenUI schema: Image(src, alt, ...)
  Image.examples.ts    OpenUI examples, spread into `examples` in registry.ts
public/assets/         Two small SVGs used by the examples and the Main Board showcase
```

`Image.tsx` imports nothing from OpenUI, the board, MCP or Next.js. Like the other components, `Image.css` is imported from `app/layout.tsx` because `scripts/gen-library.tsx` runs under `tsx`, which cannot import `.css`.

## Image, Markdown, Text, Stack and Card

| Use | When |
| --- | --- |
| **Image** | A standalone image, illustration, diagram or thumbnail; anything that needs a caption, a fixed aspect ratio or explicit sizing |
| **Markdown** | Text-heavy documents with simple inline `![alt](url)` images |
| **Stack**, **Card** | Compose an Image with other elements. Image nests inside both |
| **Text** | Separate labels and descriptions next to an image |

## React API

```tsx
<Image
  src="https://example.com/photo.jpg"
  alt="Mountain landscape"
  aspectRatio="16:9"
  fit="cover"
  radius="md"
  width="full"
  caption="A mountain reflected in a lake."
/>
```

| Prop | Type | Default |
| --- | --- | --- |
| `src` | `string` | required |
| `alt` | `string` | required; `""` marks a decorative image |
| `aspectRatio` | `"auto" \| "1:1" \| "4:3" \| "16:9"` | `"auto"` |
| `fit` | `"cover" \| "contain"` | `"cover"` |
| `radius` | `"none" \| "sm" \| "md" \| "lg"` | `"md"` |
| `width` | `"auto" \| "full" \| "sm" \| "md" \| "lg"` | `"full"` |
| `caption` | `string` | none |
| `loading` | `"lazy" \| "eager"` | `"lazy"` |

`className` and other element attributes go on the outer element, and `ref` (React 19 ref-as-prop) points at it: a `<figure>` with a caption, otherwise a `<div>`. There are no pixel sizes or free-form styling props.

## OpenUI API

```text
Image(src, alt, aspectRatio?, fit?, radius?, width?, caption?, loading?)
```

`src` and `alt` are required; skip any optional argument with `null`. Enums are constrained by the Zod schema, so an invalid value is reported by validation. `src` and `caption` may be expressions such as `$imageUrl` or `"Source: " + $name`; they are evaluated by the renderer before they reach the component, the same as `Text.value`.

```text
root = Stack([photo, figure])
photo = Image("https://example.com/photo.jpg", "Mountain landscape", "16:9", "cover", "md", "full")
figure = Image("/assets/newton-diagram.png", "Forces acting on a block", null, null, null, "md", "Figure 1. Forces on a stationary block.")
```

Image is accepted as a child of `Stack` and `Card`.

## Supported sources

| `src` | Result |
| --- | --- |
| `https://…`, `http://…` | Loaded by the browser |
| `/assets/diagram.png` (root-relative) | Loaded by the browser from the page's own origin |
| `javascript:`, `data:`, `blob:`, `file:`, any other scheme | Refused: the fallback is shown and nothing is requested |
| `//host/x`, relative paths such as `assets/x.png`, values with whitespace, control characters or backslashes | Refused |

`isSafeImageSrc(src)` in `Image.tsx` is the single check. Image does not know whether a source is hosted elsewhere, uploaded, generated or stored locally; it hands the string to the browser.

Root-relative paths resolve against the Visual Lab host, and Image does not assume they live in Next.js's `public/` directory. **Host responsibility:** a future host that stores images itself (uploads, notes, attachments) must turn its internal asset references into browser-accessible URLs *before* passing them as `src`. That resolution layer, along with uploading, storage and asset management, is not part of Image.

## Sizing and aspect ratio

- `aspectRatio="auto"` keeps the image's natural proportions and ignores `fit`.
- `1:1`, `4:3` and `16:9` give the image area a fixed shape (CSS `aspect-ratio`) that is reserved before the image loads, so nothing shifts. `cover` fills the area and crops; `contain` shows the whole image with the muted placeholder colour behind any spare space.
- `width` follows Card: `full` fills the parent, `sm`/`md`/`lg` fill it up to 480, 640 or 800 px, and `auto` uses the image's natural width capped at the parent's. A fixed aspect ratio has no natural width, so with `auto` it fills the parent.
- Images never exceed their parent (`max-width: 100%`, `min-width: 0`) and shrink in narrow layouts. Radius uses `--ui-radius-sm|md|lg`.

## Captions and accessibility

- With a `caption` the markup is `<figure>` + `<figcaption>` below the image; without one it is a plain `<div>` around the `<img>`.
- `alt` is required in both APIs and is never filled in from the caption. Alt describes the image for people who cannot see it; the caption is visible text for everyone. Use `alt=""` only for decorative images.
- The caption uses the Text `caption` type (12 px) in `--ui-text-muted`, and wraps.
- The image is not focusable and has no click behaviour, zoom or lightbox.

## Loading and errors

- `loading="lazy"` is the default; use `eager` for an image at the top of a board.
- Until the image loads, the frame shows a neutral `--ui-surface-muted` placeholder (with a 120 px minimum height for `auto` ratio). There is no animation.
- If the image fails or `src` is refused, the `<img>` is removed and a quiet bordered fallback with an icon and "Image unavailable" is shown, so the browser's broken-image icon never disturbs the layout. The fallback has `role="img"` and `aria-label="<alt> (image unavailable)"`; for a decorative image it is `aria-hidden`.
- Load and error results are stored together with the `src` they belong to, so changing `src` starts again from loading and cannot leave a stale error. An image that finished loading before React attached its handlers is detected on mount.
- Images are requested with `referrerPolicy="no-referrer"` and `decoding="async"`. Loading a remote image reveals the viewer's IP address to its host.

## Styling

`Image.css` uses only `--ui-*` tokens (`--ui-surface-muted`, `--ui-border`, `--ui-text-muted`, `--ui-radius-*`, `--ui-space-*`), so light and dark themes need no extra rules. State is driven by `data-aspect`, `data-fit`, `data-radius`, `data-width` and `data-state` attributes. There are no shadows, borders on the image itself, Tailwind or inline styles.

## Limitations

No upload, storage, asset resolution, galleries, lightbox, zoom, cropping, responsive `srcset`, intrinsic `width`/`height` hints (an `auto` image shifts the layout when it loads) or click actions. The two sample SVGs in `public/assets/` exist only for examples; the example photos come from `picsum.photos`.

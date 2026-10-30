import {defineComponent} from "@openuidev/react-lang";
import {z} from "zod/v4";
import {Image, imageAspectRatios, imageFits, imageLoadings, imageRadii, imageWidths} from "./Image";

// Positional order matters in OpenUI Lang: src and alt first (both required), then the optional arguments in the order users reach for them.
// None of these are wrapped in reactive(): that is for two-way input bindings. Expressions such as $imageUrl are evaluated by the renderer before they reach the component, exactly as for Text.value.
const imageProps = z.object({
  src: z.string().describe("Image address: an absolute http(s) URL or a root-relative path such as \"/assets/diagram.png\". Other schemes are refused and show a fallback. May be an expression"),
  alt: z.string().describe("Text alternative that describes the image for people who cannot see it. Use \"\" only for purely decorative images. Required, and separate from the caption"),
  aspectRatio: z.enum(imageAspectRatios).optional().describe("Shape of the image area: auto (natural proportions), 1:1, 4:3, 16:9. Default auto"),
  fit: z.enum(imageFits).optional().describe("How the image fills a fixed aspect ratio: cover (fill and crop) or contain (show all of it). Ignored for auto. Default cover"),
  radius: z.enum(imageRadii).optional().describe("Corner rounding: none, sm, md, lg. Default md"),
  width: z.enum(imageWidths).optional().describe("auto (natural width, up to the parent's), full (fill the parent), or sm/md/lg (fill the parent up to a maximum width). Default full"),
  caption: z.string().optional().describe("Visible caption below the image, e.g. \"Figure 1. Forces on a block\". Not a substitute for alt"),
  loading: z.enum(imageLoadings).optional().describe("lazy (load when near the viewport) or eager (load immediately, for an image at the top of the board). Default lazy"),
});

export const imageDefinition = defineComponent({
  name: "Image",
  description: "A single image from an http(s) URL or a root-relative path, with required alt text, an optional caption, a fixed aspect ratio (auto, 1:1, 4:3, 16:9), cover or contain fit, corner radius and width. Use Image for standalone images, illustrations, diagrams, thumbnails and images that need explicit sizing or a caption; use Markdown for text-heavy documents with simple inline images; use Stack and Card to compose an Image with other elements; use Text for separate labels and descriptions.",
  props: imageProps,
  component: ({props}) => {
    // Skipped optional arguments (null, or an unresolved expression) must not reach the component, where defaults only apply to undefined.
    const {src, alt, ...rest} = Object.fromEntries(Object.entries(props).filter(([, v]) => v != null)) as typeof props;
    return <Image {...rest} src={String(src ?? "")} alt={String(alt ?? "")} />;
  },
});

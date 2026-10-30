// Positional args: Image(src, alt, aspectRatio, fit, radius, width, caption, loading)
// src and alt are required; skip optional arguments you do not need with null. Defaults: auto, cover, md, full, no caption, lazy.
// /assets/*.svg are small files shipped in public/ for these examples; picsum.photos serves the external demo photos.
const lake = "https://picsum.photos/id/1018/800/450";
const hills = "/assets/sample-landscape.svg";
const diagram = "/assets/sample-diagram.svg";

export const imageExamples = [
  {
    title: "Image sources, captions and decorative images",
    code: `root = Stack([intro, photo, figure, decorative], "lg")\nintro = Text("Images", "default", "heading", "h2")\nphoto = Image("${lake}", "A mountain reflected in a still lake", "16:9", "cover", "md", "full", "A mountain reflected in a lake.")\nfigure = Image("${diagram}", "Diagram showing the forces acting on a block at rest", "auto", null, null, "md", "Figure 1. Forces acting on a stationary block.")\ndecorative = Image("${hills}", "", "16:9", "cover", "lg", "sm")`,
  },
  {
    title: "Image aspect ratios and fit",
    code: `root = Stack([intro, ratios, fits], "lg")\nintro = Text("Aspect ratios and fit", "default", "heading", "h2")\nratios = Stack([Image("${hills}", "Natural proportions", "auto", null, null, "full", "auto"), Image("${hills}", "Square crop", "1:1", "cover", null, "full", "1:1"), Image("${hills}", "Landscape crop", "4:3", "cover", null, "full", "4:3"), Image("${hills}", "Widescreen crop", "16:9", "cover", null, "full", "16:9")], "md", "horizontal", "start", "start", true)\nfits = Stack([Image("${diagram}", "Forces on a block, cropped to fill", "16:9", "cover", null, "full", "cover crops"), Image("${diagram}", "Forces on a block, shown whole", "16:9", "contain", null, "full", "contain shows everything")], "md", "horizontal", "start", "start", true)`,
  },
  {
    title: "Image in a Card with radius, width and failure fallback",
    code: `root = Stack([card, radii, broken], "lg")\ncard = Card(null, null, [label, Image("${lake}", "A mountain reflected in a still lake", "4:3", "cover", "lg", "full", "Lake at dawn."), Text("Images nest inside Cards and Stacks like any other component.", "muted")], "default", "md")\nlabel = Text("Card with an image", "default", "subheading", "h3")\nradii = Stack([Image("${hills}", "Square corners", "1:1", "cover", "none", "sm"), Image("${hills}", "Small corners", "1:1", "cover", "sm", "sm"), Image("${hills}", "Medium corners", "1:1", "cover", "md", "sm"), Image("${hills}", "Large corners", "1:1", "cover", "lg", "sm")], "md", "horizontal", "start", "start", true)\nbroken = Image("/assets/does-not-exist.png", "A chart that could not be loaded", "16:9", null, null, "md", "A missing image shows a quiet fallback instead of a broken icon.")`,
  },
];

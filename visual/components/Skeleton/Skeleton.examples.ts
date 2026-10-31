// Positional args: Skeleton(variant, width, height, lines, animated). width/height are pixels (a number) or a CSS length string.
export const skeletonExamples = [
  {
    title: "Skeleton text lines",
    code: 'root = Skeleton("text", null, null, 3)',
  },
  {
    title: "Profile card loading",
    code: 'root = Card("Loading profile", null, [loading, header, bio])\nloading = Text("Loading…", "muted", "caption")\nheader = Stack([avatar, name], "md", "horizontal", "center")\navatar = Skeleton("circle", 48)\nname = Stack([line1, line2], "xs")\nline1 = Skeleton("text", "160px")\nline2 = Skeleton("text", "100px")\nbio = Skeleton("text", null, null, 3)',
  },
  {
    title: "Image placeholder",
    code: 'root = Stack([image, caption], "sm")\nimage = Skeleton("rectangle", "100%", 160)\ncaption = Skeleton("text", "50%")',
  },
] as const;

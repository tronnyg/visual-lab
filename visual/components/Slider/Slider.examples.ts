// Positional args: Slider(value, label, min, max, step, disabled). `value` must be a bare number $variable to be writable.
export const sliderExamples = [
  {
    title: "Basic slider",
    code: 'root = Stack([slider, readout], "sm")\n$volume = 40\nslider = Slider($volume, "Volume")\nreadout = Text("Volume is " + $volume + "%", "muted")',
  },
  {
    title: "Slider with range and step",
    code: 'root = Stack([slider, readout], "sm")\n$rating = 3\nslider = Slider($rating, "Rating", 1, 5, 1)\nreadout = Text("You rated this " + $rating + " out of 5", "default", "heading")',
  },
  {
    title: "Resetting a slider",
    code: 'root = Stack([slider, readout, clear], "sm")\n$brightness = 70\nslider = Slider($brightness, "Brightness", 0, 100, 5)\nreadout = Text("Brightness: " + $brightness)\nclear = Button("Reset", false, "outline", "default", false, false, null, null, @Reset($brightness))',
  },
  {
    title: "Two independent sliders",
    code: 'root = Stack([width, height, summary], "sm")\n$width = 200\n$height = 100\nwidth = Slider($width, "Width", 0, 400, 10)\nheight = Slider($height, "Height", 0, 400, 10)\nsummary = Text("Area: " + $width * $height + " square units", "muted")',
  },
  {
    title: "Disabled slider",
    code: 'root = Stack([slider, note], "sm")\n$progress = 65\nslider = Slider($progress, "Upload progress", 0, 100, 1, true)\nnote = Text("Disabled sliders cannot be dragged or focused.", "muted", "caption")',
  },
] as const;

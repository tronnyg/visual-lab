import {defineComponent} from "@openuidev/react-lang";
import {z} from "zod/v4";
import {Grid, gridAligns, gridColumns, gridJustifies, gridMinColumnWidths, gridSpacings, gridWidths} from "./Grid";
import {textDefinition} from "../Text/Text.openui";
import {buttonDefinition} from "../Button/Button.openui";
import {inputDefinition} from "../Input/Input.openui";
import {textareaDefinition} from "../Textarea/Textarea.openui";
import {checkboxDefinition} from "../Checkbox/Checkbox.openui";
import {sliderDefinition} from "../Slider/Slider.openui";
import {radioGroupDefinition} from "../RadioGroup/RadioGroup.openui";
import {selectDefinition} from "../Select/Select.openui";
import {badgeDefinition} from "../Badge/Badge.openui";
import {alertDefinition} from "../Alert/Alert.openui";
import {progressDefinition} from "../Progress/Progress.openui";
import {cardDefinition} from "../Card/Card.openui";
import {stackDefinition} from "../Stack/Stack.openui";
import {markdownDefinition} from "../Markdown/Markdown.openui";
import {imageDefinition} from "../Image/Image.openui";
import {dividerDefinition} from "../Divider/Divider.openui";
import {iconDefinition} from "../Icon/Icon.openui";

// Positional order matters in OpenUI Lang: children and columns first, then the spacing and alignment arguments.
// Children are typed references to registered components, like Stack's. The getter makes the schema recursive so a Grid can contain Grids,
// and defers the references so Grid, Stack and Card can contain each other without a circular-import problem.
const gridProps = z.object({
  get children(): z.ZodArray<z.ZodType> {
    return z.array(z.union([gridProps, stackDefinition.ref, cardDefinition.ref, textDefinition.ref, markdownDefinition.ref, imageDefinition.ref, dividerDefinition.ref, iconDefinition.ref, buttonDefinition.ref, inputDefinition.ref, textareaDefinition.ref, checkboxDefinition.ref, sliderDefinition.ref, radioGroupDefinition.ref, selectDefinition.ref, badgeDefinition.ref, alertDefinition.ref, progressDefinition.ref])).describe("Components to place in the grid, in order, filling each row left to right. May include other Grids");
  },
  columns: z.union(gridColumns.map(n => z.literal(n)) as unknown as [z.ZodLiteral<1>, z.ZodLiteral<2>, z.ZodLiteral<3>, z.ZodLiteral<4>]).optional().describe("Most columns to use: 1, 2, 3 or 4. Fewer are used in a narrow container. Default 2"),
  gap: z.enum(gridSpacings).optional().describe("Space between rows and columns: none, xs, sm, md, lg. Default md"),
  rowGap: z.enum(gridSpacings).optional().describe("Space between rows only; overrides gap for rows"),
  columnGap: z.enum(gridSpacings).optional().describe("Space between columns only; overrides gap for columns"),
  align: z.enum(gridAligns).optional().describe("Vertical alignment of items in their row: start, center, end, stretch. Default stretch"),
  justify: z.enum(gridJustifies).optional().describe("Horizontal alignment of items in their column: start, center, end, stretch. Default stretch"),
  minColumnWidth: z.enum(gridMinColumnWidths).optional().describe("Narrowest a column may get before the grid uses fewer columns: none (always keep columns), sm, md, lg. Default sm"),
  width: z.enum(gridWidths).optional().describe("auto, full (fill the parent), or sm/md/lg (fill the parent up to a maximum width). Default auto"),
});

export const gridDefinition = defineComponent({
  name: "Grid",
  description: "Places child components in 1 to 4 equal columns and wrapping rows, with predictable alignment. Layout only: it draws nothing itself. Use Grid for two-dimensional layouts such as card galleries and dashboards; use Stack for a single column or row, and Card for visual grouping. Collapses to fewer columns in narrow containers.",
  props: gridProps,
  component: ({props, renderNode}) => {
    // Skipped optional arguments (null, or an unresolved expression) must not reach the component, where defaults only apply to undefined.
    const {children, ...rest} = Object.fromEntries(Object.entries(props).filter(([, v]) => v != null)) as typeof props;
    return <Grid {...rest}>{renderNode(children)}</Grid>;
  },
});

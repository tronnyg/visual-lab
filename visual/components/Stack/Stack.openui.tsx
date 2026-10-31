import {defineComponent} from "@openuidev/react-lang";
import {z} from "zod/v4";
import {Stack, stackAligns, stackDirections, stackFlexes, stackJustifies, stackSpacings, stackWidths} from "./Stack";
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
import {spinnerDefinition} from "../Spinner/Spinner.openui";
import {tableDefinition} from "../Table/Table.openui";
import {listDefinition} from "../List/List.openui";
import {keyValueDefinition} from "../KeyValue/KeyValue.openui";
import {codeBlockDefinition} from "../CodeBlock/CodeBlock.openui";
import {chartDefinition} from "../Chart/Chart.openui";
import {proportionChartDefinition} from "../ProportionChart/ProportionChart.openui";
import {cardDefinition} from "../Card/Card.openui";
import {markdownDefinition} from "../Markdown/Markdown.openui";
import {imageDefinition} from "../Image/Image.openui";
import {dividerDefinition} from "../Divider/Divider.openui";
import {gridDefinition} from "../Grid/Grid.openui";
import {iconDefinition} from "../Icon/Icon.openui";
import {spacerDefinition} from "../Spacer/Spacer.openui";
import {tabsDefinition} from "../Tabs/Tabs.openui";
import {accordionDefinition} from "../Accordion/Accordion.openui";
import {collapsibleDefinition} from "../Collapsible/Collapsible.openui";
import {breadcrumbsDefinition} from "../Breadcrumbs/Breadcrumbs.openui";
import {paginationDefinition} from "../Pagination/Pagination.openui";
import {navigationMenuDefinition} from "../NavigationMenu/NavigationMenu.openui";
import {commandPaletteDefinition} from "../CommandPalette/CommandPalette.openui";
import {dialogDefinition} from "../Dialog/Dialog.openui";
import {popoverDefinition} from "../Popover/Popover.openui";
import {tooltipDefinition} from "../Tooltip/Tooltip.openui";

// Positional order matters in OpenUI Lang. children and gap keep the positions of the original Stack(children, gap),
// so existing boards keep working; the new arguments come after them.
// Children are typed references to registered components, not z.any(). A new component is accepted as a Stack child once it is added to the union.
// The getter makes the schema recursive so a Stack can contain Stacks.
const stackProps = z.object({
  get children() {
    return z.array(z.union([stackProps, textDefinition.ref, markdownDefinition.ref, imageDefinition.ref, dividerDefinition.ref, gridDefinition.ref, iconDefinition.ref, spacerDefinition.ref, buttonDefinition.ref, inputDefinition.ref, textareaDefinition.ref, checkboxDefinition.ref, sliderDefinition.ref, radioGroupDefinition.ref, selectDefinition.ref, badgeDefinition.ref, alertDefinition.ref, progressDefinition.ref, spinnerDefinition.ref, tableDefinition.ref, listDefinition.ref, keyValueDefinition.ref, codeBlockDefinition.ref, chartDefinition.ref, proportionChartDefinition.ref, tabsDefinition.ref, accordionDefinition.ref, collapsibleDefinition.ref, breadcrumbsDefinition.ref, paginationDefinition.ref, navigationMenuDefinition.ref, commandPaletteDefinition.ref, cardDefinition.ref, dialogDefinition.ref, popoverDefinition.ref, tooltipDefinition.ref])).describe("Components to arrange, in order. May include other Stacks");
  },
  gap: z.enum(stackSpacings).optional().describe("Space between children: none, xs, sm, md, lg. Default md"),
  direction: z.enum(stackDirections).optional().describe("vertical stacks children top to bottom, horizontal places them in a row. Default vertical"),
  align: z.enum(stackAligns).optional().describe("Cross-axis alignment: start, center, end, stretch, baseline. Default stretch"),
  justify: z.enum(stackJustifies).optional().describe("Main-axis distribution: start, center, end, between, around, evenly. Default start"),
  wrap: z.boolean().optional().describe("Let children wrap onto new lines when they do not fit. Default false"),
  padding: z.enum(stackSpacings).optional().describe("Space inside the Stack: none, xs, sm, md, lg. Default none"),
  width: z.enum(stackWidths).optional().describe("auto, full (fill the parent), or sm/md/lg (fill the parent up to a maximum width). Default auto"),
  flex: z.enum(stackFlexes).optional().describe("Inside a horizontal Stack: grow shares the spare space, shrink lets it get narrower than its content, none keeps its size"),
});

export const stackDefinition = defineComponent({
  name: "Stack",
  description: "Arranges child components vertically or in a row. Layout only: it draws nothing itself. Stack is a common root; any registered component may be the root. Nest Stacks for rows inside columns. For two-dimensional layouts use Grid.",
  props: stackProps,
  component: ({props, renderNode}) => {
    // Skipped optional arguments (null, or an unresolved expression) must not reach the component, where defaults only apply to undefined.
    const {children, ...rest} = Object.fromEntries(Object.entries(props).filter(([, v]) => v != null)) as typeof props;
    return <Stack {...rest}>{renderNode(children)}</Stack>;
  },
});

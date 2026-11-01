import {defineComponent} from "@openuidev/react-lang";
import {z} from "zod/v4";
import {Card, cardBackgrounds, cardRadii, cardShadows, cardSpacings, cardVariants, cardWidths} from "./Card";
import {Text} from "../Text/Text";
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
import {stackDefinition} from "../Stack/Stack.openui";
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
import {drawerDefinition} from "../Drawer/Drawer.openui";
import {toastDefinition} from "../Toast/Toast.openui";
import {skeletonDefinition} from "../Skeleton/Skeleton.openui";
import {dropdownMenuDefinition} from "../DropdownMenu/DropdownMenu.openui";
import {switchDefinition} from "../Switch/Switch.openui";

// Positional order matters in OpenUI Lang. title and body keep the positions of the original Card(title, body),
// so existing boards keep working; children and the styling arguments come after them.
// Children are typed references to registered components, like Stack's. The getters defer the references so Card and Stack can
// contain each other without a circular-import problem. A new component is accepted as a child once its .ref is added here.
const cardProps = z.object({
  title: z.string().optional().describe("Legacy: a heading line. Prefer a Text child instead"),
  body: z.string().optional().describe("Legacy: a muted paragraph. Prefer a Text child instead"),
  get children(): z.ZodOptional<z.ZodArray<z.ZodType>> {
    return z.array(z.union([textDefinition.ref, markdownDefinition.ref, imageDefinition.ref, dividerDefinition.ref, gridDefinition.ref, iconDefinition.ref, spacerDefinition.ref, buttonDefinition.ref, inputDefinition.ref, textareaDefinition.ref, checkboxDefinition.ref, sliderDefinition.ref, radioGroupDefinition.ref, selectDefinition.ref, badgeDefinition.ref, alertDefinition.ref, progressDefinition.ref, spinnerDefinition.ref, tableDefinition.ref, listDefinition.ref, keyValueDefinition.ref, codeBlockDefinition.ref, chartDefinition.ref, proportionChartDefinition.ref, tabsDefinition.ref, accordionDefinition.ref, collapsibleDefinition.ref, breadcrumbsDefinition.ref, paginationDefinition.ref, navigationMenuDefinition.ref, commandPaletteDefinition.ref, stackDefinition.ref, cardProps, dialogDefinition.ref, popoverDefinition.ref, tooltipDefinition.ref, drawerDefinition.ref, toastDefinition.ref, skeletonDefinition.ref, dropdownMenuDefinition.ref, switchDefinition.ref])).optional().describe("Components shown inside the card, stacked vertically in order. Skip title and body with null when using children");
  },
  variant: z.enum(cardVariants).optional().describe("default (surface with border), outline (border only), filled (muted fill, no border), subtle (faint fill with border). Default default"),
  padding: z.enum(cardSpacings).optional().describe("Space inside the card: none, xs, sm, md, lg. Default md"),
  gap: z.enum(cardSpacings).optional().describe("Space between children: none, xs, sm, md, lg. Default md"),
  radius: z.enum(cardRadii).optional().describe("Corner rounding: none, sm, md, lg. Default md"),
  shadow: z.enum(cardShadows).optional().describe("Elevation: none, sm, md. Default none"),
  background: z.enum(cardBackgrounds).optional().describe("Surface colour: canvas, surface, muted, accent. Overrides the variant's background"),
  border: z.boolean().optional().describe("Show or hide the border. Overrides the variant's choice"),
  width: z.enum(cardWidths).optional().describe("auto, full (fill the parent), or sm/md/lg (fill the parent up to a maximum width). Default auto"),
});

export const cardDefinition = defineComponent({
  name: "Card",
  description: "A visual container that groups child components vertically on a bordered or filled surface. Visual grouping only: use a Stack inside it for rows or other layouts, and Text for headings. title and body are legacy first arguments: when using children, skip them with null, e.g. Card(null, null, [a, b]).",
  props: cardProps,
  component: ({props, renderNode}) => {
    // Skipped optional arguments (null, or an unresolved expression) must not reach the component, where defaults only apply to undefined.
    const {title, body, children, ...rest} = Object.fromEntries(Object.entries(props).filter(([, v]) => v != null)) as typeof props;
    const legacy = Boolean(title || body);
    return (
      <Card {...rest} gap={rest.gap ?? (legacy ? "sm" : undefined)}>
        {title ? <Text as="h3" preset="subheading" size="md">{title}</Text> : null}
        {body ? <Text tone="muted" size="sm">{body}</Text> : null}
        {children ? renderNode(children) : null}
      </Card>
    );
  },
});

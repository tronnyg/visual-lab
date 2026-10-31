import {z} from "zod/v4";
import {stackDefinition} from "../components/Stack/Stack.openui";
import {cardDefinition} from "../components/Card/Card.openui";
import {gridDefinition} from "../components/Grid/Grid.openui";
import {textDefinition} from "../components/Text/Text.openui";
import {markdownDefinition} from "../components/Markdown/Markdown.openui";
import {imageDefinition} from "../components/Image/Image.openui";
import {dividerDefinition} from "../components/Divider/Divider.openui";
import {iconDefinition} from "../components/Icon/Icon.openui";
import {spacerDefinition} from "../components/Spacer/Spacer.openui";
import {buttonDefinition} from "../components/Button/Button.openui";
import {inputDefinition} from "../components/Input/Input.openui";
import {textareaDefinition} from "../components/Textarea/Textarea.openui";
import {checkboxDefinition} from "../components/Checkbox/Checkbox.openui";
import {sliderDefinition} from "../components/Slider/Slider.openui";
import {radioGroupDefinition} from "../components/RadioGroup/RadioGroup.openui";
import {selectDefinition} from "../components/Select/Select.openui";
import {badgeDefinition} from "../components/Badge/Badge.openui";
import {alertDefinition} from "../components/Alert/Alert.openui";
import {progressDefinition} from "../components/Progress/Progress.openui";
import {spinnerDefinition} from "../components/Spinner/Spinner.openui";
import {tableDefinition} from "../components/Table/Table.openui";
import {listDefinition} from "../components/List/List.openui";
import {keyValueDefinition} from "../components/KeyValue/KeyValue.openui";
import {codeBlockDefinition} from "../components/CodeBlock/CodeBlock.openui";
import {chartDefinition} from "../components/Chart/Chart.openui";
import {proportionChartDefinition} from "../components/ProportionChart/ProportionChart.openui";
import {tabsDefinition} from "../components/Tabs/Tabs.openui";
import {accordionDefinition} from "../components/Accordion/Accordion.openui";
import {collapsibleDefinition} from "../components/Collapsible/Collapsible.openui";
import {breadcrumbsDefinition} from "../components/Breadcrumbs/Breadcrumbs.openui";
import {paginationDefinition} from "../components/Pagination/Pagination.openui";
import {navigationMenuDefinition} from "../components/NavigationMenu/NavigationMenu.openui";
import {commandPaletteDefinition} from "../components/CommandPalette/CommandPalette.openui";

// The components a panel (Tabs, Accordion, Collapsible) may hold: one typed reference, like Stack's children. Wrap several in a Stack.
// Called from the getter of each container's schema, so these cross-imports are only read after every module has loaded.
// A new component is accepted inside a panel once its .ref is added here.
export function panelContentSchema() {
  return z.union([stackDefinition.ref, cardDefinition.ref, gridDefinition.ref, textDefinition.ref, markdownDefinition.ref, imageDefinition.ref, dividerDefinition.ref, iconDefinition.ref, spacerDefinition.ref, buttonDefinition.ref, inputDefinition.ref, textareaDefinition.ref, checkboxDefinition.ref, sliderDefinition.ref, radioGroupDefinition.ref, selectDefinition.ref, badgeDefinition.ref, alertDefinition.ref, progressDefinition.ref, spinnerDefinition.ref, tableDefinition.ref, listDefinition.ref, keyValueDefinition.ref, codeBlockDefinition.ref, chartDefinition.ref, proportionChartDefinition.ref, tabsDefinition.ref, accordionDefinition.ref, collapsibleDefinition.ref, breadcrumbsDefinition.ref, paginationDefinition.ref, navigationMenuDefinition.ref, commandPaletteDefinition.ref]);
}

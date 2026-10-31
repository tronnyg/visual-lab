import {stackDefinition} from "./components/Stack/Stack.openui";
import {textDefinition} from "./components/Text/Text.openui";
import {cardDefinition} from "./components/Card/Card.openui";
import {markdownDefinition} from "./components/Markdown/Markdown.openui";
import {markdownExamples} from "./components/Markdown/Markdown.examples";
import {imageDefinition} from "./components/Image/Image.openui";
import {imageExamples} from "./components/Image/Image.examples";
import {spacerDefinition} from "./components/Spacer/Spacer.openui";
import {spacerExamples} from "./components/Spacer/Spacer.examples";
import {iconDefinition} from "./components/Icon/Icon.openui";
import {iconExamples} from "./components/Icon/Icon.examples";
import {gridDefinition} from "./components/Grid/Grid.openui";
import {gridExamples} from "./components/Grid/Grid.examples";
import {dividerDefinition} from "./components/Divider/Divider.openui";
import {dividerExamples} from "./components/Divider/Divider.examples";
import {buttonDefinition} from "./components/Button/Button.openui";
import {buttonExamples} from "./components/Button/Button.examples";
import {inputDefinition} from "./components/Input/Input.openui";
import {inputExamples} from "./components/Input/Input.examples";
import {textareaDefinition} from "./components/Textarea/Textarea.openui";
import {textareaExamples} from "./components/Textarea/Textarea.examples";
import {checkboxDefinition} from "./components/Checkbox/Checkbox.openui";
import {checkboxExamples} from "./components/Checkbox/Checkbox.examples";
import {sliderDefinition} from "./components/Slider/Slider.openui";
import {sliderExamples} from "./components/Slider/Slider.examples";
import {radioGroupDefinition} from "./components/RadioGroup/RadioGroup.openui";
import {radioGroupExamples} from "./components/RadioGroup/RadioGroup.examples";
import {selectDefinition} from "./components/Select/Select.openui";
import {selectExamples} from "./components/Select/Select.examples";
import {badgeDefinition} from "./components/Badge/Badge.openui";
import {badgeExamples} from "./components/Badge/Badge.examples";
import {alertDefinition} from "./components/Alert/Alert.openui";
import {alertExamples} from "./components/Alert/Alert.examples";
import {progressDefinition} from "./components/Progress/Progress.openui";
import {progressExamples} from "./components/Progress/Progress.examples";
import {spinnerDefinition} from "./components/Spinner/Spinner.openui";
import {spinnerExamples} from "./components/Spinner/Spinner.examples";
import {tableDefinition} from "./components/Table/Table.openui";
import {tableExamples} from "./components/Table/Table.examples";
import {listDefinition} from "./components/List/List.openui";
import {listExamples} from "./components/List/List.examples";
import {keyValueDefinition} from "./components/KeyValue/KeyValue.openui";
import {keyValueExamples} from "./components/KeyValue/KeyValue.examples";
import {codeBlockDefinition} from "./components/CodeBlock/CodeBlock.openui";
import {codeBlockExamples} from "./components/CodeBlock/CodeBlock.examples";
import {chartDefinition} from "./components/Chart/Chart.openui";
import {chartExamples} from "./components/Chart/Chart.examples";
import {proportionChartDefinition} from "./components/ProportionChart/ProportionChart.openui";
import {proportionChartExamples} from "./components/ProportionChart/ProportionChart.examples";
import {tabsDefinition} from "./components/Tabs/Tabs.openui";
import {tabsExamples} from "./components/Tabs/Tabs.examples";
import {accordionDefinition} from "./components/Accordion/Accordion.openui";
import {accordionExamples} from "./components/Accordion/Accordion.examples";
import {collapsibleDefinition} from "./components/Collapsible/Collapsible.openui";
import {collapsibleExamples} from "./components/Collapsible/Collapsible.examples";
import {breadcrumbsDefinition} from "./components/Breadcrumbs/Breadcrumbs.openui";
import {breadcrumbsExamples} from "./components/Breadcrumbs/Breadcrumbs.examples";
import {paginationDefinition} from "./components/Pagination/Pagination.openui";
import {paginationExamples} from "./components/Pagination/Pagination.examples";
import {navigationMenuDefinition} from "./components/NavigationMenu/NavigationMenu.openui";
import {navigationMenuExamples} from "./components/NavigationMenu/NavigationMenu.examples";
import {commandPaletteDefinition} from "./components/CommandPalette/CommandPalette.openui";
import {commandPaletteExamples} from "./components/CommandPalette/CommandPalette.examples";
import {dialogDefinition} from "./components/Dialog/Dialog.openui";
import {dialogExamples} from "./components/Dialog/Dialog.examples";
import {popoverDefinition} from "./components/Popover/Popover.openui";
import {popoverExamples} from "./components/Popover/Popover.examples";
import {tooltipDefinition} from "./components/Tooltip/Tooltip.openui";
import {tooltipExamples} from "./components/Tooltip/Tooltip.examples";
import {drawerDefinition} from "./components/Drawer/Drawer.openui";
import {drawerExamples} from "./components/Drawer/Drawer.examples";
import {toastDefinition} from "./components/Toast/Toast.openui";
import {toastExamples} from "./components/Toast/Toast.examples";
import {cardExamples} from "./components/Card/Card.examples";
import {stackExamples} from "./components/Stack/Stack.examples";
import {textExamples} from "./components/Text/Text.examples";
import type {defineComponent} from "@openuidev/react-lang";
import type {ComponentClassification} from "./classification";
export type {ComponentLevel,ComponentFamily,ComponentClassification} from "./classification";
export interface RegisteredComponent extends ComponentClassification{definition:ReturnType<typeof defineComponent<any>>}
// Classification is descriptive metadata only; it does not affect rendering or the OpenUI library.
export const registeredComponents=[
  {level:"foundation",family:"layout",definition:stackDefinition},
  {level:"foundation",family:"layout",definition:dividerDefinition},
  {level:"foundation",family:"layout",definition:gridDefinition},
  {level:"foundation",family:"data-display",definition:iconDefinition},
  {level:"foundation",family:"layout",definition:spacerDefinition},
  {level:"foundation",family:"typography",definition:textDefinition},
  {level:"composite",family:"data-display",definition:cardDefinition},
  {level:"composite",family:"typography",definition:markdownDefinition},
  {level:"composite",family:"feedback",definition:alertDefinition},
  {level:"primitive",family:"controls",definition:buttonDefinition},
  {level:"primitive",family:"controls",definition:inputDefinition},
  {level:"primitive",family:"controls",definition:textareaDefinition},
  {level:"primitive",family:"controls",definition:checkboxDefinition},
  {level:"primitive",family:"controls",definition:sliderDefinition},
  {level:"primitive",family:"controls",definition:radioGroupDefinition},
  {level:"primitive",family:"controls",definition:selectDefinition},
  {level:"primitive",family:"data-display",definition:imageDefinition},
  {level:"primitive",family:"feedback",definition:badgeDefinition},
  {level:"primitive",family:"feedback",definition:progressDefinition},
  {level:"primitive",family:"feedback",definition:spinnerDefinition},
  {level:"composite",family:"data-display",definition:tableDefinition},
  {level:"composite",family:"data-display",definition:listDefinition},
  {level:"composite",family:"data-display",definition:keyValueDefinition},
  {level:"composite",family:"data-display",definition:codeBlockDefinition},
  {level:"specialized",family:"visualization",definition:chartDefinition},
  {level:"specialized",family:"visualization",definition:proportionChartDefinition},
  {level:"composite",family:"navigation",definition:tabsDefinition},
  {level:"composite",family:"layout",definition:accordionDefinition},
  {level:"composite",family:"layout",definition:collapsibleDefinition},
  {level:"composite",family:"navigation",definition:breadcrumbsDefinition},
  {level:"composite",family:"navigation",definition:paginationDefinition},
  {level:"composite",family:"navigation",definition:navigationMenuDefinition},
  {level:"composite",family:"navigation",definition:commandPaletteDefinition},
  {level:"composite",family:"overlay",definition:dialogDefinition},
  {level:"composite",family:"overlay",definition:popoverDefinition},
  {level:"composite",family:"overlay",definition:tooltipDefinition},
  {level:"composite",family:"overlay",definition:drawerDefinition},
  {level:"composite",family:"feedback",definition:toastDefinition},
] as const satisfies readonly RegisteredComponent[];
export const definitions=registeredComponents.map(c=>c.definition);
export const examples=[{title:"Getting started",code:'root = Stack([heading, intro, card, action])\nheading = Text("Visual Lab", "default", "title", "h1")\nintro = Text("Your first custom OpenUI document.", "muted")\ncard = Card("Reusable components", "Built with React and registered for OpenUI.")\naction = Button("Try a button")'},...stackExamples,...cardExamples,...textExamples,...markdownExamples,...imageExamples,...dividerExamples,...gridExamples,...iconExamples,...spacerExamples,...buttonExamples,...inputExamples,...textareaExamples,...checkboxExamples,...sliderExamples,...radioGroupExamples,...selectExamples,...badgeExamples,...alertExamples,...progressExamples,...spinnerExamples,...tableExamples,...listExamples,...keyValueExamples,...codeBlockExamples,...chartExamples,...proportionChartExamples,...tabsExamples,...accordionExamples,...collapsibleExamples,...breadcrumbsExamples,...paginationExamples,...navigationMenuExamples,...commandPaletteExamples,...dialogExamples,...popoverExamples,...tooltipExamples,...drawerExamples,...toastExamples];

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
  {level:"primitive",family:"controls",definition:buttonDefinition},
  {level:"primitive",family:"controls",definition:inputDefinition},
  {level:"primitive",family:"controls",definition:textareaDefinition},
  {level:"primitive",family:"controls",definition:checkboxDefinition},
  {level:"primitive",family:"controls",definition:sliderDefinition},
  {level:"primitive",family:"controls",definition:radioGroupDefinition},
  {level:"primitive",family:"controls",definition:selectDefinition},
  {level:"primitive",family:"data-display",definition:imageDefinition},
] as const satisfies readonly RegisteredComponent[];
export const definitions=registeredComponents.map(c=>c.definition);
export const examples=[{title:"Getting started",code:'root = Stack([heading, intro, card, action])\nheading = Text("Visual Lab", "default", "title", "h1")\nintro = Text("Your first custom OpenUI document.", "muted")\ncard = Card("Reusable components", "Built with React and registered for OpenUI.")\naction = Button("Try a button")'},...stackExamples,...cardExamples,...textExamples,...markdownExamples,...imageExamples,...dividerExamples,...gridExamples,...iconExamples,...spacerExamples,...buttonExamples,...inputExamples,...textareaExamples,...checkboxExamples,...sliderExamples,...radioGroupExamples,...selectExamples];

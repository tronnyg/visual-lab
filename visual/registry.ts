import {stackDefinition} from "./components/Stack/Stack.openui";
import {textDefinition} from "./components/Text/Text.openui";
import {cardDefinition} from "./components/Card/Card.openui";
import {buttonDefinition} from "./components/Button/Button.openui";
import {buttonExamples} from "./components/Button/Button.examples";
import {textExamples} from "./components/Text/Text.examples";
import type {defineComponent} from "@openuidev/react-lang";
import type {ComponentClassification} from "./classification";
export type {ComponentLevel,ComponentFamily,ComponentClassification} from "./classification";
export interface RegisteredComponent extends ComponentClassification{definition:ReturnType<typeof defineComponent<any>>}
// Classification is descriptive metadata only; it does not affect rendering or the OpenUI library.
export const registeredComponents=[
  {level:"foundation",family:"layout",definition:stackDefinition},
  {level:"foundation",family:"typography",definition:textDefinition},
  {level:"composite",family:"data-display",definition:cardDefinition},
  {level:"primitive",family:"controls",definition:buttonDefinition},
] as const satisfies readonly RegisteredComponent[];
export const definitions=registeredComponents.map(c=>c.definition);
export const examples=[{title:"Getting started",code:'root = Stack([heading, intro, card, action])\nheading = Text("Visual Lab", "default", "title", "h1")\nintro = Text("Your first custom OpenUI document.", "muted")\ncard = Card("Reusable components", "Built with React and registered for OpenUI.")\naction = Button("Try a button")'},...textExamples,...buttonExamples];

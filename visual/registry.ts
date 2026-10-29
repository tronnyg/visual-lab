import {stackDefinition} from "./components/Stack/Stack.openui";
import {textDefinition} from "./components/Text/Text.openui";
import {cardDefinition} from "./components/Card/Card.openui";
import {buttonDefinition} from "./components/Button/Button.openui";
export const definitions=[stackDefinition,textDefinition,cardDefinition,buttonDefinition];
export const examples=[{title:"Getting started",code:'root = Stack([heading, intro, card, action])\nheading = Text("Visual Lab", "default", "title")\nintro = Text("Your first custom OpenUI document.", "muted")\ncard = Card("Reusable components", "Built with React and registered for OpenUI.")\naction = Button("Try a button")'}];

import {defineComponent} from "@openuidev/react-lang";
import {z} from "zod/v4";
import {Card} from "./Card";
export const cardDefinition=defineComponent({name:"Card",description:"A simple bordered content card with optional heading and body.",props:z.object({title:z.string().optional(),body:z.string().optional()}),component:({props})=><Card {...props}/>});

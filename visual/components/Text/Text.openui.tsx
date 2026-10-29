import {defineComponent} from "@openuidev/react-lang";
import {z} from "zod/v4";
import {Text} from "./Text";
export const textDefinition=defineComponent({name:"Text",description:"Readable text; choose body, heading or title and optionally muted tone.",props:z.object({value:z.string(),tone:z.enum(["default","muted"]).optional(),size:z.enum(["body","title","heading"]).optional()}),component:({props})=><Text {...props}/>});

import {defineComponent} from "@openuidev/react-lang";
import {z} from "zod/v4";
import {Button} from "./Button";
export const buttonDefinition=defineComponent({name:"Button",description:"A button with a visible label. Use for simple actions and interaction testing.",props:z.object({label:z.string(),disabled:z.boolean().optional()}),component:({props})=><Button {...props}/>});

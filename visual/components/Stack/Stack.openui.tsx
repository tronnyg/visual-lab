import {defineComponent} from "@openuidev/react-lang";
import {z} from "zod/v4";
import {Stack} from "./Stack";
export const stackDefinition=defineComponent({name:"Stack",description:"Vertical layout of child components, in order. Use as the root of every document.",props:z.object({children:z.array(z.any()),gap:z.enum(["sm","md","lg"]).optional()}),component:({props,renderNode})=><Stack gap={props.gap}>{renderNode(props.children)}</Stack>});

import {McpServer} from "@modelcontextprotocol/sdk/server/mcp.js";
import {mergeStatements} from "@openuidev/lang-core";
import {z} from "zod";
import {store} from "@/board/store";
import {cleanCode,promptText,validate} from "@/lib/validate";
const reply=(s:string,error=false)=>({content:[{type:"text" as const,text:s}],...(error?{isError:true}:{})});
const boardId=z.string().optional().describe("Board ID, defaults to main");
export function createMcpServer(origin:string){const server=new McpServer({name:"visual-lab",version:"0.1.0"},{instructions:"Visual Lab displays one OpenUI document per board. Read get_instructions, then use display to replace a board document or patch_document to edit statements."});
server.registerTool("get_instructions",{description:"Get OpenUI Lang syntax, components and examples",inputSchema:{},annotations:{readOnlyHint:true}},async()=>reply(promptText));
server.registerTool("list_boards",{description:"List available boards and their IDs",inputSchema:{},annotations:{readOnlyHint:true}},async()=>reply(JSON.stringify(store.list().map(({id,name})=>({id,name})))));
server.registerTool("get_document",{description:"Get the current OpenUI program of a board",inputSchema:{board:boardId},annotations:{readOnlyHint:true}},async({board})=>{const b=store.get(board??"main");return b?reply(JSON.stringify({id:b.id,name:b.name,code:b.code})):reply("Board not found",true)});
server.registerTool("display",{description:"Replace the document on one board with a validated OpenUI program",inputSchema:{board:boardId,code:z.string()}},async({board,code})=>{const b=store.get(board??"main");if(!b)return reply("Unknown board; call list_boards",true);const c=cleanCode(code);const v=validate(c);if(!v.ok)return reply(v.problems.join("\n"),true);store.setCode(b.id,c);return reply(`Displayed on ${b.name}: ${origin}/?board=${encodeURIComponent(b.id)}`)});
server.registerTool("patch_document",{description:"Update named statements in the current document",inputSchema:{board:boardId,code:z.string()}},async({board,code})=>{const b=store.get(board??"main");if(!b||!b.code)return reply("Board has no document",true);const merged=mergeStatements(b.code,cleanCode(code),"root");const v=validate(merged);if(!v.ok)return reply(v.problems.join("\n"),true);store.setCode(b.id,merged);return reply(`Updated ${b.name}`)});
server.registerTool("clear_board",{description:"Clear the document on a board",inputSchema:{board:boardId},annotations:{destructiveHint:true}},async({board})=>{const b=store.get(board??"main");if(!b)return reply("Board not found",true);store.setCode(b.id,"");return reply(`Cleared ${b.name}`)});
server.registerTool("read_events",{description:"Read user actions emitted by rendered components",inputSchema:{board:boardId},annotations:{readOnlyHint:false}},async({board})=>reply(JSON.stringify(store.takeUndelivered(board??"main"))));
return server}

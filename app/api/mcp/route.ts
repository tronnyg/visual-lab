import {WebStandardStreamableHTTPServerTransport} from "@modelcontextprotocol/sdk/server/webStandardStreamableHttp.js";
import {createMcpServer} from "@/mcp/server";
export const dynamic="force-dynamic";export const runtime="nodejs";
async function handle(req:Request){const server=createMcpServer(new URL(req.url).origin);const transport=new WebStandardStreamableHTTPServerTransport({sessionIdGenerator:undefined,enableJsonResponse:true});await server.connect(transport);return transport.handleRequest(req)}
export const GET=handle;export const POST=handle;export const DELETE=handle;

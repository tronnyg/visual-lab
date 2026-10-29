import type { NextConfig } from "next";

const config: NextConfig = {
  // Lets the dev server be opened as 127.0.0.1 as well as localhost.
  allowedDevOrigins: ["127.0.0.1"],
  // The MCP SDK and lang-core run only on the server; keep them out of the bundler.
  serverExternalPackages: ["@modelcontextprotocol/sdk"],
};

export default config;

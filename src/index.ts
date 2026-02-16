#!/usr/bin/env node

/**
 * Dynadot MCP Server
 *
 * A Model Context Protocol server for managing domains, DNS, contacts,
 * transfers, and more via the Dynadot API3.
 *
 * Usage:
 *   DYNADOT_API_KEY=your_key dynadot-mcp
 *   DYNADOT_API_KEY=your_key DYNADOT_SANDBOX=true dynadot-mcp
 */

import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";

import { loadConfig } from "./config.js";
import { DynadotClient } from "./services/dynadot-client.js";
import { registerDomainTools } from "./tools/domain.js";
import { registerDnsTools } from "./tools/dns.js";
import { registerContactTools } from "./tools/contact.js";
import { registerTransferTools } from "./tools/transfer.js";
import { registerSettingsTools } from "./tools/settings.js";
import { registerFolderTools } from "./tools/folder.js";
import { registerAccountTools } from "./tools/account.js";
import { registerMarketplaceTools } from "./tools/marketplace.js";
import { registerAccountResource } from "./resources/account.js";
import { registerDomainsResource } from "./resources/domains.js";

async function main(): Promise<void> {
  const config = loadConfig();
  const client = new DynadotClient(config.apiKey, config.sandbox);

  const server = new McpServer(
    {
      name: "dynadot-mcp",
      version: "1.0.0",
    },
    {
      capabilities: {
        tools: {},
        resources: {},
      },
    }
  );

  // Register tools
  registerDomainTools(server, client);
  registerDnsTools(server, client);
  registerContactTools(server, client);
  registerTransferTools(server, client);
  registerSettingsTools(server, client);
  registerFolderTools(server, client);
  registerAccountTools(server, client);
  registerMarketplaceTools(server, client);

  // Register resources
  registerAccountResource(server, client);
  registerDomainsResource(server, client);

  // Connect via stdio transport
  const transport = new StdioServerTransport();
  await server.connect(transport);

  // Graceful shutdown
  const shutdown = async () => {
    await server.close();
    process.exit(0);
  };

  process.on("SIGINT", shutdown);
  process.on("SIGTERM", shutdown);

  console.error(
    `[dynadot-mcp] Server started (${config.sandbox ? "sandbox" : "production"} mode)`
  );
}

main().catch((error) => {
  console.error("[dynadot-mcp] Fatal error:", error);
  process.exit(1);
});

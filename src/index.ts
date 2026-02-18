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
import { z } from "zod";

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
      version: "1.1.0",
    },
    {
      capabilities: {
        tools: {},
        resources: {},
        prompts: {},
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

  // ════════════════════════════════════════════
  // PROMPTS
  // ════════════════════════════════════════════

  server.prompt(
    "domain_audit",
    "Audit all domains in the account — check expiration dates, DNS health, privacy status, and lock status.",
    {
      urgent_days: z
        .string()
        .optional()
        .describe(
          "Flag domains expiring within this many days as urgent (default: 30)"
        ),
    },
    ({ urgent_days }) => ({
      messages: [
        {
          role: "user" as const,
          content: {
            type: "text" as const,
            text: [
              "Please run a comprehensive audit of all domains in my Dynadot account.",
              "",
              `Urgency threshold: ${urgent_days ?? "30"} days until expiration.`,
              "",
              "Use the following tools and produce a structured report:",
              "",
              "1. Call `list_domains` to retrieve all domains.",
              "2. For each domain, call `get_domain_info` to fetch expiration date, nameservers, lock status, and privacy settings.",
              "3. Call `get_account_balance` to confirm sufficient renewal funds.",
              "",
              "Report format:",
              "## Domain Audit Report",
              "- **Total domains**: N",
              "- **Expiring soon** (within threshold): list with exact expiry dates",
              "- **Already expired / in grace period**: list",
              "- **Privacy OFF**: list domains with WHOIS privacy disabled",
              "- **Unlocked domains**: list domains without transfer lock",
              "- **DNS anomalies**: domains using default Dynadot nameservers vs custom",
              "- **Account balance**: current balance and estimated renewal cost for urgent domains",
              "- **Recommendations**: prioritized action items",
            ].join("\n"),
          },
        },
      ],
    })
  );

  server.prompt(
    "transfer_domain",
    "Guide through the full domain transfer-in process: auth code retrieval, privacy/lock checks, and status monitoring.",
    {
      domain: z.string().describe("The domain name to transfer in (e.g. example.com)"),
    },
    ({ domain }) => ({
      messages: [
        {
          role: "user" as const,
          content: {
            type: "text" as const,
            text: [
              `I want to transfer the domain "${domain}" into my Dynadot account. Please guide me through the process step by step.`,
              "",
              "Follow these steps using the available tools:",
              "",
              "**Pre-transfer checks (at current registrar):**",
              "1. Verify the domain is at least 60 days old and not in a transfer lock.",
              "2. Confirm WHOIS privacy is disabled so the transfer auth email can be received.",
              "3. Obtain the EPP/auth code from the current registrar.",
              "",
              "**Initiate transfer:**",
              "4. Call `get_account_balance` to confirm sufficient funds for the transfer fee.",
              "5. Call `transfer_domain` with the domain name and auth code.",
              "",
              "**Monitor progress:**",
              "6. Call `get_transfer_status` to check the current transfer state.",
              "7. If status is pending_owner_approval, advise the user to approve the transfer email.",
              "8. Call `check_processing` to verify no blocking operations remain.",
              "",
              "**Post-transfer hardening:**",
              "9. Call `lock_domain` to enable transfer lock.",
              "10. Call `set_privacy` with full privacy.",
              "11. Call `get_domain_info` to confirm the final domain state.",
              "",
              "Provide clear status updates and next-action instructions at each step.",
            ].join("\n"),
          },
        },
      ],
    })
  );

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

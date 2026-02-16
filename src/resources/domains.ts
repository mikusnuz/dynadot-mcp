/**
 * Domains Resource
 *
 * Exposes dynadot://domains as an MCP resource.
 */

import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { DynadotClient } from "../services/dynadot-client.js";

export function registerDomainsResource(
  server: McpServer,
  client: DynadotClient
): void {
  server.resource(
    "domains",
    "dynadot://domains",
    {
      description: "List of all domains in the Dynadot account.",
      mimeType: "application/json",
    },
    async () => {
      try {
        const result = await client.listDomains();
        return {
          contents: [
            {
              uri: "dynadot://domains",
              mimeType: "application/json",
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      } catch (error) {
        const msg = error instanceof Error ? error.message : String(error);
        return {
          contents: [
            {
              uri: "dynadot://domains",
              mimeType: "application/json",
              text: JSON.stringify({ error: msg }, null, 2),
            },
          ],
        };
      }
    }
  );
}

/**
 * Account Resources
 *
 * Exposes dynadot://account and dynadot://balance as MCP resources.
 */

import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { DynadotClient } from "../services/dynadot-client.js";

export function registerAccountResource(
  server: McpServer,
  client: DynadotClient
): void {
  server.resource(
    "account",
    "dynadot://account",
    {
      description: "Dynadot account information including username and settings.",
      mimeType: "application/json",
    },
    async () => {
      try {
        const result = await client.getAccountInfo();
        return {
          contents: [
            {
              uri: "dynadot://account",
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
              uri: "dynadot://account",
              mimeType: "application/json",
              text: JSON.stringify({ error: msg }, null, 2),
            },
          ],
        };
      }
    }
  );

  server.resource(
    "balance",
    "dynadot://balance",
    {
      description: "Current Dynadot account balance.",
      mimeType: "application/json",
    },
    async () => {
      try {
        const result = await client.getAccountBalance();
        return {
          contents: [
            {
              uri: "dynadot://balance",
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
              uri: "dynadot://balance",
              mimeType: "application/json",
              text: JSON.stringify({ error: msg }, null, 2),
            },
          ],
        };
      }
    }
  );
}

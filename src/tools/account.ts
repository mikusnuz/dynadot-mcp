/**
 * Account Tools
 *
 * MCP tools for account management:
 * - get_account_info: Get account details
 * - get_account_balance: Check account balance
 * - set_account_defaults: Set default account settings
 */

import { z } from "zod";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { DynadotClient } from "../services/dynadot-client.js";

export function registerAccountTools(
  server: McpServer,
  client: DynadotClient
): void {
  // ─── get_account_info ─────────────────────────────────────────

  server.tool(
    "get_account_info",
    "Get Dynadot account information including username, email, and settings.",
    {},
    async () => {
      try {
        const result = await client.getAccountInfo();
        return {
          content: [
            { type: "text" as const, text: JSON.stringify(result, null, 2) },
          ],
        };
      } catch (error) {
        const msg = error instanceof Error ? error.message : String(error);
        return {
          content: [
            { type: "text" as const, text: `Failed to get account info: ${msg}` },
          ],
          isError: true,
        };
      }
    }
  );

  // ─── get_account_balance ──────────────────────────────────────

  server.tool(
    "get_account_balance",
    "Check the current account balance available for domain purchases and renewals.",
    {},
    async () => {
      try {
        const result = await client.getAccountBalance();
        return {
          content: [
            { type: "text" as const, text: JSON.stringify(result, null, 2) },
          ],
        };
      } catch (error) {
        const msg = error instanceof Error ? error.message : String(error);
        return {
          content: [
            { type: "text" as const, text: `Failed to get balance: ${msg}` },
          ],
          isError: true,
        };
      }
    }
  );

  // ─── set_account_defaults ─────────────────────────────────────

  server.tool(
    "set_account_defaults",
    "Set default account settings for new domain registrations. Supports " +
      "default WHOIS contacts, nameservers, DNS, parking, forwarding, " +
      "stealth, hosting, email forwarding, and renewal options.",
    {
      setting_type: z
        .enum(["whois", "ns", "dns2", "parking", "forwarding", "stealth", "hosting", "email_forward", "renew_option", "clear"])
        .describe(
          "Type of default setting: 'whois', 'ns', 'dns2', 'parking', " +
            "'forwarding', 'stealth', 'hosting', 'email_forward', " +
            "'renew_option', or 'clear' (remove defaults)"
        ),
      params: z
        .record(z.string())
        .optional()
        .describe("Setting parameters as key-value pairs (varies by type)"),
    },
    async ({ setting_type, params }) => {
      try {
        const command =
          setting_type === "clear"
            ? "set_clear_default_setting"
            : `set_default_${setting_type}`;
        const result = await client.call(command, params || {});
        return {
          content: [
            { type: "text" as const, text: JSON.stringify(result, null, 2) },
          ],
        };
      } catch (error) {
        const msg = error instanceof Error ? error.message : String(error);
        return {
          content: [
            { type: "text" as const, text: `Failed to set defaults: ${msg}` },
          ],
          isError: true,
        };
      }
    }
  );
}

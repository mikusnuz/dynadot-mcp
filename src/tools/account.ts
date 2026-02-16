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

  // ─── list_orders ──────────────────────────────────────────────

  server.tool(
    "list_orders",
    "List all orders (purchases, renewals, transfers) in the account history.",
    {},
    async () => {
      try {
        const result = await client.listOrders();
        return {
          content: [
            { type: "text" as const, text: JSON.stringify(result, null, 2) },
          ],
        };
      } catch (error) {
        const msg = error instanceof Error ? error.message : String(error);
        return {
          content: [
            { type: "text" as const, text: `Failed to list orders: ${msg}` },
          ],
          isError: true,
        };
      }
    }
  );

  // ─── get_order_status ─────────────────────────────────────────

  server.tool(
    "get_order_status",
    "Check the status of a specific order by ID.",
    {
      order_id: z.string().describe("Order ID to check"),
    },
    async ({ order_id }) => {
      try {
        const result = await client.getOrderStatus(order_id);
        return {
          content: [
            { type: "text" as const, text: JSON.stringify(result, null, 2) },
          ],
        };
      } catch (error) {
        const msg = error instanceof Error ? error.message : String(error);
        return {
          content: [
            { type: "text" as const, text: `Failed to get order status: ${msg}` },
          ],
          isError: true,
        };
      }
    }
  );

  // ─── check_processing ─────────────────────────────────────────

  server.tool(
    "check_processing",
    "Check if there are any pending/processing operations on the account.",
    {},
    async () => {
      try {
        const result = await client.isProcessing();
        return {
          content: [
            { type: "text" as const, text: JSON.stringify(result, null, 2) },
          ],
        };
      } catch (error) {
        const msg = error instanceof Error ? error.message : String(error);
        return {
          content: [
            { type: "text" as const, text: `Failed to check processing: ${msg}` },
          ],
          isError: true,
        };
      }
    }
  );

  // ─── list_coupons ─────────────────────────────────────────────

  server.tool(
    "list_coupons",
    "List all available coupon codes on the account.",
    {},
    async () => {
      try {
        const result = await client.listCoupons();
        return {
          content: [
            { type: "text" as const, text: JSON.stringify(result, null, 2) },
          ],
        };
      } catch (error) {
        const msg = error instanceof Error ? error.message : String(error);
        return {
          content: [
            { type: "text" as const, text: `Failed to list coupons: ${msg}` },
          ],
          isError: true,
        };
      }
    }
  );

  // ─── get_tld_price ────────────────────────────────────────────

  server.tool(
    "get_tld_price",
    "Get pricing information for TLDs (top-level domains). Returns registration, " +
      "renewal, and transfer prices.",
    {
      currency: z
        .string()
        .optional()
        .describe("Currency for pricing (e.g., 'USD', 'EUR')"),
      count_per_page: z
        .number()
        .int()
        .optional()
        .describe("Number of results per page"),
      page_index: z
        .number()
        .int()
        .optional()
        .describe("Page index (0-based)"),
    },
    async ({ currency, count_per_page, page_index }) => {
      try {
        const result = await client.getTldPrice({
          currency,
          countPerPage: count_per_page,
          pageIndex: page_index,
        });
        return {
          content: [
            { type: "text" as const, text: JSON.stringify(result, null, 2) },
          ],
        };
      } catch (error) {
        const msg = error instanceof Error ? error.message : String(error);
        return {
          content: [
            { type: "text" as const, text: `Failed to get TLD prices: ${msg}` },
          ],
          isError: true,
        };
      }
    }
  );
}

/**
 * Transfer Tools
 *
 * MCP tools for domain transfer operations:
 * - transfer_domain: Initiate a domain transfer
 * - cancel_transfer: Cancel a pending transfer
 * - get_transfer_status: Check transfer status
 * - get_auth_code: Get transfer authorization code
 * - authorize_transfer_away: Approve an outgoing transfer
 */

import { z } from "zod";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { DynadotClient } from "../services/dynadot-client.js";

export function registerTransferTools(
  server: McpServer,
  client: DynadotClient
): void {
  // ─── transfer_domain ──────────────────────────────────────────

  server.tool(
    "transfer_domain",
    "Initiate a domain transfer into your Dynadot account. Requires the " +
      "domain name and the authorization/EPP code from the current registrar.",
    {
      domain: z.string().describe("Domain name to transfer (e.g., 'example.com')"),
      auth_code: z.string().describe("Authorization/EPP code from the current registrar"),
      registrant_contact: z
        .string()
        .optional()
        .describe("Contact ID to use as registrant"),
      coupon: z.string().optional().describe("Coupon code for discount"),
    },
    async ({ domain, auth_code, registrant_contact, coupon }) => {
      try {
        const result = await client.transfer(domain, auth_code, {
          registrantContact: registrant_contact,
          coupon,
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
            { type: "text" as const, text: `Domain transfer failed: ${msg}` },
          ],
          isError: true,
        };
      }
    }
  );

  // ─── cancel_transfer ──────────────────────────────────────────

  server.tool(
    "cancel_transfer",
    "Cancel a pending domain transfer.",
    {
      domain: z.string().describe("Domain name to cancel transfer for"),
    },
    async ({ domain }) => {
      try {
        const result = await client.cancelTransfer(domain);
        return {
          content: [
            { type: "text" as const, text: JSON.stringify(result, null, 2) },
          ],
        };
      } catch (error) {
        const msg = error instanceof Error ? error.message : String(error);
        return {
          content: [
            { type: "text" as const, text: `Cancel transfer failed: ${msg}` },
          ],
          isError: true,
        };
      }
    }
  );

  // ─── get_transfer_status ──────────────────────────────────────

  server.tool(
    "get_transfer_status",
    "Check the current status of a domain transfer.",
    {
      domain: z.string().describe("Domain name to check transfer status for"),
    },
    async ({ domain }) => {
      try {
        const result = await client.getTransferStatus(domain);
        return {
          content: [
            { type: "text" as const, text: JSON.stringify(result, null, 2) },
          ],
        };
      } catch (error) {
        const msg = error instanceof Error ? error.message : String(error);
        return {
          content: [
            { type: "text" as const, text: `Failed to get transfer status: ${msg}` },
          ],
          isError: true,
        };
      }
    }
  );

  // ─── get_auth_code ────────────────────────────────────────────

  server.tool(
    "get_auth_code",
    "Get the transfer authorization (EPP) code for a domain. This code is " +
      "needed to transfer the domain to another registrar.",
    {
      domain: z.string().describe("Domain name to get the auth code for"),
    },
    async ({ domain }) => {
      try {
        const result = await client.getTransferAuthCode(domain);
        return {
          content: [
            { type: "text" as const, text: JSON.stringify(result, null, 2) },
          ],
        };
      } catch (error) {
        const msg = error instanceof Error ? error.message : String(error);
        return {
          content: [
            { type: "text" as const, text: `Failed to get auth code: ${msg}` },
          ],
          isError: true,
        };
      }
    }
  );

  // ─── authorize_transfer_away ──────────────────────────────────

  server.tool(
    "authorize_transfer_away",
    "Approve an outgoing domain transfer to another registrar.",
    {
      domain: z.string().describe("Domain name to authorize for transfer away"),
    },
    async ({ domain }) => {
      try {
        const result = await client.authorizeTransferAway(domain);
        return {
          content: [
            { type: "text" as const, text: JSON.stringify(result, null, 2) },
          ],
        };
      } catch (error) {
        const msg = error instanceof Error ? error.message : String(error);
        return {
          content: [
            { type: "text" as const, text: `Failed to authorize transfer: ${msg}` },
          ],
          isError: true,
        };
      }
    }
  );
}

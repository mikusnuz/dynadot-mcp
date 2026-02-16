/**
 * Settings Tools
 *
 * MCP tools for domain settings:
 * - set_privacy: Set WHOIS privacy
 * - set_whois_contacts: Set WHOIS contact info
 * - set_forwarding: Set URL forwarding or stealth forwarding
 * - set_renew_option: Set auto-renewal option
 * - lock_domain: Lock/unlock domain
 * - set_domain_note: Set domain note and/or folder
 */

import { z } from "zod";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { DynadotClient } from "../services/dynadot-client.js";

export function registerSettingsTools(
  server: McpServer,
  client: DynadotClient
): void {
  // ─── set_privacy ──────────────────────────────────────────────

  server.tool(
    "set_privacy",
    "Set WHOIS privacy for a domain. Options: 'full' (hide all info), " +
      "'partial' (hide some info), 'off' (show all info).",
    {
      domain: z.string().describe("Domain name to set privacy for"),
      option: z
        .enum(["full", "partial", "off"])
        .describe("Privacy level: 'full', 'partial', or 'off'"),
    },
    async ({ domain, option }) => {
      try {
        const result = await client.setPrivacy(domain, option);
        return {
          content: [
            { type: "text" as const, text: JSON.stringify(result, null, 2) },
          ],
        };
      } catch (error) {
        const msg = error instanceof Error ? error.message : String(error);
        return {
          content: [
            { type: "text" as const, text: `Failed to set privacy: ${msg}` },
          ],
          isError: true,
        };
      }
    }
  );

  // ─── set_whois_contacts ───────────────────────────────────────

  server.tool(
    "set_whois_contacts",
    "Set WHOIS contact information for a domain. Specify contact IDs for " +
      "registrant, admin, technical, and/or billing contacts.",
    {
      domain: z.string().describe("Domain name to update"),
      registrant_contact: z
        .string()
        .optional()
        .describe("Contact ID for the registrant"),
      admin_contact: z
        .string()
        .optional()
        .describe("Contact ID for the admin contact"),
      technical_contact: z
        .string()
        .optional()
        .describe("Contact ID for the technical contact"),
      billing_contact: z
        .string()
        .optional()
        .describe("Contact ID for the billing contact"),
    },
    async ({ domain, registrant_contact, admin_contact, technical_contact, billing_contact }) => {
      try {
        const contacts: Record<string, string> = {};
        if (registrant_contact) contacts.registrant_contact = registrant_contact;
        if (admin_contact) contacts.admin_contact = admin_contact;
        if (technical_contact) contacts.technical_contact = technical_contact;
        if (billing_contact) contacts.billing_contact = billing_contact;
        const result = await client.setWhoisContacts(domain, contacts);
        return {
          content: [
            { type: "text" as const, text: JSON.stringify(result, null, 2) },
          ],
        };
      } catch (error) {
        const msg = error instanceof Error ? error.message : String(error);
        return {
          content: [
            { type: "text" as const, text: `Failed to set WHOIS contacts: ${msg}` },
          ],
          isError: true,
        };
      }
    }
  );

  // ─── set_forwarding ───────────────────────────────────────────

  server.tool(
    "set_forwarding",
    "Set URL forwarding for a domain. Supports standard forwarding (301/302 " +
      "redirect) and stealth forwarding (iframe with custom title).",
    {
      domain: z.string().describe("Domain name to set forwarding for"),
      url: z.string().describe("Target URL to forward to"),
      stealth: z
        .boolean()
        .optional()
        .describe("Use stealth forwarding (iframe) instead of redirect"),
      stealth_title: z
        .string()
        .optional()
        .describe("Page title for stealth forwarding"),
      is_temporary: z
        .boolean()
        .optional()
        .describe("Use 302 (temporary) redirect instead of 301 (permanent)"),
    },
    async ({ domain, url, stealth, stealth_title, is_temporary }) => {
      try {
        let result;
        if (stealth) {
          result = await client.setStealth(domain, url, stealth_title);
        } else {
          result = await client.setForwarding(domain, url, is_temporary);
        }
        return {
          content: [
            { type: "text" as const, text: JSON.stringify(result, null, 2) },
          ],
        };
      } catch (error) {
        const msg = error instanceof Error ? error.message : String(error);
        return {
          content: [
            { type: "text" as const, text: `Failed to set forwarding: ${msg}` },
          ],
          isError: true,
        };
      }
    }
  );

  // ─── set_renew_option ─────────────────────────────────────────

  server.tool(
    "set_renew_option",
    "Set the auto-renewal option for a domain.",
    {
      domain: z.string().describe("Domain name to configure"),
      option: z
        .enum(["auto", "donot", "reset"])
        .describe(
          "Renewal option: 'auto' (auto-renew), 'donot' (do not renew), " +
            "'reset' (reset to default)"
        ),
    },
    async ({ domain, option }) => {
      try {
        const result = await client.setRenewOption(domain, option);
        return {
          content: [
            { type: "text" as const, text: JSON.stringify(result, null, 2) },
          ],
        };
      } catch (error) {
        const msg = error instanceof Error ? error.message : String(error);
        return {
          content: [
            { type: "text" as const, text: `Failed to set renew option: ${msg}` },
          ],
          isError: true,
        };
      }
    }
  );

  // ─── lock_domain ──────────────────────────────────────────────

  server.tool(
    "lock_domain",
    "Lock a domain to prevent unauthorized transfers. This enables the " +
      "registrar lock (clientTransferProhibited).",
    {
      domain: z.string().describe("Domain name to lock"),
    },
    async ({ domain }) => {
      try {
        const result = await client.lockDomain(domain);
        return {
          content: [
            { type: "text" as const, text: JSON.stringify(result, null, 2) },
          ],
        };
      } catch (error) {
        const msg = error instanceof Error ? error.message : String(error);
        return {
          content: [
            { type: "text" as const, text: `Failed to lock domain: ${msg}` },
          ],
          isError: true,
        };
      }
    }
  );

  // ─── set_domain_note ──────────────────────────────────────────

  server.tool(
    "set_domain_note",
    "Set a note and/or move a domain to a folder for organization.",
    {
      domain: z.string().describe("Domain name to update"),
      note: z.string().optional().describe("Note to attach to the domain"),
      folder: z.string().optional().describe("Folder name or ID to move the domain into"),
    },
    async ({ domain, note, folder }) => {
      try {
        const results: unknown[] = [];
        if (note !== undefined) {
          results.push(await client.setNote(domain, note));
        }
        if (folder !== undefined) {
          results.push(await client.setFolder(domain, folder));
        }
        return {
          content: [
            {
              type: "text" as const,
              text: JSON.stringify(
                results.length === 1 ? results[0] : results,
                null,
                2
              ),
            },
          ],
        };
      } catch (error) {
        const msg = error instanceof Error ? error.message : String(error);
        return {
          content: [
            { type: "text" as const, text: `Failed to set domain note/folder: ${msg}` },
          ],
          isError: true,
        };
      }
    }
  );
}

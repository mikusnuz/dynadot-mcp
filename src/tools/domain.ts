/**
 * Domain Tools
 *
 * MCP tools for domain operations:
 * - search_domain: Check domain availability
 * - register_domain: Register a domain
 * - bulk_register_domains: Register multiple domains
 * - get_domain_info: Get domain details
 * - list_domains: List all domains
 * - renew_domain: Renew a domain
 * - delete_domain: Delete a domain (grace period)
 */

import { z } from "zod";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { DynadotClient } from "../services/dynadot-client.js";

export function registerDomainTools(
  server: McpServer,
  client: DynadotClient
): void {
  // ─── search_domain ────────────────────────────────────────────

  server.tool(
    "search_domain",
    "Check domain availability. Supports up to 100 domains at once. " +
      "Returns availability status and optionally pricing for each domain.",
    {
      domains: z
        .array(z.string())
        .min(1)
        .max(100)
        .describe("List of domain names to check (e.g., ['example.com', 'example.net'])"),
      show_price: z
        .boolean()
        .optional()
        .describe("Include pricing information in results"),
      currency: z
        .string()
        .optional()
        .describe("Currency for pricing (e.g., 'USD', 'EUR')"),
    },
    async ({ domains, show_price, currency }) => {
      try {
        const result = await client.search(domains, {
          showPrice: show_price,
          currency,
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
            { type: "text" as const, text: `Domain search failed: ${msg}` },
          ],
          isError: true,
        };
      }
    }
  );

  // ─── register_domain ──────────────────────────────────────────

  server.tool(
    "register_domain",
    "Register a new domain name. Duration is in years (1-10). " +
      "Optionally specify a registrant contact ID and coupon code.",
    {
      domain: z.string().describe("Domain name to register (e.g., 'example.com')"),
      duration: z
        .number()
        .int()
        .min(1)
        .max(10)
        .describe("Registration duration in years"),
      registrant_contact: z
        .string()
        .optional()
        .describe("Contact ID to use as registrant"),
      currency: z
        .string()
        .optional()
        .describe("Currency for payment (e.g., 'USD')"),
      coupon: z.string().optional().describe("Coupon code for discount"),
    },
    async ({ domain, duration, registrant_contact, currency, coupon }) => {
      try {
        const result = await client.register(domain, duration, {
          registrantContact: registrant_contact,
          currency,
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
            { type: "text" as const, text: `Domain registration failed: ${msg}` },
          ],
          isError: true,
        };
      }
    }
  );

  // ─── bulk_register_domains ────────────────────────────────────

  server.tool(
    "bulk_register_domains",
    "Register multiple domains at once (up to 100). All domains are registered " +
      "with default settings unless overridden.",
    {
      domains: z
        .array(z.string())
        .min(1)
        .max(100)
        .describe("List of domain names to register"),
      currency: z.string().optional().describe("Currency for payment"),
      coupon: z.string().optional().describe("Coupon code for discount"),
    },
    async ({ domains, currency, coupon }) => {
      try {
        const result = await client.bulkRegister(domains, { currency, coupon });
        return {
          content: [
            { type: "text" as const, text: JSON.stringify(result, null, 2) },
          ],
        };
      } catch (error) {
        const msg = error instanceof Error ? error.message : String(error);
        return {
          content: [
            { type: "text" as const, text: `Bulk registration failed: ${msg}` },
          ],
          isError: true,
        };
      }
    }
  );

  // ─── get_domain_info ──────────────────────────────────────────

  server.tool(
    "get_domain_info",
    "Get detailed information about a domain including expiry date, nameservers, " +
      "WHOIS contacts, privacy status, lock status, and more.",
    {
      domain: z.string().describe("Domain name to query (e.g., 'example.com')"),
    },
    async ({ domain }) => {
      try {
        const result = await client.getDomainInfo(domain);
        return {
          content: [
            { type: "text" as const, text: JSON.stringify(result, null, 2) },
          ],
        };
      } catch (error) {
        const msg = error instanceof Error ? error.message : String(error);
        return {
          content: [
            { type: "text" as const, text: `Failed to get domain info: ${msg}` },
          ],
          isError: true,
        };
      }
    }
  );

  // ─── list_domains ─────────────────────────────────────────────

  server.tool(
    "list_domains",
    "List all domains in the Dynadot account with basic information.",
    {},
    async () => {
      try {
        const result = await client.listDomains();
        return {
          content: [
            { type: "text" as const, text: JSON.stringify(result, null, 2) },
          ],
        };
      } catch (error) {
        const msg = error instanceof Error ? error.message : String(error);
        return {
          content: [
            { type: "text" as const, text: `Failed to list domains: ${msg}` },
          ],
          isError: true,
        };
      }
    }
  );

  // ─── renew_domain ─────────────────────────────────────────────

  server.tool(
    "renew_domain",
    "Renew an existing domain registration. Duration is in years.",
    {
      domain: z.string().describe("Domain name to renew"),
      duration: z
        .number()
        .int()
        .min(1)
        .max(10)
        .describe("Renewal duration in years"),
      coupon: z.string().optional().describe("Coupon code for discount"),
      price_check: z
        .boolean()
        .optional()
        .describe("Only check the renewal price without renewing"),
    },
    async ({ domain, duration, coupon, price_check }) => {
      try {
        const result = await client.renewDomain(domain, duration, {
          coupon,
          priceCheck: price_check,
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
            { type: "text" as const, text: `Domain renewal failed: ${msg}` },
          ],
          isError: true,
        };
      }
    }
  );

  // ─── delete_domain ────────────────────────────────────────────

  server.tool(
    "delete_domain",
    "Delete a domain during its grace period. This action cannot be undone " +
      "after the grace period expires.",
    {
      domain: z.string().describe("Domain name to delete"),
    },
    async ({ domain }) => {
      try {
        const result = await client.deleteDomain(domain);
        return {
          content: [
            { type: "text" as const, text: JSON.stringify(result, null, 2) },
          ],
        };
      } catch (error) {
        const msg = error instanceof Error ? error.message : String(error);
        return {
          content: [
            { type: "text" as const, text: `Domain deletion failed: ${msg}` },
          ],
          isError: true,
        };
      }
    }
  );

  // ─── restore_domain ───────────────────────────────────────────

  server.tool(
    "restore_domain",
    "Restore a recently deleted domain from the redemption grace period.",
    {
      domain: z.string().describe("Domain name to restore"),
    },
    async ({ domain }) => {
      try {
        const result = await client.restoreDomain(domain);
        return {
          content: [
            { type: "text" as const, text: JSON.stringify(result, null, 2) },
          ],
        };
      } catch (error) {
        const msg = error instanceof Error ? error.message : String(error);
        return {
          content: [
            { type: "text" as const, text: `Domain restore failed: ${msg}` },
          ],
          isError: true,
        };
      }
    }
  );

  // ─── push_domain ──────────────────────────────────────────────

  server.tool(
    "push_domain",
    "Push (transfer) a domain to another Dynadot account by username.",
    {
      domain: z.string().describe("Domain name to push"),
      receiver: z.string().describe("Recipient's Dynadot push username"),
      unlock: z
        .boolean()
        .optional()
        .describe("Unlock the domain before pushing (if locked)"),
    },
    async ({ domain, receiver, unlock }) => {
      try {
        const result = await client.pushDomain(domain, receiver, unlock);
        return {
          content: [
            { type: "text" as const, text: JSON.stringify(result, null, 2) },
          ],
        };
      } catch (error) {
        const msg = error instanceof Error ? error.message : String(error);
        return {
          content: [
            { type: "text" as const, text: `Domain push failed: ${msg}` },
          ],
          isError: true,
        };
      }
    }
  );
}

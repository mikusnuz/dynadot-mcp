/**
 * DNS Tools
 *
 * MCP tools for DNS management:
 * - get_dns: Get DNS records
 * - set_dns: Set DNS records
 * - set_nameservers: Set nameservers
 * - get_nameservers: Get nameservers
 * - register_nameserver: Register a custom nameserver
 * - get_dnssec: Get DNSSEC settings
 * - set_dnssec: Set or clear DNSSEC
 */

import { z } from "zod";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { DynadotClient } from "../services/dynadot-client.js";

export function registerDnsTools(
  server: McpServer,
  client: DynadotClient
): void {
  // ─── get_dns ──────────────────────────────────────────────────

  server.tool(
    "get_dns",
    "Get all DNS records for a domain, including A, AAAA, CNAME, MX, TXT, " +
      "SRV records, and subdomains.",
    {
      domain: z.string().describe("Domain name to query DNS records for"),
    },
    async ({ domain }) => {
      try {
        const result = await client.getDns(domain);
        return {
          content: [
            { type: "text" as const, text: JSON.stringify(result, null, 2) },
          ],
        };
      } catch (error) {
        const msg = error instanceof Error ? error.message : String(error);
        return {
          content: [
            { type: "text" as const, text: `Failed to get DNS records: ${msg}` },
          ],
          isError: true,
        };
      }
    }
  );

  // ─── set_dns ──────────────────────────────────────────────────

  server.tool(
    "set_dns",
    "Set DNS records for a domain using Dynadot's DNS service. Supports " +
      "main records and up to 10 subdomains. Use the records parameter " +
      "to pass Dynadot API parameters like main_record_type, main_record, " +
      "subdomain0, sub_record_type0, sub_record0, etc.",
    {
      domain: z.string().describe("Domain name to set DNS for"),
      records: z
        .record(z.string())
        .describe(
          "DNS record parameters as key-value pairs. Keys follow Dynadot API naming: " +
            "main_record_type (a/aaaa/cname/forward/txt/mx/stealth), main_record (value), " +
            "subdomain0 (name), sub_record_type0 (type), sub_record0 (value), " +
            "mx_host0/mx_priority0, ttl (optional, default 300)"
        ),
    },
    async ({ domain, records }) => {
      try {
        const result = await client.setDns(domain, records);
        return {
          content: [
            { type: "text" as const, text: JSON.stringify(result, null, 2) },
          ],
        };
      } catch (error) {
        const msg = error instanceof Error ? error.message : String(error);
        return {
          content: [
            { type: "text" as const, text: `Failed to set DNS records: ${msg}` },
          ],
          isError: true,
        };
      }
    }
  );

  // ─── set_nameservers ──────────────────────────────────────────

  server.tool(
    "set_nameservers",
    "Set nameservers for a domain. Accepts up to 13 nameserver hostnames.",
    {
      domain: z.string().describe("Domain name to configure"),
      nameservers: z
        .array(z.string())
        .min(1)
        .max(13)
        .describe("List of nameserver hostnames (e.g., ['ns1.example.com', 'ns2.example.com'])"),
    },
    async ({ domain, nameservers }) => {
      try {
        const result = await client.setNameservers(domain, nameservers);
        return {
          content: [
            { type: "text" as const, text: JSON.stringify(result, null, 2) },
          ],
        };
      } catch (error) {
        const msg = error instanceof Error ? error.message : String(error);
        return {
          content: [
            { type: "text" as const, text: `Failed to set nameservers: ${msg}` },
          ],
          isError: true,
        };
      }
    }
  );

  // ─── get_nameservers ──────────────────────────────────────────

  server.tool(
    "get_nameservers",
    "Get the current nameservers configured for a domain.",
    {
      domain: z.string().describe("Domain name to query"),
    },
    async ({ domain }) => {
      try {
        const result = await client.getNameservers(domain);
        return {
          content: [
            { type: "text" as const, text: JSON.stringify(result, null, 2) },
          ],
        };
      } catch (error) {
        const msg = error instanceof Error ? error.message : String(error);
        return {
          content: [
            { type: "text" as const, text: `Failed to get nameservers: ${msg}` },
          ],
          isError: true,
        };
      }
    }
  );

  // ─── register_nameserver ──────────────────────────────────────

  server.tool(
    "register_nameserver",
    "Register a custom nameserver (glue record) with a hostname and IP address.",
    {
      host: z.string().describe("Nameserver hostname (e.g., 'ns1.example.com')"),
      ip: z.string().describe("IP address for the nameserver"),
    },
    async ({ host, ip }) => {
      try {
        const result = await client.registerNameserver(host, ip);
        return {
          content: [
            { type: "text" as const, text: JSON.stringify(result, null, 2) },
          ],
        };
      } catch (error) {
        const msg = error instanceof Error ? error.message : String(error);
        return {
          content: [
            { type: "text" as const, text: `Failed to register nameserver: ${msg}` },
          ],
          isError: true,
        };
      }
    }
  );

  // ─── get_dnssec ───────────────────────────────────────────────

  server.tool(
    "get_dnssec",
    "Get DNSSEC (Domain Name System Security Extensions) settings for a domain.",
    {
      domain: z.string().describe("Domain name to query DNSSEC for"),
    },
    async ({ domain }) => {
      try {
        const result = await client.getDnssec(domain);
        return {
          content: [
            { type: "text" as const, text: JSON.stringify(result, null, 2) },
          ],
        };
      } catch (error) {
        const msg = error instanceof Error ? error.message : String(error);
        return {
          content: [
            { type: "text" as const, text: `Failed to get DNSSEC: ${msg}` },
          ],
          isError: true,
        };
      }
    }
  );

  // ─── set_dnssec ───────────────────────────────────────────────

  server.tool(
    "set_dnssec",
    "Set or clear DNSSEC for a domain. To enable, provide flags, algorithm, " +
      "and public_key. To disable, set clear to true.",
    {
      domain: z.string().describe("Domain name to configure DNSSEC for"),
      clear: z
        .boolean()
        .optional()
        .describe("Set to true to remove DNSSEC from the domain"),
      flags: z
        .string()
        .optional()
        .describe("DNSSEC flags (e.g., '257' for KSK)"),
      algorithm: z
        .string()
        .optional()
        .describe("DNSSEC algorithm number (e.g., '13' for ECDSAP256SHA256)"),
      public_key: z
        .string()
        .optional()
        .describe("DNSSEC public key"),
    },
    async ({ domain, clear, flags, algorithm, public_key }) => {
      try {
        if (clear) {
          const result = await client.clearDnssec(domain);
          return {
            content: [
              { type: "text" as const, text: JSON.stringify(result, null, 2) },
            ],
          };
        }
        const params: Record<string, string> = {};
        if (flags) params.flags = flags;
        if (algorithm) params.algorithm = algorithm;
        if (public_key) params.public_key = public_key;
        const result = await client.setDnssec(domain, params);
        return {
          content: [
            { type: "text" as const, text: JSON.stringify(result, null, 2) },
          ],
        };
      } catch (error) {
        const msg = error instanceof Error ? error.message : String(error);
        return {
          content: [
            { type: "text" as const, text: `Failed to set DNSSEC: ${msg}` },
          ],
          isError: true,
        };
      }
    }
  );

  // ─── add_nameserver ───────────────────────────────────────────

  server.tool(
    "add_nameserver",
    "Add (create) a new nameserver entry with a hostname and IP address.",
    {
      host: z.string().describe("Nameserver hostname (e.g., 'ns1.example.com')"),
      ip: z.string().describe("IP address for the nameserver"),
    },
    async ({ host, ip }) => {
      try {
        const result = await client.addNameserver(host, ip);
        return {
          content: [
            { type: "text" as const, text: JSON.stringify(result, null, 2) },
          ],
        };
      } catch (error) {
        const msg = error instanceof Error ? error.message : String(error);
        return {
          content: [
            { type: "text" as const, text: `Failed to add nameserver: ${msg}` },
          ],
          isError: true,
        };
      }
    }
  );

  // ─── set_nameserver_ip ────────────────────────────────────────

  server.tool(
    "set_nameserver_ip",
    "Update the IP address of an existing registered nameserver.",
    {
      host: z.string().describe("Nameserver hostname to update"),
      ip: z.string().describe("New IP address"),
    },
    async ({ host, ip }) => {
      try {
        const result = await client.setNameserverIp(host, ip);
        return {
          content: [
            { type: "text" as const, text: JSON.stringify(result, null, 2) },
          ],
        };
      } catch (error) {
        const msg = error instanceof Error ? error.message : String(error);
        return {
          content: [
            { type: "text" as const, text: `Failed to update nameserver IP: ${msg}` },
          ],
          isError: true,
        };
      }
    }
  );

  // ─── delete_nameserver ────────────────────────────────────────

  server.tool(
    "delete_nameserver",
    "Delete a registered nameserver by hostname, or delete all nameservers " +
      "associated with a domain.",
    {
      host: z
        .string()
        .optional()
        .describe("Nameserver hostname to delete"),
      domain: z
        .string()
        .optional()
        .describe("Delete all nameservers for this domain instead"),
    },
    async ({ host, domain }) => {
      try {
        let result;
        if (domain) {
          result = await client.deleteNameserverByDomain(domain);
        } else if (host) {
          result = await client.deleteNameserver(host);
        } else {
          return {
            content: [
              { type: "text" as const, text: "Either host or domain is required" },
            ],
            isError: true,
          };
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
            { type: "text" as const, text: `Failed to delete nameserver: ${msg}` },
          ],
          isError: true,
        };
      }
    }
  );

  // ─── list_registered_nameservers ──────────────────────────────

  server.tool(
    "list_registered_nameservers",
    "List all registered (custom) nameservers in the account.",
    {},
    async () => {
      try {
        const result = await client.listRegisteredNameservers();
        return {
          content: [
            { type: "text" as const, text: JSON.stringify(result, null, 2) },
          ],
        };
      } catch (error) {
        const msg = error instanceof Error ? error.message : String(error);
        return {
          content: [
            { type: "text" as const, text: `Failed to list nameservers: ${msg}` },
          ],
          isError: true,
        };
      }
    }
  );
}

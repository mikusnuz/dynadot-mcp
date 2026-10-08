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
      "main records and up to 100 subdomain records. Use the records parameter " +
      "to pass Dynadot API parameters like main_record_type0, main_record0, " +
      "subdomain0, sub_record_type0, sub_record0, etc.",
    {
      domain: z.string().describe("Domain name to set DNS for"),
      records: z
        .record(z.string())
        .describe(
          "DNS record parameters as key-value pairs. Keys follow Dynadot API3 set_dns2 naming: " +
            "main_record_type0..19 (a/aaaa/cname/forward/txt/mx/stealth/email), " +
            "main_record0..19 (value), main_recordx0..19 (MX distance/forward type/stealth title/email alias), " +
            "subdomain0..99 (name), sub_record_type0..99 (type), sub_record0..99 (value), " +
            "sub_recordx0..99 (MX distance etc), ttl (optional, default 300), " +
            "add_dns_to_current_setting (optional, set to '1' to append instead of overwrite)"
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
    "Set or clear DNSSEC for a domain. Provide either a DS record " +
      "(key_tag, digest_type, digest, algorithm) or a DNSKEY " +
      "(flags, public_key, algorithm). To disable, set clear to true without key fields.",
    {
      domain: z.string().describe("Domain name to configure DNSSEC for"),
      clear: z
        .boolean()
        .optional()
        .describe("Set to true to remove DNSSEC from the domain"),
      flags: z
        .enum(["256", "257"])
        .optional()
        .describe("DNSSEC flags (e.g., '257' for KSK)"),
      algorithm: z
        .enum(["1", "2", "3", "4", "5", "6", "7", "8", "10", "12", "13", "14", "15", "16", "252", "253", "254"])
        .optional()
        .describe("DNSSEC algorithm number (e.g., '13' for ECDSAP256SHA256)"),
      public_key: z
        .string()
        .min(1)
        .regex(/^[A-Za-z0-9+/]+={0,2}$/, "Public key must be base64 encoded")
        .optional()
        .describe("DNSSEC public key"),
      key_tag: z.string().regex(/^\d+$/).refine((value) => Number(value) <= 65535)
        .optional().describe("DS key tag (0-65535)"),
      digest_type: z.enum(["1", "2", "3", "4"]).optional()
        .describe("DS digest type: 1=SHA-1, 2=SHA-256, 3=GOST, 4=SHA-384"),
      digest: z.string().regex(/^[0-9a-fA-F]+$/).optional()
        .describe("DS digest in hexadecimal"),
    },
    async ({ domain, clear, flags, algorithm, public_key, key_tag, digest_type, digest }) => {
      try {
        const hasDs = key_tag !== undefined || digest_type !== undefined || digest !== undefined;
        const hasDnskey = flags !== undefined || public_key !== undefined;
        if (clear) {
          if (hasDs || hasDnskey || algorithm !== undefined) {
            throw new Error("Do not provide DNSSEC key fields when clear is true.");
          }
          const result = await client.clearDnssec(domain);
          return {
            content: [
              { type: "text" as const, text: JSON.stringify(result, null, 2) },
            ],
          };
        }
        if (!algorithm || hasDs === hasDnskey) {
          throw new Error("Provide algorithm and exactly one complete DS or DNSKEY record.");
        }
        const params: Record<string, string> = { algorithm };
        if (hasDs) {
          if (key_tag === undefined || digest_type === undefined || digest === undefined) {
            throw new Error("A DS record requires key_tag, digest_type, digest, and algorithm.");
          }
          const digestLengths = { "1": 40, "2": 64, "3": 64, "4": 96 };
          if (digest.length !== digestLengths[digest_type]) {
            throw new Error(`Digest type ${digest_type} requires ${digestLengths[digest_type]} hexadecimal characters.`);
          }
          Object.assign(params, { key_tag, digest_type, digest });
        } else {
          if (!flags || !public_key) {
            throw new Error("A DNSKEY record requires flags, public_key, and algorithm.");
          }
          Object.assign(params, { flags, public_key });
        }
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

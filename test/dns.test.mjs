import assert from "node:assert/strict";
import test from "node:test";
import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { InMemoryTransport } from "@modelcontextprotocol/sdk/inMemory.js";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { registerDnsTools } from "../dist/tools/dns.js";

test("DNSSEC tools support DS/DNSKEY/clear and reject invalid records before any API request", async () => {
  const calls = [];
  const server = new McpServer({ name: "dns-test", version: "1.0.0" });
  registerDnsTools(server, {
    async setDnssec(domain, params) { calls.push({ domain, params }); return { ok: true }; },
    async clearDnssec(domain) { calls.push({ domain, clear: true }); return { ok: true }; },
  });
  const client = new Client({ name: "dns-client", version: "1.0.0" });
  const [clientTransport, serverTransport] = InMemoryTransport.createLinkedPair();
  await Promise.all([server.connect(serverTransport), client.connect(clientTransport)]);
  const domain = "example.com";
  const ds = { key_tag: "12345", algorithm: "13", digest_type: "2", digest: "a".repeat(64) };
  const dnskey = { flags: "257", algorithm: "13", public_key: "YWJjZA==" };
  try {
    for (const args of [ds, dnskey, { clear: true }]) {
      const result = await client.callTool({ name: "set_dnssec", arguments: { domain, ...args } });
      assert.notEqual(result.isError, true);
    }
    assert.deepEqual(calls, [{ domain, params: ds }, { domain, params: dnskey }, { domain, clear: true }]);
    for (const args of [
      {}, { algorithm: "13" }, { ...ds, digest: undefined }, { ...dnskey, flags: undefined },
      { ...ds, ...dnskey }, { ...ds, clear: true }, { ...ds, digest: "abc" },
      { ...ds, key_tag: "65536" }, { ...ds, digest_type: "5" },
      { ...ds, digest: "z".repeat(64) }, { ...dnskey, public_key: "invalid key" },
    ]) {
      const result = await client.callTool({ name: "set_dnssec", arguments: { domain, ...args } });
      assert.equal(result.isError, true, JSON.stringify(args));
    }
    assert.equal(calls.length, 3);
  } finally {
    await client.close();
    await server.close();
  }
});

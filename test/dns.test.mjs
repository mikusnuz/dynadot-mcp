import assert from "node:assert/strict";
import test from "node:test";
import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { InMemoryTransport } from "@modelcontextprotocol/sdk/inMemory.js";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { registerDnsTools } from "../dist/tools/dns.js";
import { DynadotClient } from "../dist/services/dynadot-client.js";
import { dnsRecordsSchema } from "../dist/services/dns-records.js";

test("set_dns2 preserves its documented fields and rejects malformed records", async (t) => {
  const records = {
    main_record_type0: "mx", main_record0: "mail.example.com", main_recordx0: "0",
    main_record_type19: "txt", main_record19: "",
    subdomain99: "_sip._tcp", sub_record_type99: "srv", sub_record99: "0 5 5060 sip.example.com",
    ttl: "300", add_dns_to_current_setting: "1",
  };
  assert.deepEqual(dnsRecordsSchema.parse(records), records);
  for (const type of ["a", "aaaa", "cname", "forward", "txt", "mx", "stealth", "email"]) {
    const extra = { forward: "1", mx: "10", stealth: "Title", email: "alias" }[type];
    const value = { main_record_type0: type, main_record0: "value", ...(extra === undefined ? {} : { main_recordx0: extra }) };
    assert.deepEqual(dnsRecordsSchema.parse(value), value);
  }
  assert.deepEqual(dnsRecordsSchema.parse({}), {});
  for (const invalid of [
    { domain: "other.example" }, { command: "delete" }, { key: "other-key" },
    { main_record_type20: "a", main_record20: "1.2.3.4" },
    { subdomain100: "www", sub_record_type100: "a", sub_record100: "1.2.3.4" },
    { main_record_type0: "srv", main_record0: "value" },
    { main_record_type0: "a" }, { main_record0: "orphan" }, { main_recordx0: "10" },
    { sub_record_type0: "txt", sub_record0: "value" },
    { main_record_type0: "mx", main_record0: "mail.example.com" },
    { main_record_type0: "forward", main_record0: "https://example.com", main_recordx0: "301" },
    { ttl: "300oops" }, { add_dns_to_current_setting: "yes" }, { main_record_type00: "a" },
  ]) assert.equal(dnsRecordsSchema.safeParse(invalid).success, false, JSON.stringify(invalid));
  const mock = t.mock.method(globalThis, "fetch", async () => Response.json({ ok: true }));
  await new DynadotClient("test-key").setDns("example.com", records);
  const params = new URL(mock.mock.calls[0].arguments[0]).searchParams;
  assert.equal(params.get("command"), "set_dns2");
  assert.equal(params.get("domain"), "example.com");
  for (const [key, value] of Object.entries(records)) assert.equal(params.get(key), value);
});

test("nameserver tools use official IDs/IP fields and retain exact-host aliases", async (t) => {
  const requests = [];
  let servers = [{ ServerId: "0", ServerName: "ns1.example.com" }];
  t.mock.method(globalThis, "fetch", async (url) => {
    const params = Object.fromEntries(new URL(url).searchParams);
    requests.push(params);
    return Response.json(params.command === "server_list"
      ? { ServerListResponse: { ResponseCode: 0, ServerList: servers } }
      : { ok: true });
  });
  const server = new McpServer({ name: "dns-test", version: "1.0.0" });
  registerDnsTools(server, new DynadotClient("test-key"));
  const client = new Client({ name: "dns-client", version: "1.0.0" });
  const [clientTransport, serverTransport] = InMemoryTransport.createLinkedPair();
  await Promise.all([server.connect(serverTransport), client.connect(clientTransport)]);
  const call = (name, args) => client.callTool({ name, arguments: args });
  try {
    assert.notEqual((await call("set_nameserver_ip", { server_id: "12", ips: ["192.0.2.1", "2001:db8::1"] })).isError, true);
    assert.deepEqual(requests.pop(), { key: "test-key", command: "set_ns_ip", server_id: "12", ip0: "192.0.2.1", ip1: "2001:db8::1" });
    assert.notEqual((await call("set_nameserver_ip", { host: "NS1.EXAMPLE.COM.", ip: "192.0.2.2" })).isError, true);
    assert.deepEqual(requests.pop(), { key: "test-key", command: "set_ns_ip", server_id: "0", ip0: "192.0.2.2" });
    assert.equal(requests.pop().command, "server_list");
    assert.notEqual((await call("delete_nameserver", { server_id: "0,12" })).isError, true);
    assert.deepEqual(requests.pop(), { key: "test-key", command: "delete_ns", server_id: "0,12" });
    for (const alias of ["server_domain", "host", "domain"]) {
      assert.notEqual((await call("delete_nameserver", { [alias]: "ns1.example.com" })).isError, true);
      assert.deepEqual(requests.pop(), { key: "test-key", command: "delete_ns_by_domain", server_domain: "ns1.example.com" });
    }
    for (const args of [{}, { host: "ns1.example.com", server_id: "0", ip: "192.0.2.1" }, { server_id: "0", ip: "bad" }, { server_id: "0", ip: "192.0.2.1", ips: ["192.0.2.1"] }]) {
      assert.equal((await call("set_nameserver_ip", args)).isError, true);
    }
    assert.equal((await call("delete_nameserver", { host: "ns1.example.com", domain: "example.com" })).isError, true);
    assert.equal((await call("set_dns", { domain: "example.com", records: { command: "delete" } })).isError, true);
    assert.equal(requests.length, 0);
    for (const entries of [[], [servers[0], servers[0]]]) {
      servers = entries;
      assert.equal((await call("set_nameserver_ip", { host: "ns1.example.com", ip: "192.0.2.1" })).isError, true);
      assert.equal(requests.pop().command, "server_list");
      assert.equal(requests.length, 0);
    }
  } finally { await client.close(); await server.close(); }
});

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

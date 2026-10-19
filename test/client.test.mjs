import assert from "node:assert/strict";
import test from "node:test";
import { DynadotClient, withFixedParams } from "../dist/services/dynadot-client.js";

test("free-form parameters cannot change credentials, command or explicit targets", async (t) => {
  let requests = 0;
  t.mock.method(globalThis, "fetch", async () => { requests++; return Response.json({ ok: true }); });
  const client = new DynadotClient("test-key");
  for (const key of ["key", "command", "KEY", "Command"]) {
    await assert.rejects(client.call("account_info", { [key]: "override" }), /Reserved/);
  }
  for (const [method, args] of [
    ["setDns", ["example.com", { domain: "other.example" }]],
    ["setDnssec", ["example.com", { domain_name: "other.example" }]],
    ["editContact", ["1", { contact_id: "2" }]],
    ["setContactRegionalSetting", ["set_contact_eu_setting", "1", { CONTACT_ID: "2" }]],
    ["createCnAudit", ["1", { contact_id: "2" }]],
    ["setWhoisContacts", ["example.com", { domain: "other.example" }]],
    ["setEmailForward", ["example.com", { domain: "other.example" }]],
  ]) await assert.rejects(client[method](...args));
  assert.throws(() => withFixedParams({ folder_id: "1" }, { folder_id: "2" }), /Reserved/);
  assert.equal(requests, 0);
  await client.call("edit_contact", { contact_id: "1", organization: "" });
  assert.equal(new URL(globalThis.fetch.mock.calls[0].arguments[0]).searchParams.get("organization"), "");
});

test("timeout remains active until response body has been read", async (t) => {
  let aborted = false;
  t.mock.method(globalThis, "fetch", async (_url, { signal }) => new Response(new ReadableStream({
    start(controller) {
      signal.addEventListener("abort", () => {
        aborted = true;
        controller.error(new DOMException("Body aborted", "AbortError"));
      }, { once: true });
    },
  })));
  await assert.rejects(new DynadotClient("test-key", false, 20).call("account_info"), /timed out after 20ms/);
  assert.equal(aborted, true);
});

test("client distinguishes HTTP, JSON and API errors and releases timeout", async (t) => {
  let signal;
  const mock = t.mock.method(globalThis, "fetch", async (_url, options) => {
    signal = options.signal;
    return Response.json({ TestResponse: { ResponseCode: 0, Status: "success" } });
  });
  const client = new DynadotClient("test-key", true, 10);
  await client.call("account_info");
  await new Promise((resolve) => setTimeout(resolve, 25));
  assert.equal(signal.aborted, false);
  assert.equal(new URL(mock.mock.calls[0].arguments[0]).hostname, "api-sandbox.dynadot.com");
  mock.mock.mockImplementation(async () => new Response("error", { status: 503 }));
  await assert.rejects(client.call("account_info"), /HTTP error: 503/);
  mock.mock.mockImplementation(async () => new Response("not JSON"));
  await assert.rejects(client.call("account_info"), /invalid JSON/);
  mock.mock.mockImplementation(async () => Response.json(null));
  await assert.rejects(client.call("account_info"), /invalid response/);
  mock.mock.mockImplementation(async () => Response.json({ TestResponse: { ResponseCode: "-1", Error: "Rejected" } }));
  await assert.rejects(client.call("account_info"), /API error: Rejected/);
});

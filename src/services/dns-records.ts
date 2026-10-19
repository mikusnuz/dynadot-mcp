import { z } from "zod";

const mainTypes = new Set(["a", "aaaa", "cname", "forward", "txt", "mx", "stealth", "email"]);
const auxiliaryTypes = new Set(["forward", "mx", "stealth", "email"]);

/** API3 set_dns2 parameters, not the differently shaped legacy set_dns fields. */
export const dnsRecordsSchema = z.record(z.string()).superRefine((records, ctx) => {
  const issue = (key: string, message: string) =>
    ctx.addIssue({ code: z.ZodIssueCode.custom, path: [key], message });
  const groups = new Set<string>();
  for (const [key, value] of Object.entries(records)) {
    if (key === "ttl") {
      if (!/^\d+$/.test(value)) issue(key, "TTL must be a non-negative integer string.");
      continue;
    }
    if (key === "add_dns_to_current_setting") {
      if (value !== "1") issue(key, "Use '1' to append; omit this field to replace existing DNS.");
      continue;
    }
    const match = /^(main_record_type|main_recordx|main_record|subdomain|sub_record_type|sub_recordx|sub_record)(0|[1-9]\d*)$/.exec(key);
    if (!match) {
      issue(key, "Unknown set_dns2 field. Command, credentials and domain belong outside records.");
      continue;
    }
    const main = match[1].startsWith("main_");
    if (Number(match[2]) > (main ? 19 : 99)) {
      issue(key, main ? "Main record index must be 0..19." : "Subdomain record index must be 0..99.");
      continue;
    }
    groups.add(`${main ? "main" : "sub"}:${match[2]}`);
  }
  for (const group of groups) {
    const [prefix, index] = group.split(":");
    const typeKey = `${prefix}_record_type${index}`;
    const valueKey = `${prefix}_record${index}`;
    const extraKey = `${prefix}_recordx${index}`;
    const type = records[typeKey];
    if (!mainTypes.has(type) && !(prefix === "sub" && type === "srv")) {
      issue(typeKey, "A supported record type is required (SRV is subdomain-only).");
    }
    if (records[valueKey] === undefined) issue(valueKey, "Record value is required.");
    if (prefix === "sub" && !records[`subdomain${index}`]) {
      issue(`subdomain${index}`, "Subdomain name is required.");
    }
    if (auxiliaryTypes.has(type) && records[extraKey] === undefined) {
      issue(extraKey, "MX, forwarding, stealth and email records require their auxiliary field.");
    }
    if (type === "forward" && records[extraKey] !== "1" && records[extraKey] !== "2") {
      issue(extraKey, "Forward type must be '1' (301) or '2' (302).");
    }
    if (type === "mx" && records[extraKey] !== undefined && !/^\d+$/.test(records[extraKey])) {
      issue(extraKey, "MX distance must be a non-negative integer string.");
    }
  }
});

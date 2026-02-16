/**
 * Contact Tools
 *
 * MCP tools for contact management:
 * - create_contact: Create a new contact
 * - edit_contact: Edit an existing contact
 * - delete_contact: Delete a contact
 * - list_contacts: List all contacts or get contact details
 */

import { z } from "zod";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { DynadotClient } from "../services/dynadot-client.js";

export function registerContactTools(
  server: McpServer,
  client: DynadotClient
): void {
  // ─── create_contact ───────────────────────────────────────────

  server.tool(
    "create_contact",
    "Create a new contact record for use with domain registrations. " +
      "Required fields: name, email, phone_num, address1, city, state, " +
      "zip_code, country.",
    {
      name: z.string().describe("Contact full name"),
      email: z.string().describe("Contact email address"),
      phone_num: z.string().describe("Phone number with country code (e.g., '+1.5551234567')"),
      address1: z.string().describe("Street address line 1"),
      address2: z.string().optional().describe("Street address line 2"),
      city: z.string().describe("City"),
      state: z.string().describe("State or province"),
      zip_code: z.string().describe("Postal/ZIP code"),
      country: z.string().describe("Country code (e.g., 'US', 'KR')"),
      organization: z.string().optional().describe("Organization name"),
      fax_num: z.string().optional().describe("Fax number"),
    },
    async ({ name, email, phone_num, address1, address2, city, state, zip_code, country, organization, fax_num }) => {
      try {
        const fields: Record<string, string> = {
          name,
          email,
          phone_num,
          address1,
          city,
          state,
          zip_code,
          country,
        };
        if (address2) fields.address2 = address2;
        if (organization) fields.organization = organization;
        if (fax_num) fields.fax_num = fax_num;

        const result = await client.createContact(fields);
        return {
          content: [
            { type: "text" as const, text: JSON.stringify(result, null, 2) },
          ],
        };
      } catch (error) {
        const msg = error instanceof Error ? error.message : String(error);
        return {
          content: [
            { type: "text" as const, text: `Failed to create contact: ${msg}` },
          ],
          isError: true,
        };
      }
    }
  );

  // ─── edit_contact ─────────────────────────────────────────────

  server.tool(
    "edit_contact",
    "Edit an existing contact record. Only provided fields will be updated.",
    {
      contact_id: z.string().describe("Contact ID to edit"),
      fields: z
        .record(z.string())
        .describe(
          "Fields to update as key-value pairs. Valid keys: name, email, " +
            "phone_num, address1, address2, city, state, zip_code, country, " +
            "organization, fax_num"
        ),
    },
    async ({ contact_id, fields }) => {
      try {
        const result = await client.editContact(contact_id, fields);
        return {
          content: [
            { type: "text" as const, text: JSON.stringify(result, null, 2) },
          ],
        };
      } catch (error) {
        const msg = error instanceof Error ? error.message : String(error);
        return {
          content: [
            { type: "text" as const, text: `Failed to edit contact: ${msg}` },
          ],
          isError: true,
        };
      }
    }
  );

  // ─── delete_contact ───────────────────────────────────────────

  server.tool(
    "delete_contact",
    "Delete a contact record. The contact must not be in use by any domain.",
    {
      contact_id: z.string().describe("Contact ID to delete"),
    },
    async ({ contact_id }) => {
      try {
        const result = await client.deleteContact(contact_id);
        return {
          content: [
            { type: "text" as const, text: JSON.stringify(result, null, 2) },
          ],
        };
      } catch (error) {
        const msg = error instanceof Error ? error.message : String(error);
        return {
          content: [
            { type: "text" as const, text: `Failed to delete contact: ${msg}` },
          ],
          isError: true,
        };
      }
    }
  );

  // ─── list_contacts ────────────────────────────────────────────

  server.tool(
    "list_contacts",
    "List all contacts in the account, or get details of a specific contact by ID.",
    {
      contact_id: z
        .string()
        .optional()
        .describe("If provided, get details for this specific contact ID"),
    },
    async ({ contact_id }) => {
      try {
        if (contact_id) {
          const result = await client.getContact(contact_id);
          return {
            content: [
              { type: "text" as const, text: JSON.stringify(result, null, 2) },
            ],
          };
        }
        const result = await client.listContacts();
        return {
          content: [
            { type: "text" as const, text: JSON.stringify(result, null, 2) },
          ],
        };
      } catch (error) {
        const msg = error instanceof Error ? error.message : String(error);
        return {
          content: [
            { type: "text" as const, text: `Failed to list contacts: ${msg}` },
          ],
          isError: true,
        };
      }
    }
  );
}

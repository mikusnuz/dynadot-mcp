/**
 * Folder Tools
 *
 * MCP tools for folder management:
 * - create_folder: Create a new folder
 * - delete_folder: Delete a folder
 * - list_folders: List all folders
 * - set_folder_settings: Apply settings to a folder (NS, DNS, forwarding, etc.)
 */

import { z } from "zod";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { DynadotClient } from "../services/dynadot-client.js";

export function registerFolderTools(
  server: McpServer,
  client: DynadotClient
): void {
  // ─── create_folder ────────────────────────────────────────────

  server.tool(
    "create_folder",
    "Create a new folder for organizing domains.",
    {
      folder_name: z.string().describe("Name for the new folder"),
    },
    async ({ folder_name }) => {
      try {
        const result = await client.createFolder(folder_name);
        return {
          content: [
            { type: "text" as const, text: JSON.stringify(result, null, 2) },
          ],
        };
      } catch (error) {
        const msg = error instanceof Error ? error.message : String(error);
        return {
          content: [
            { type: "text" as const, text: `Failed to create folder: ${msg}` },
          ],
          isError: true,
        };
      }
    }
  );

  // ─── delete_folder ────────────────────────────────────────────

  server.tool(
    "delete_folder",
    "Delete a folder. The folder must be empty (no domains assigned to it).",
    {
      folder_id: z.string().describe("Folder ID to delete"),
    },
    async ({ folder_id }) => {
      try {
        const result = await client.deleteFolder(folder_id);
        return {
          content: [
            { type: "text" as const, text: JSON.stringify(result, null, 2) },
          ],
        };
      } catch (error) {
        const msg = error instanceof Error ? error.message : String(error);
        return {
          content: [
            { type: "text" as const, text: `Failed to delete folder: ${msg}` },
          ],
          isError: true,
        };
      }
    }
  );

  // ─── list_folders ─────────────────────────────────────────────

  server.tool(
    "list_folders",
    "List all folders in the Dynadot account.",
    {},
    async () => {
      try {
        const result = await client.listFolders();
        return {
          content: [
            { type: "text" as const, text: JSON.stringify(result, null, 2) },
          ],
        };
      } catch (error) {
        const msg = error instanceof Error ? error.message : String(error);
        return {
          content: [
            { type: "text" as const, text: `Failed to list folders: ${msg}` },
          ],
          isError: true,
        };
      }
    }
  );

  // ─── set_folder_settings ──────────────────────────────────────

  server.tool(
    "set_folder_settings",
    "Apply default settings to a folder. All domains in the folder will " +
      "inherit these settings. Supports nameservers, DNS, forwarding, " +
      "parking, stealth, and renewal options. Pass the appropriate " +
      "Dynadot API parameters for the setting type.",
    {
      folder_id: z.string().describe("Folder ID to configure"),
      setting_type: z
        .enum(["ns", "dns2", "forwarding", "stealth", "parking", "hosting", "email_forward", "renew_option", "clear"])
        .describe(
          "Type of setting to apply: 'ns' (nameservers), 'dns2' (DNS records), " +
            "'forwarding', 'stealth', 'parking', 'hosting', 'email_forward', " +
            "'renew_option', or 'clear' (remove settings)"
        ),
      params: z
        .record(z.string())
        .optional()
        .describe("Setting parameters as key-value pairs (varies by setting type)"),
    },
    async ({ folder_id, setting_type, params }) => {
      try {
        const command =
          setting_type === "clear"
            ? "set_clear_folder_setting"
            : `set_folder_${setting_type}`;
        const result = await client.call(command, {
          folder_id,
          ...(params || {}),
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
            { type: "text" as const, text: `Failed to set folder settings: ${msg}` },
          ],
          isError: true,
        };
      }
    }
  );
}

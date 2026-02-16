/**
 * Marketplace Tools
 *
 * MCP tools for Dynadot aftermarket and marketplace:
 * - get_auctions: List open/closed auctions
 * - place_bid: Place a bid on an auction
 * - manage_backorders: Add/remove/list backorder requests
 * - set_for_sale: Set domain for sale or buy a listed domain
 * - get_marketplace_listings: View marketplace listings
 */

import { z } from "zod";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { DynadotClient } from "../services/dynadot-client.js";

export function registerMarketplaceTools(
  server: McpServer,
  client: DynadotClient
): void {
  // ─── get_auctions ─────────────────────────────────────────────

  server.tool(
    "get_auctions",
    "List domain auctions. Can show open (active) or closed (completed) auctions.",
    {
      type: z
        .enum(["open", "closed"])
        .default("open")
        .describe("Auction type: 'open' for active, 'closed' for completed"),
      params: z
        .record(z.string())
        .optional()
        .describe("Additional filter parameters"),
    },
    async ({ type, params }) => {
      try {
        const result =
          type === "open"
            ? await client.getOpenAuctions(params)
            : await client.getClosedAuctions(params);
        return {
          content: [
            { type: "text" as const, text: JSON.stringify(result, null, 2) },
          ],
        };
      } catch (error) {
        const msg = error instanceof Error ? error.message : String(error);
        return {
          content: [
            { type: "text" as const, text: `Failed to get auctions: ${msg}` },
          ],
          isError: true,
        };
      }
    }
  );

  // ─── place_bid ────────────────────────────────────────────────

  server.tool(
    "place_bid",
    "Place a bid on a domain auction. Requires the auction ID and bid amount.",
    {
      auction_id: z.string().describe("Auction ID to bid on"),
      amount: z.string().describe("Bid amount (e.g., '100.00')"),
      currency: z
        .string()
        .optional()
        .describe("Currency for the bid (e.g., 'USD')"),
    },
    async ({ auction_id, amount, currency }) => {
      try {
        const result = await client.placeAuctionBid(auction_id, amount, currency);
        return {
          content: [
            { type: "text" as const, text: JSON.stringify(result, null, 2) },
          ],
        };
      } catch (error) {
        const msg = error instanceof Error ? error.message : String(error);
        return {
          content: [
            { type: "text" as const, text: `Failed to place bid: ${msg}` },
          ],
          isError: true,
        };
      }
    }
  );

  // ─── manage_backorders ────────────────────────────────────────

  server.tool(
    "manage_backorders",
    "Manage domain backorder requests. You can add a new backorder, delete " +
      "an existing one, or list all current backorder requests.",
    {
      action: z
        .enum(["add", "delete", "list"])
        .describe("Action: 'add' a new backorder, 'delete' an existing one, or 'list' all"),
      domain: z
        .string()
        .optional()
        .describe("Domain name (required for 'add' and 'delete' actions)"),
    },
    async ({ action, domain }) => {
      try {
        let result;
        switch (action) {
          case "add":
            if (!domain) {
              return {
                content: [
                  { type: "text" as const, text: "Domain is required for 'add' action" },
                ],
                isError: true,
              };
            }
            result = await client.addBackorderRequest(domain);
            break;
          case "delete":
            if (!domain) {
              return {
                content: [
                  { type: "text" as const, text: "Domain is required for 'delete' action" },
                ],
                isError: true,
              };
            }
            result = await client.deleteBackorderRequest(domain);
            break;
          case "list":
            result = await client.listBackorderRequests();
            break;
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
            { type: "text" as const, text: `Backorder operation failed: ${msg}` },
          ],
          isError: true,
        };
      }
    }
  );

  // ─── set_for_sale ─────────────────────────────────────────────

  server.tool(
    "set_for_sale",
    "List a domain for sale on the Dynadot marketplace with a specified price.",
    {
      domain: z.string().describe("Domain name to list for sale"),
      price: z.string().describe("Asking price (e.g., '1000.00')"),
      currency: z
        .string()
        .optional()
        .describe("Currency for the price (e.g., 'USD')"),
    },
    async ({ domain, price, currency }) => {
      try {
        const result = await client.setForSale(domain, price, currency);
        return {
          content: [
            { type: "text" as const, text: JSON.stringify(result, null, 2) },
          ],
        };
      } catch (error) {
        const msg = error instanceof Error ? error.message : String(error);
        return {
          content: [
            { type: "text" as const, text: `Failed to set for sale: ${msg}` },
          ],
          isError: true,
        };
      }
    }
  );

  // ─── get_marketplace_listings ─────────────────────────────────

  server.tool(
    "get_marketplace_listings",
    "View marketplace listings. Can list all available domains or get " +
      "details of a specific listing by ID.",
    {
      listing_id: z
        .string()
        .optional()
        .describe("Specific listing ID to get details for (omit to list all)"),
      params: z
        .record(z.string())
        .optional()
        .describe("Additional filter parameters for listing"),
    },
    async ({ listing_id, params }) => {
      try {
        let result;
        if (listing_id) {
          result = await client.getListingItem(listing_id);
        } else {
          result = await client.getListings(params);
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
            { type: "text" as const, text: `Failed to get listings: ${msg}` },
          ],
          isError: true,
        };
      }
    }
  );
}

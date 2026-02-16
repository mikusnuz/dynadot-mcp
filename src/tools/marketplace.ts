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

  // ─── get_auction_details ──────────────────────────────────────

  server.tool(
    "get_auction_details",
    "Get detailed information about a specific auction, including current " +
      "bids and auction status.",
    {
      auction_id: z.string().describe("Auction ID to get details for"),
      include_bids: z
        .boolean()
        .optional()
        .describe("Also fetch bid history for this auction"),
    },
    async ({ auction_id, include_bids }) => {
      try {
        const details = await client.getAuctionDetails(auction_id);
        if (include_bids) {
          const bids = await client.getAuctionBids(auction_id);
          return {
            content: [
              {
                type: "text" as const,
                text: JSON.stringify({ details, bids }, null, 2),
              },
            ],
          };
        }
        return {
          content: [
            { type: "text" as const, text: JSON.stringify(details, null, 2) },
          ],
        };
      } catch (error) {
        const msg = error instanceof Error ? error.message : String(error);
        return {
          content: [
            { type: "text" as const, text: `Failed to get auction details: ${msg}` },
          ],
          isError: true,
        };
      }
    }
  );

  // ─── manage_backorder_auctions ────────────────────────────────

  server.tool(
    "manage_backorder_auctions",
    "View backorder auctions (open or closed) or get details/place a bid " +
      "on a specific backorder auction.",
    {
      action: z
        .enum(["list_open", "list_closed", "details", "bid"])
        .describe(
          "Action: 'list_open', 'list_closed', 'details' (get info), or 'bid' (place bid)"
        ),
      auction_id: z
        .string()
        .optional()
        .describe("Auction ID (required for 'details' and 'bid')"),
      amount: z
        .string()
        .optional()
        .describe("Bid amount (required for 'bid')"),
      currency: z
        .string()
        .optional()
        .describe("Currency for the bid"),
    },
    async ({ action, auction_id, amount, currency }) => {
      try {
        let result;
        switch (action) {
          case "list_open":
            result = await client.getOpenBackorderAuctions();
            break;
          case "list_closed":
            result = await client.getClosedBackorderAuctions();
            break;
          case "details":
            if (!auction_id) {
              return {
                content: [
                  { type: "text" as const, text: "auction_id is required for 'details'" },
                ],
                isError: true,
              };
            }
            result = await client.getBackorderAuctionDetails(auction_id);
            break;
          case "bid":
            if (!auction_id || !amount) {
              return {
                content: [
                  { type: "text" as const, text: "auction_id and amount are required for 'bid'" },
                ],
                isError: true,
              };
            }
            result = await client.placeBackorderAuctionBid(auction_id, amount, currency);
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
            { type: "text" as const, text: `Backorder auction operation failed: ${msg}` },
          ],
          isError: true,
        };
      }
    }
  );

  // ─── buy_expired_domain ───────────────────────────────────────

  server.tool(
    "buy_expired_domain",
    "Browse and purchase expired closeout domains at discounted prices. " +
      "Use action 'list' to see available domains or 'buy' to purchase one.",
    {
      action: z
        .enum(["list", "buy"])
        .describe("Action: 'list' available expired domains or 'buy' one"),
      domain: z
        .string()
        .optional()
        .describe("Domain name to buy (required for 'buy')"),
      currency: z
        .string()
        .optional()
        .describe("Currency for the purchase"),
      params: z
        .record(z.string())
        .optional()
        .describe("Additional filter parameters for 'list'"),
    },
    async ({ action, domain, currency, params }) => {
      try {
        if (action === "list") {
          const result = await client.getExpiredCloseoutDomains(params);
          return {
            content: [
              { type: "text" as const, text: JSON.stringify(result, null, 2) },
            ],
          };
        }
        if (!domain) {
          return {
            content: [
              { type: "text" as const, text: "domain is required for 'buy'" },
            ],
            isError: true,
          };
        }
        const result = await client.buyExpiredCloseoutDomain(domain, currency);
        return {
          content: [
            { type: "text" as const, text: JSON.stringify(result, null, 2) },
          ],
        };
      } catch (error) {
        const msg = error instanceof Error ? error.message : String(error);
        return {
          content: [
            { type: "text" as const, text: `Expired domain operation failed: ${msg}` },
          ],
          isError: true,
        };
      }
    }
  );

  // ─── buy_it_now ───────────────────────────────────────────────

  server.tool(
    "buy_it_now",
    "Purchase a domain listed on the marketplace at its Buy It Now price.",
    {
      listing_id: z.string().describe("Listing ID to purchase"),
      currency: z
        .string()
        .optional()
        .describe("Currency for the purchase"),
    },
    async ({ listing_id, currency }) => {
      try {
        const result = await client.buyItNow(listing_id, currency);
        return {
          content: [
            { type: "text" as const, text: JSON.stringify(result, null, 2) },
          ],
        };
      } catch (error) {
        const msg = error instanceof Error ? error.message : String(error);
        return {
          content: [
            { type: "text" as const, text: `Buy It Now failed: ${msg}` },
          ],
          isError: true,
        };
      }
    }
  );

  // ─── confirm_marketplace_action ───────────────────────────────

  server.tool(
    "confirm_marketplace_action",
    "Confirm or reject a marketplace action from Afternic or Sedo integration.",
    {
      platform: z
        .enum(["afternic", "sedo"])
        .describe("Marketplace platform: 'afternic' or 'sedo'"),
      domain: z.string().describe("Domain name"),
      action: z.string().describe("Action to confirm (e.g., 'accept', 'reject')"),
    },
    async ({ platform, domain, action }) => {
      try {
        const result =
          platform === "afternic"
            ? await client.setAfternicConfirmAction(domain, action)
            : await client.setSedoConfirmAction(domain, action);
        return {
          content: [
            { type: "text" as const, text: JSON.stringify(result, null, 2) },
          ],
        };
      } catch (error) {
        const msg = error instanceof Error ? error.message : String(error);
        return {
          content: [
            { type: "text" as const, text: `Marketplace confirmation failed: ${msg}` },
          ],
          isError: true,
        };
      }
    }
  );
}

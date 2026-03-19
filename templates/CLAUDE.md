# Dynadot MCP — Instructions for Claude

This project uses the **dynadot-mcp** MCP server for domain management via the Dynadot registrar API.

## Available MCP Tools

All tools are prefixed with `mcp__dynadot__` in Claude Code.

### Domain Management
- `search_domain` — Check domain availability (up to 100 at once)
- `register_domain` / `bulk_register_domains` — Register domains
- `get_domain_info` / `list_domains` — Query domain details
- `renew_domain` / `delete_domain` / `restore_domain` — Lifecycle management
- `push_domain` — Transfer to another Dynadot account

### DNS
- `get_dns` / `set_dns` — Read/write DNS records (A, AAAA, CNAME, MX, TXT, SRV)
- `set_nameservers` / `get_nameservers` — Nameserver configuration
- `register_nameserver` / `add_nameserver` / `delete_nameserver` / `list_registered_nameservers` — Custom NS management
- `get_dnssec` / `set_dnssec` — DNSSEC settings

### Contacts
- `create_contact` / `edit_contact` / `delete_contact` / `list_contacts` — Contact CRUD
- `set_contact_regional_setting` — EU/LV/LT settings
- `manage_cn_audit` — .cn domain audit

### Transfers
- `transfer_domain` / `cancel_transfer` / `get_transfer_status` — Transfer lifecycle
- `get_auth_code` / `set_auth_code` — EPP/auth codes
- `authorize_transfer_away` — Approve outgoing transfers
- `manage_domain_push` — Push requests

### Settings
- `set_privacy` — WHOIS privacy (full/partial/off)
- `set_forwarding` — URL/stealth forwarding
- `set_email_forward` — Email forwarding or MX records
- `lock_domain` — Transfer lock/unlock
- `set_renew_option` — Auto-renewal
- `set_parking` / `set_hosting` — Parking and hosting

### Account
- `get_account_info` / `get_account_balance` — Account status
- `list_orders` / `get_order_status` — Order history
- `get_tld_price` / `list_coupons` — Pricing

### Marketplace
- `get_auctions` / `get_auction_details` / `place_bid` — Auctions
- `set_for_sale` / `get_marketplace_listings` / `buy_it_now` — Buy/sell
- `manage_backorders` / `manage_backorder_auctions` — Backorders
- `buy_expired_domain` — Expired domain closeouts

## When to Use

Use the dynadot MCP tools when the task involves:
- Searching for or checking domain name availability
- Registering, renewing, or deleting domains
- Managing DNS records (A, AAAA, CNAME, MX, TXT, SRV)
- Configuring nameservers or DNSSEC
- Domain transfers (inbound or outbound)
- WHOIS privacy settings
- Email forwarding setup
- Domain marketplace operations (auctions, listings, backorders)
- Account balance or order history queries

## Important Notes

- The `DYNADOT_SANDBOX` env var enables sandbox mode for safe testing. Use it for dry runs before making real changes.
- Domain registration and marketplace purchases involve real money — always confirm with the user before executing.
- `search_domain` can check up to 100 domains in a single call — batch lookups when possible.
- Transfer operations require proper auth codes and domain unlock status.

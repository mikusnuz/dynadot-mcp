# Dynadot MCP — Instructions for Codex / AI Agents

This project uses the **dynadot-mcp** MCP server for domain management via the Dynadot registrar API.

## Setup

The MCP server is configured in your MCP settings. It requires:
- `DYNADOT_API_KEY` — Your Dynadot API key
- `DYNADOT_SANDBOX` (optional) — Set `true` for sandbox/testing mode

## Tool Reference

### Domain Management
| Tool | Purpose |
|------|---------|
| `search_domain` | Check availability of up to 100 domains at once |
| `register_domain` | Register a single domain |
| `bulk_register_domains` | Register multiple domains |
| `get_domain_info` | Get domain details |
| `list_domains` | List all account domains |
| `renew_domain` | Renew a domain |
| `delete_domain` | Delete (grace period) |
| `restore_domain` | Restore deleted domain |
| `push_domain` | Push to another account |

### DNS
| Tool | Purpose |
|------|---------|
| `get_dns` / `set_dns` | Read/write DNS records |
| `set_nameservers` / `get_nameservers` | NS configuration |
| `register_nameserver` / `add_nameserver` / `delete_nameserver` | Custom NS |
| `list_registered_nameservers` | List all NS |
| `get_dnssec` / `set_dnssec` | DNSSEC management |

### Contacts
| Tool | Purpose |
|------|---------|
| `create_contact` / `edit_contact` / `delete_contact` | Contact CRUD |
| `list_contacts` | List/get contacts |
| `set_contact_regional_setting` | EU/LV/LT settings |
| `manage_cn_audit` | .cn audit |

### Transfers
| Tool | Purpose |
|------|---------|
| `transfer_domain` | Initiate transfer |
| `cancel_transfer` | Cancel pending transfer |
| `get_transfer_status` | Check status |
| `get_auth_code` / `set_auth_code` | EPP codes |
| `authorize_transfer_away` | Approve outgoing |
| `manage_domain_push` | Push requests |

### Settings
| Tool | Purpose |
|------|---------|
| `set_privacy` | WHOIS privacy |
| `set_forwarding` | URL forwarding |
| `set_email_forward` | Email forwarding |
| `lock_domain` | Transfer lock |
| `set_renew_option` | Auto-renewal |
| `set_parking` / `set_hosting` | Parking/hosting |

### Account
| Tool | Purpose |
|------|---------|
| `get_account_info` / `get_account_balance` | Account status |
| `list_orders` / `get_order_status` | Orders |
| `get_tld_price` / `list_coupons` | Pricing |

### Marketplace
| Tool | Purpose |
|------|---------|
| `get_auctions` / `place_bid` / `get_auction_details` | Auctions |
| `set_for_sale` / `get_marketplace_listings` / `buy_it_now` | Marketplace |
| `manage_backorders` / `manage_backorder_auctions` | Backorders |
| `buy_expired_domain` | Expired domains |

## When to Use

Invoke dynadot MCP tools when the task involves:
- Searching for or checking domain name availability
- Registering, renewing, or deleting domains
- Managing DNS records (A, AAAA, CNAME, MX, TXT, SRV)
- Configuring nameservers or DNSSEC
- Domain transfers (inbound or outbound)
- WHOIS privacy settings
- Email forwarding setup
- Domain marketplace operations (auctions, listings, backorders)
- Account balance or order history queries

## Safety Rules

- **Never register/purchase domains without explicit user confirmation** — these cost real money
- Use `DYNADOT_SANDBOX=true` for testing when available
- `search_domain` supports batch checks (up to 100) — prefer batching over individual calls
- Transfer operations require the domain to be unlocked and a valid auth code
- Always verify DNS changes with `get_dns` after calling `set_dns`

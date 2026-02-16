**English** | [한국어](README.ko.md)

# dynadot-mcp

MCP (Model Context Protocol) server for the [Dynadot](https://www.dynadot.com) domain registrar API. Manage domains, DNS records, contacts, transfers, and more — all from your AI assistant.

## Features

- **60 tools** covering the full Dynadot API3 (~106 commands)
- Domain search, registration, renewal, deletion
- DNS record management (A, AAAA, CNAME, MX, TXT, SRV)
- Nameserver configuration and DNSSEC
- Contact CRUD operations
- Domain transfers (in/out)
- WHOIS privacy, forwarding, locking
- Folder organization
- Marketplace: auctions, backorders, listings
- Account info and balance resources
- Sandbox mode for testing

## Installation

```bash
npm install -g dynadot-mcp
```

Or run directly:

```bash
npx dynadot-mcp
```

## Configuration

Set the following environment variables:

| Variable | Required | Description |
|----------|----------|-------------|
| `DYNADOT_API_KEY` | Yes | Your Dynadot API key ([get one here](https://www.dynadot.com/account/domain/setting/api.html)) |
| `DYNADOT_SANDBOX` | No | Set to `true` to use the sandbox API (default: `false`) |

## Usage with Claude Code

Add to your Claude Code MCP settings (`~/.claude/settings.json` or project `.claude/settings.json`):

```json
{
  "mcpServers": {
    "dynadot": {
      "command": "npx",
      "args": ["-y", "dynadot-mcp"],
      "env": {
        "DYNADOT_API_KEY": "your_api_key_here"
      }
    }
  }
}
```

## Usage with Claude Desktop

Add to your Claude Desktop config (`~/Library/Application Support/Claude/claude_desktop_config.json`):

```json
{
  "mcpServers": {
    "dynadot": {
      "command": "npx",
      "args": ["-y", "dynadot-mcp"],
      "env": {
        "DYNADOT_API_KEY": "your_api_key_here"
      }
    }
  }
}
```

## Available Tools

### Domain Management
| Tool | Description |
|------|-------------|
| `search_domain` | Check domain availability (up to 100 at once) |
| `register_domain` | Register a new domain |
| `bulk_register_domains` | Register multiple domains at once |
| `get_domain_info` | Get detailed domain information |
| `list_domains` | List all domains in account |
| `renew_domain` | Renew a domain |
| `delete_domain` | Delete a domain (grace period) |
| `restore_domain` | Restore a deleted domain (redemption period) |
| `push_domain` | Push domain to another Dynadot account |

### DNS
| Tool | Description |
|------|-------------|
| `get_dns` | Get DNS records for a domain |
| `set_dns` | Set DNS records (A, AAAA, CNAME, MX, TXT, etc.) |
| `set_nameservers` | Configure nameservers (up to 13) |
| `get_nameservers` | Get current nameservers |
| `register_nameserver` | Register a custom nameserver |
| `get_dnssec` | Get DNSSEC settings |
| `set_dnssec` | Set or clear DNSSEC |
| `add_nameserver` | Add a new nameserver entry |
| `set_nameserver_ip` | Update a nameserver's IP address |
| `delete_nameserver` | Delete a nameserver (by host or domain) |
| `list_registered_nameservers` | List all registered nameservers |

### Contacts
| Tool | Description |
|------|-------------|
| `create_contact` | Create a new contact |
| `edit_contact` | Edit an existing contact |
| `delete_contact` | Delete a contact |
| `list_contacts` | List all contacts or get details |
| `set_contact_regional_setting` | Set EU/LV/LT regional contact settings |
| `manage_cn_audit` | Create or check .cn domain audit |
| `set_reseller_verification` | Set reseller WHOIS verification status |

### Transfers
| Tool | Description |
|------|-------------|
| `transfer_domain` | Initiate a domain transfer |
| `cancel_transfer` | Cancel a pending transfer |
| `get_transfer_status` | Check transfer status |
| `get_auth_code` | Get transfer auth/EPP code |
| `authorize_transfer_away` | Approve outgoing transfer |
| `set_auth_code` | Set transfer authorization code |
| `manage_domain_push` | View/accept/reject domain push requests |

### Settings
| Tool | Description |
|------|-------------|
| `set_privacy` | Set WHOIS privacy (full/partial/off) |
| `set_whois_contacts` | Set WHOIS contacts |
| `set_forwarding` | Set URL/stealth forwarding |
| `set_renew_option` | Set auto-renewal option |
| `lock_domain` | Lock domain for transfer protection |
| `set_domain_note` | Set domain note and folder |
| `set_parking` | Enable domain parking |
| `set_hosting` | Set Dynadot hosting (basic/advanced) |
| `set_email_forward` | Set email forwarding or MX records |
| `clear_domain_setting` | Clear a specific domain service setting |

### Folders
| Tool | Description |
|------|-------------|
| `create_folder` | Create a new folder |
| `delete_folder` | Delete a folder |
| `list_folders` | List all folders |
| `set_folder_settings` | Apply default settings to folder |
| `rename_folder` | Rename a folder |

### Account
| Tool | Description |
|------|-------------|
| `get_account_info` | Get account information |
| `get_account_balance` | Check account balance |
| `set_account_defaults` | Set default account settings |
| `list_orders` | List order history |
| `get_order_status` | Check order status by ID |
| `check_processing` | Check for pending operations |
| `list_coupons` | List available coupons |
| `get_tld_price` | Get TLD pricing info |

### Marketplace
| Tool | Description |
|------|-------------|
| `get_auctions` | List open/closed auctions |
| `place_bid` | Place a bid on an auction |
| `manage_backorders` | Add/delete/list backorder requests |
| `set_for_sale` | List a domain for sale |
| `get_marketplace_listings` | View marketplace listings |
| `get_auction_details` | Get auction details and bid history |
| `manage_backorder_auctions` | View/bid on backorder auctions |
| `buy_expired_domain` | Browse/buy expired closeout domains |
| `buy_it_now` | Purchase a marketplace listing |
| `confirm_marketplace_action` | Confirm Afternic/Sedo actions |

## Resources

| URI | Description |
|-----|-------------|
| `dynadot://account` | Account information snapshot |
| `dynadot://balance` | Current account balance |
| `dynadot://domains` | Full domain list |

## Development

```bash
git clone https://github.com/mikusnuz/dynadot-mcp.git
cd dynadot-mcp
npm install
npm run dev
```

## License

MIT

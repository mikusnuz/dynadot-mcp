/**
 * Dynadot API3 JSON Client
 *
 * Wraps all Dynadot API3 commands via GET requests with JSON responses.
 */

const PROD_URL = "https://api.dynadot.com/api3.json";
const SANDBOX_URL = "https://api-sandbox.dynadot.com/api3.json";

export interface DynadotResponse {
  [key: string]: unknown;
}

export class DynadotClient {
  private baseUrl: string;
  private apiKey: string;
  private timeoutMs: number;

  constructor(apiKey: string, sandbox: boolean = false, timeoutMs: number = 30_000) {
    this.baseUrl = sandbox ? SANDBOX_URL : PROD_URL;
    this.apiKey = apiKey;
    this.timeoutMs = timeoutMs;
  }

  /**
   * Send a request to the Dynadot API3.
   * All parameters are passed as query string params.
   */
  async call(command: string, params?: Record<string, string>): Promise<DynadotResponse> {
    const url = new URL(this.baseUrl);
    url.searchParams.set("key", this.apiKey);
    url.searchParams.set("command", command);

    if (params) {
      for (const [key, value] of Object.entries(params)) {
        if (value !== undefined && value !== "") {
          url.searchParams.set(key, value);
        }
      }
    }

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), this.timeoutMs);

    let response: Response;
    try {
      response = await fetch(url.toString(), {
        method: "GET",
        signal: controller.signal,
      });
    } catch (error) {
      clearTimeout(timeoutId);
      if (error instanceof Error && error.name === "AbortError") {
        throw new Error(
          `Dynadot API request timed out after ${this.timeoutMs}ms: ${command}`
        );
      }
      throw error;
    } finally {
      clearTimeout(timeoutId);
    }

    if (!response.ok) {
      throw new Error(
        `Dynadot API HTTP error: ${response.status} ${response.statusText}`
      );
    }

    const json = await response.json() as DynadotResponse;

    // Check for error in response — Dynadot uses various response wrappers
    // but they all have a Status field or ResponseCode
    const responseKey = Object.keys(json).find((k) => k.endsWith("Response"));
    if (responseKey) {
      const inner = json[responseKey] as Record<string, unknown>;
      if (inner?.ResponseCode === -1 || inner?.Status === "error") {
        throw new Error(
          `Dynadot API error: ${inner.Error || inner.Message || JSON.stringify(inner)}`
        );
      }
    }

    return json;
  }

  // ─── Domain ──────────────────────────────────────────────────────

  async search(domains: string[], options?: {
    showPrice?: boolean;
    currency?: string;
    language?: string;
  }): Promise<DynadotResponse> {
    const params: Record<string, string> = {};
    domains.forEach((d, i) => {
      params[`domain${i}`] = d;
    });
    if (options?.showPrice) params.show_price = "1";
    if (options?.currency) params.currency = options.currency;
    if (options?.language) params.language = options.language;
    return this.call("search", params);
  }

  async register(domain: string, duration: number, options?: {
    registrantContact?: string;
    currency?: string;
    coupon?: string;
  }): Promise<DynadotResponse> {
    const params: Record<string, string> = {
      domain,
      duration: duration.toString(),
    };
    if (options?.registrantContact) params.registrant_contact = options.registrantContact;
    if (options?.currency) params.currency = options.currency;
    if (options?.coupon) params.coupon = options.coupon;
    return this.call("register", params);
  }

  async bulkRegister(domains: string[], options?: {
    currency?: string;
    coupon?: string;
  }): Promise<DynadotResponse> {
    const params: Record<string, string> = {};
    domains.forEach((d, i) => {
      params[`domain${i}`] = d;
    });
    if (options?.currency) params.currency = options.currency;
    if (options?.coupon) params.coupon = options.coupon;
    return this.call("bulk_register", params);
  }

  async getDomainInfo(domain: string): Promise<DynadotResponse> {
    return this.call("domain_info", { domain });
  }

  async listDomains(): Promise<DynadotResponse> {
    return this.call("list_domain");
  }

  async renewDomain(domain: string, duration: number, options?: {
    coupon?: string;
    priceCheck?: boolean;
  }): Promise<DynadotResponse> {
    const params: Record<string, string> = {
      domain,
      duration: duration.toString(),
    };
    if (options?.coupon) params.coupon = options.coupon;
    if (options?.priceCheck) params.price_check = "1";
    return this.call("renew", params);
  }

  async deleteDomain(domain: string): Promise<DynadotResponse> {
    return this.call("delete", { domain });
  }

  async restoreDomain(domain: string): Promise<DynadotResponse> {
    return this.call("restore", { domain });
  }

  async pushDomain(domain: string, receiver: string, unlockForPush?: boolean): Promise<DynadotResponse> {
    const params: Record<string, string> = { domain, receiver_push_username: receiver };
    if (unlockForPush) params.unlock_domain_for_push = "1";
    return this.call("push", params);
  }

  // ─── DNS ─────────────────────────────────────────────────────────

  async getDns(domain: string): Promise<DynadotResponse> {
    return this.call("get_dns", { domain });
  }

  async setDns(domain: string, records: Record<string, string>): Promise<DynadotResponse> {
    return this.call("set_dns2", { domain, ...records });
  }

  async setNameservers(domain: string, nameservers: string[]): Promise<DynadotResponse> {
    const params: Record<string, string> = { domain };
    nameservers.forEach((ns, i) => {
      params[`ns${i}`] = ns;
    });
    return this.call("set_ns", params);
  }

  async getNameservers(domain: string): Promise<DynadotResponse> {
    return this.call("get_ns", { domain });
  }

  async registerNameserver(host: string, ip: string): Promise<DynadotResponse> {
    return this.call("register_ns", { host, ip });
  }

  async getDnssec(domain: string): Promise<DynadotResponse> {
    return this.call("get_dnssec", { domain });
  }

  async setDnssec(domain: string, params: Record<string, string>): Promise<DynadotResponse> {
    return this.call("set_dnssec", { domain_name: domain, ...params });
  }

  async clearDnssec(domain: string): Promise<DynadotResponse> {
    return this.call("clear_dnssec", { domain });
  }

  async addNameserver(host: string, ip: string): Promise<DynadotResponse> {
    return this.call("add_ns", { host, ip });
  }

  async setNameserverIp(host: string, ip: string): Promise<DynadotResponse> {
    return this.call("set_ns_ip", { host, ip });
  }

  async deleteNameserver(host: string): Promise<DynadotResponse> {
    return this.call("delete_ns", { host });
  }

  async deleteNameserverByDomain(domain: string): Promise<DynadotResponse> {
    return this.call("delete_ns_by_domain", { domain });
  }

  async listRegisteredNameservers(): Promise<DynadotResponse> {
    return this.call("server_list");
  }

  // ─── Contact ─────────────────────────────────────────────────────

  async createContact(fields: Record<string, string>): Promise<DynadotResponse> {
    return this.call("create_contact", fields);
  }

  async editContact(contactId: string, fields: Record<string, string>): Promise<DynadotResponse> {
    return this.call("edit_contact", { contact_id: contactId, ...fields });
  }

  async deleteContact(contactId: string): Promise<DynadotResponse> {
    return this.call("delete_contact", { contact_id: contactId });
  }

  async listContacts(): Promise<DynadotResponse> {
    return this.call("contact_list");
  }

  async getContact(contactId: string): Promise<DynadotResponse> {
    return this.call("get_contact", { contact_id: contactId });
  }

  async setContactRegionalSetting(command: string, contactId: string, params: Record<string, string>): Promise<DynadotResponse> {
    return this.call(command, { contact_id: contactId, ...params });
  }

  async createCnAudit(contactId: string, params: Record<string, string>): Promise<DynadotResponse> {
    return this.call("create_cn_audit", { contact_id: contactId, ...params });
  }

  async getCnAuditStatus(contactId: string): Promise<DynadotResponse> {
    return this.call("get_cn_audit_status", { contact_id: contactId });
  }

  // ─── Transfer ────────────────────────────────────────────────────

  async transfer(domain: string, authCode: string, options?: {
    registrantContact?: string;
    coupon?: string;
  }): Promise<DynadotResponse> {
    const params: Record<string, string> = { domain, auth: authCode };
    if (options?.registrantContact) params.registrant_contact = options.registrantContact;
    if (options?.coupon) params.coupon = options.coupon;
    return this.call("transfer", params);
  }

  async cancelTransfer(domain: string): Promise<DynadotResponse> {
    return this.call("cancel_transfer", { domain });
  }

  async getTransferStatus(domain: string): Promise<DynadotResponse> {
    return this.call("get_transfer_status", { domain });
  }

  async getTransferAuthCode(domain: string): Promise<DynadotResponse> {
    return this.call("get_transfer_auth_code", { domain });
  }

  async authorizeTransferAway(domain: string): Promise<DynadotResponse> {
    return this.call("authorize_transfer_away", { domain });
  }

  async setTransferAuthCode(domain: string, authCode: string): Promise<DynadotResponse> {
    return this.call("set_transfer_auth_code", { domain, auth: authCode });
  }

  async getDomainPushRequest(): Promise<DynadotResponse> {
    return this.call("get_domain_push_request");
  }

  async setDomainPushRequest(pushId: string, action: string): Promise<DynadotResponse> {
    return this.call("set_domain_push_request", { push_id: pushId, action });
  }

  // ─── Settings ────────────────────────────────────────────────────

  async setPrivacy(domain: string, option: string): Promise<DynadotResponse> {
    return this.call("set_privacy", { domain, option });
  }

  async setWhoisContacts(domain: string, contacts: Record<string, string>): Promise<DynadotResponse> {
    return this.call("set_whois", { domain, ...contacts });
  }

  async setForwarding(domain: string, url: string, isTemp?: boolean): Promise<DynadotResponse> {
    const params: Record<string, string> = { domain, forward_url: url };
    if (isTemp) params.is_temp = "1";
    return this.call("set_forwarding", params);
  }

  async setStealth(domain: string, url: string, title?: string): Promise<DynadotResponse> {
    const params: Record<string, string> = { domain, stealth_url: url };
    if (title) params.stealth_title = title;
    return this.call("set_stealth", params);
  }

  async setRenewOption(domain: string, option: string): Promise<DynadotResponse> {
    return this.call("set_renew_option", { domain, renew_option: option });
  }

  async lockDomain(domain: string): Promise<DynadotResponse> {
    return this.call("lock_domain", { domain });
  }

  async setNote(domain: string, note: string): Promise<DynadotResponse> {
    return this.call("set_note", { domain, note });
  }

  async setFolder(domain: string, folder: string): Promise<DynadotResponse> {
    return this.call("set_folder", { domain, folder });
  }

  async setParking(domain: string, withAds?: boolean): Promise<DynadotResponse> {
    const params: Record<string, string> = { domain };
    if (withAds !== undefined) params.with_ads = withAds ? "1" : "0";
    return this.call("set_parking", params);
  }

  async setHosting(domain: string, hostingType: string, mobileViewOn?: boolean): Promise<DynadotResponse> {
    const params: Record<string, string> = { domain, hosting_type: hostingType };
    if (mobileViewOn !== undefined) params.mobile_view_on = mobileViewOn ? "1" : "0";
    return this.call("set_hosting", params);
  }

  async setEmailForward(domain: string, emailParams: Record<string, string>): Promise<DynadotResponse> {
    return this.call("set_email_forward", { domain, ...emailParams });
  }

  async clearDomainSetting(domain: string, service: string): Promise<DynadotResponse> {
    return this.call("set_clear_domain_setting", { domain, service });
  }

  // ─── Folder ──────────────────────────────────────────────────────

  async createFolder(folderName: string): Promise<DynadotResponse> {
    return this.call("create_folder", { folder_name: folderName });
  }

  async deleteFolder(folderId: string): Promise<DynadotResponse> {
    return this.call("delete_folder", { folder_id: folderId });
  }

  async listFolders(): Promise<DynadotResponse> {
    return this.call("folder_list");
  }

  async renameFolder(folderId: string, folderName: string): Promise<DynadotResponse> {
    return this.call("set_folder_name", { folder_id: folderId, folder_name: folderName });
  }

  // ─── Account ─────────────────────────────────────────────────────

  async getAccountInfo(): Promise<DynadotResponse> {
    return this.call("account_info");
  }

  async getAccountBalance(): Promise<DynadotResponse> {
    return this.call("get_account_balance");
  }

  async listOrders(): Promise<DynadotResponse> {
    return this.call("order_list");
  }

  async getOrderStatus(orderId: string): Promise<DynadotResponse> {
    return this.call("get_order_status", { order_id: orderId });
  }

  async isProcessing(): Promise<DynadotResponse> {
    return this.call("is_processing");
  }

  async listCoupons(): Promise<DynadotResponse> {
    return this.call("list_coupons");
  }

  // ─── Marketplace ─────────────────────────────────────────────────

  async getOpenAuctions(options?: Record<string, string>): Promise<DynadotResponse> {
    return this.call("get_open_auctions", options);
  }

  async getClosedAuctions(options?: Record<string, string>): Promise<DynadotResponse> {
    return this.call("get_closed_auctions", options);
  }

  async placeAuctionBid(auctionId: string, amount: string, currency?: string): Promise<DynadotResponse> {
    const params: Record<string, string> = { auction_id: auctionId, bid_amount: amount };
    if (currency) params.currency = currency;
    return this.call("place_auction_bid", params);
  }

  async addBackorderRequest(domain: string): Promise<DynadotResponse> {
    return this.call("add_backorder_request", { domain });
  }

  async deleteBackorderRequest(domain: string): Promise<DynadotResponse> {
    return this.call("delete_backorder_request", { domain });
  }

  async listBackorderRequests(): Promise<DynadotResponse> {
    return this.call("backorder_request_list");
  }

  async setForSale(domain: string, price: string, currency?: string): Promise<DynadotResponse> {
    const params: Record<string, string> = { domain, price };
    if (currency) params.currency = currency;
    return this.call("set_for_sale", params);
  }

  async getListings(options?: Record<string, string>): Promise<DynadotResponse> {
    return this.call("get_listings", options);
  }

  async getListingItem(listingId: string): Promise<DynadotResponse> {
    return this.call("get_listing_item", { listing_id: listingId });
  }

  async buyItNow(listingId: string, currency?: string): Promise<DynadotResponse> {
    const params: Record<string, string> = { listing_id: listingId };
    if (currency) params.currency = currency;
    return this.call("buy_it_now", params);
  }

  async getAuctionDetails(auctionId: string): Promise<DynadotResponse> {
    return this.call("get_auction_details", { auction_id: auctionId });
  }

  async getAuctionBids(auctionId: string): Promise<DynadotResponse> {
    return this.call("get_auction_bids", { auction_id: auctionId });
  }

  async getOpenBackorderAuctions(): Promise<DynadotResponse> {
    return this.call("get_open_backorder_auctions");
  }

  async getClosedBackorderAuctions(): Promise<DynadotResponse> {
    return this.call("get_closed_backorder_auctions");
  }

  async getBackorderAuctionDetails(auctionId: string): Promise<DynadotResponse> {
    return this.call("get_backorder_auction_details", { auction_id: auctionId });
  }

  async placeBackorderAuctionBid(auctionId: string, amount: string, currency?: string): Promise<DynadotResponse> {
    const params: Record<string, string> = { auction_id: auctionId, bid_amount: amount };
    if (currency) params.currency = currency;
    return this.call("place_backorder_auction_bid", params);
  }

  async getExpiredCloseoutDomains(options?: Record<string, string>): Promise<DynadotResponse> {
    return this.call("get_expired_closeout_domains", options);
  }

  async buyExpiredCloseoutDomain(domain: string, currency?: string): Promise<DynadotResponse> {
    const params: Record<string, string> = { domain };
    if (currency) params.currency = currency;
    return this.call("buy_expired_closeout_domain", params);
  }

  async setAfternicConfirmAction(domain: string, action: string): Promise<DynadotResponse> {
    return this.call("set_afternic_confirm_action", { domain, action });
  }

  async setSedoConfirmAction(domain: string, action: string): Promise<DynadotResponse> {
    return this.call("set_sedo_confirm_action", { domain, action });
  }

  async setResellerContactWhoisVerificationStatus(contactId: string, status: string): Promise<DynadotResponse> {
    return this.call("set_reseller_contact_whois_verification_status", { contact_id: contactId, status });
  }

  async getTldPrice(options?: {
    currency?: string;
    countPerPage?: number;
    pageIndex?: number;
  }): Promise<DynadotResponse> {
    const params: Record<string, string> = {};
    if (options?.currency) params.currency = options.currency;
    if (options?.countPerPage) params.count_per_page = options.countPerPage.toString();
    if (options?.pageIndex) params.page_index = options.pageIndex.toString();
    return this.call("tld_price", params);
  }
}

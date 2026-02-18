/**
 * Dynadot MCP Server Configuration
 *
 * All configuration is read from environment variables.
 */

export interface DynadotConfig {
  /** Dynadot API key */
  apiKey: string;
  /** Use sandbox environment (default: false) */
  sandbox: boolean;
}

export function loadConfig(): DynadotConfig {
  const apiKey = process.env.DYNADOT_API_KEY || "";
  const sandbox =
    process.env.DYNADOT_SANDBOX === "true" ||
    process.env.DYNADOT_SANDBOX === "1";
  return { apiKey, sandbox };
}

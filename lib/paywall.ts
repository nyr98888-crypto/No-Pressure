import "server-only";

/** Paywall / quota gates are inert unless explicitly enabled. */
export function isPaywallEnabled(): boolean {
  return process.env.PAYWALL_ENABLED === "true";
}

export function isPaywallTestMode(): boolean {
  return process.env.PAYWALL_TEST_MODE === "true";
}

export function lemonCheckoutUrl(): string {
  return (process.env.LEMONSQUEEZY_CHECKOUT_URL || "").trim();
}

export function lemonWebhookSecret(): string {
  return (
    process.env.LEMONSQUEEZY_WEBHOOK_SECRET ||
    process.env.LEMON_SQUEEZY_WEBHOOK_SECRET ||
    ""
  ).trim();
}

export const FREE_DARE_LIMIT = 3;

export function paywallDefaults() {
  return {
    paywallEnabled: isPaywallEnabled(),
    isUnlocked: process.env.PAYWALL_ENABLED !== "true",
    testMode: isPaywallTestMode(),
  } as const;
}

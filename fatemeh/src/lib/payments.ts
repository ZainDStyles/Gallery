import "server-only";
import { env } from "./env";

/**
 * Payments are prepared but NOT active.
 *
 * Today, deposits are recorded by hand in the dashboard (provider = MANUAL).
 * To take card deposits later:
 *  1. Create a Stripe account and add STRIPE_SECRET_KEY / STRIPE_WEBHOOK_SECRET.
 *  2. Implement `createDepositCheckout` with Stripe Checkout (amount from the
 *     Deposit row, metadata: { depositId }).
 *  3. Add a webhook route that marks the Deposit PAID on `checkout.session.completed`.
 *  4. Set PAYMENTS_ENABLED=true.
 * The Deposit model already has `provider` and `providerRef` for this.
 */
export const paymentsEnabled = () => env().PAYMENTS_ENABLED;

export async function createDepositCheckout(_depositId: string): Promise<{ url: string }> {
  throw new Error("Online payments are not enabled yet. Record deposits manually in the dashboard.");
}

export function formatMoney(minor: number, currency: string) {
  return new Intl.NumberFormat("en-GB", { style: "currency", currency, maximumFractionDigits: minor % 100 === 0 ? 0 : 2 }).format(minor / 100);
}

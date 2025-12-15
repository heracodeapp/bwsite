import type { PaymentCode, Subscription } from "@shared/schema";

export const getPaymentRef = (code: PaymentCode): string => code.stripePaymentId || "";
export const getSubscriptionRef = (sub: Subscription): string => sub.stripeSubscriptionId || "";
export const getCustomerRef = (sub: Subscription): string => sub.stripeCustomerId || "";

import type { CartCustomization, CartItemType } from "@/type";
import { DELIVERY_FEE, DISCOUNT } from "@/constants";

/**
 * Identifies a cart line: same product + same set of customizations
 * = same line. Order of customizations does not matter.
 */
export const getCartKey = (
  id: string,
  customizations: CartCustomization[] = [],
) =>
  `${id}::${customizations
    .map((c) => c.id)
    .sort()
    .join(",")}`;

/** Price of one unit, including customizations. */
export const getUnitPrice = (
  item: Pick<CartItemType, "price" | "customizations">,
) =>
  item.price + (item.customizations ?? []).reduce((sum, c) => sum + c.price, 0);
/** Price of the whole line (unit price x quantity). */
export const getLinePrice = (item: CartItemType) =>
  getUnitPrice(item) * item.quantity;

export const formatPrice = (value: number) => `$${value.toFixed(2)}`;

export const getOrderTotal = (subtotal: number) =>
  subtotal + DELIVERY_FEE - DISCOUNT;

export const toCents = (value: number) => Math.round(value * 100);

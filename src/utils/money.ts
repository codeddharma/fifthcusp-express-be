/** Round a rupee amount to 2 decimal places (paise precision). */
export function roundMoney(amount: number): number {
  return Math.round((amount + Number.EPSILON) * 100) / 100
}

/** Rupees → integer paise, as Razorpay requires (499.99 * 100 is 49998.99999…). */
export function toPaise(amount: number): number {
  return Math.round(roundMoney(amount) * 100)
}

/** Discount % implied by an MRP and the sale price actually charged (0 when there's no markdown). */
export function deriveDiscountPct(mrp: number | undefined, price: number): number {
  if (!mrp || mrp <= 0 || price >= mrp) return 0
  return roundMoney(((mrp - price) / mrp) * 100)
}

/**
 * Converts the legacy pricing model (`price` + `discountPercentage` applied at checkout) into
 * the MRP model (`mrp` = list price, `price` = sale price actually charged). The discounted price
 * uses whole-rupee rounding, matching what the storefront displayed under the old model.
 */
export function legacyToMrpPricing(
  price: number,
  discountPercentage = 0,
): { mrp: number; price: number; discountPercentage: number } {
  const salePrice = discountPercentage > 0 ? Math.round(price - (price * discountPercentage) / 100) : price
  return { mrp: price, price: salePrice, discountPercentage: deriveDiscountPct(price, salePrice) }
}

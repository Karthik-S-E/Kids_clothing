const inr = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  maximumFractionDigits: 0,
});

/** Indian numbering: ₹499, ₹1,299, ₹12,499 */
export function formatINR(amount: number): string {
  return inr.format(amount);
}

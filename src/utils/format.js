// The same column holds rent (₹/month) for rental shops and a percentage for commission shops.
export function formatPrice(shop) {
  const v = shop.rental_price_or_commission;
  if (v === null || v === undefined || v === "") return "N/A";
  const n = Number(v).toLocaleString("en-IN", { maximumFractionDigits: 2 });
  if (shop.model === "Commission") return `${n}% per order`;
  if (shop.model === "Rental") return `₹${n} / month`;
  return n;
}

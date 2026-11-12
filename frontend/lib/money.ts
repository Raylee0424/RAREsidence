// The API sends and accepts money as integer cents (250000 = $2,500.00), so
// totals are exact. Convert only at the edges: when showing or typing dollars.

const wholeDollars = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  maximumFractionDigits: 0,
});
const withCents = new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" });

/** 250000 -> "$2,500", 250050 -> "$2,500.50" */
export function formatMoney(cents: number): string {
  return (cents % 100 === 0 ? wholeDollars : withCents).format(cents / 100);
}

/** "2500.5" -> 250050. Returns null for anything that isn't a non-negative amount. */
export function dollarsToCents(input: string): number | null {
  const trimmed = input.trim();
  if (!/^\d+(\.\d{1,2})?$/.test(trimmed)) return null;
  return Math.round(Number(trimmed) * 100);
}

/** 250050 -> "2500.5", for pre-filling a dollar input. */
export function centsToDollarInput(cents: number): string {
  return String(cents / 100);
}

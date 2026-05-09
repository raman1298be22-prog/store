export const CURRENCY_MAPPING: Record<string, { code: string, symbol: string, rate: number }> = {
  "US": { code: "USD", symbol: "$", rate: 1 },
  "IN": { code: "INR", symbol: "₹", rate: 83.5 },
  "GB": { code: "GBP", symbol: "£", rate: 0.79 },
  "EU": { code: "EUR", symbol: "€", rate: 0.92 },
  "JP": { code: "JPY", symbol: "¥", rate: 156.5 },
  "AU": { code: "AUD", symbol: "A$", rate: 1.51 },
  "CA": { code: "CAD", symbol: "C$", rate: 1.37 },
};

export async function getUserLocation() {
  try {
    const response = await fetch('https://ipapi.co/json/');
    const data = await response.json();
    return {
      country: data.country_code || "US",
      currency: data.currency || "USD"
    };
  } catch (error) {
    console.error("Failed to detect location:", error);
    return { country: "US", currency: "USD" };
  }
}

export function formatPrice(price: number, currencyCode: string = "USD") {
  return new Intl.NumberFormat(undefined, {
    style: 'currency',
    currency: currencyCode,
  }).format(price);
}

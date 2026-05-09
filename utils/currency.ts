export const CURRENCY_MAPPING: Record<string, { code: string, symbol: string }> = {
  "US": { code: "USD", symbol: "$" },
  "IN": { code: "INR", symbol: "₹" },
  "GB": { code: "GBP", symbol: "£" },
  "EU": { code: "EUR", symbol: "€" },
  "JP": { code: "JPY", symbol: "¥" },
  "AU": { code: "AUD", symbol: "A$" },
  "CA": { code: "CAD", symbol: "C$" },
};

let exchangeRates: Record<string, number> = {};

export async function fetchExchangeRates() {
  if (Object.keys(exchangeRates).length > 0) return exchangeRates; // Cache
  try {
    const response = await fetch('https://api.exchangerate-api.com/v4/latest/USD');
    const data = await response.json();
    exchangeRates = data.rates;
    return exchangeRates;
  } catch (error) {
    console.error("Failed to fetch exchange rates:", error);
    // Fallback rates
    exchangeRates = {
      USD: 1,
      INR: 83.5,
      GBP: 0.79,
      EUR: 0.92,
      JPY: 156.5,
      AUD: 1.51,
      CAD: 1.37,
    };
    return exchangeRates;
  }
}

export async function getUserLocation() {
  try {
    const response = await fetch('/api/location');
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

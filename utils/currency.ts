export const CURRENCY_MAPPING: Record<string, { code: string, symbol: string }> = {
  "US": { code: "USD", symbol: "$" },
  "IN": { code: "INR", symbol: "₹" },
  "GB": { code: "GBP", symbol: "£" },
  "DE": { code: "EUR", symbol: "€" }, // Germany for EUR
  "JP": { code: "JPY", symbol: "¥" },
  "AU": { code: "AUD", symbol: "A$" },
  "CA": { code: "CAD", symbol: "C$" },
  "CN": { code: "CNY", symbol: "¥" },
  "KR": { code: "KRW", symbol: "₩" },
  "BR": { code: "BRL", symbol: "R$" },
  "MX": { code: "MXN", symbol: "$" },
  "RU": { code: "RUB", symbol: "₽" },
  "ZA": { code: "ZAR", symbol: "R" },
  "AR": { code: "ARS", symbol: "$" },
  "TR": { code: "TRY", symbol: "₺" },
  "SG": { code: "SGD", symbol: "S$" },
  "HK": { code: "HKD", symbol: "HK$" },
  "NZ": { code: "NZD", symbol: "NZ$" },
  "SE": { code: "SEK", symbol: "kr" },
  "NO": { code: "NOK", symbol: "kr" },
  "DK": { code: "DKK", symbol: "kr" },
  "CH": { code: "CHF", symbol: "CHF" },
  "PL": { code: "PLN", symbol: "zł" },
  "TH": { code: "THB", symbol: "฿" },
  "MY": { code: "MYR", symbol: "RM" },
  "ID": { code: "IDR", symbol: "Rp" },
  "PH": { code: "PHP", symbol: "₱" },
  "VN": { code: "VND", symbol: "₫" },
  "EG": { code: "EGP", symbol: "£" },
  "NG": { code: "NGN", symbol: "₦" },
  "KE": { code: "KES", symbol: "KSh" },
  "GH": { code: "GHS", symbol: "₵" },
  "MA": { code: "MAD", symbol: "د.م." },
  "TN": { code: "TND", symbol: "د.ت" },
  "AE": { code: "AED", symbol: "د.إ" },
  "SA": { code: "SAR", symbol: "﷼" },
  "IL": { code: "ILS", symbol: "₪" },
  "PK": { code: "PKR", symbol: "₨" },
  "BD": { code: "BDT", symbol: "৳" },
  "LK": { code: "LKR", symbol: "₨" },
  "NP": { code: "NPR", symbol: "₨" },
  "MM": { code: "MMK", symbol: "K" },
  "KH": { code: "KHR", symbol: "៛" },
  "LA": { code: "LAK", symbol: "₭" },
  "MN": { code: "MNT", symbol: "₮" },
  "FR": { code: "EUR", symbol: "€" }, // France
  "IT": { code: "EUR", symbol: "€" }, // Italy
  "ES": { code: "EUR", symbol: "€" }, // Spain
  "NL": { code: "EUR", symbol: "€" }, // Netherlands
  "BE": { code: "EUR", symbol: "€" }, // Belgium
  "AT": { code: "EUR", symbol: "€" }, // Austria
  "PT": { code: "EUR", symbol: "€" }, // Portugal
  "FI": { code: "EUR", symbol: "€" }, // Finland
  "IE": { code: "EUR", symbol: "€" }, // Ireland
  "GR": { code: "EUR", symbol: "€" }, // Greece
  "SK": { code: "EUR", symbol: "€" }, // Slovakia
  "SI": { code: "EUR", symbol: "€" }, // Slovenia
  "EE": { code: "EUR", symbol: "€" }, // Estonia
  "LV": { code: "EUR", symbol: "€" }, // Latvia
  "LT": { code: "EUR", symbol: "€" }, // Lithuania
  "LU": { code: "EUR", symbol: "€" }, // Luxembourg
  "MT": { code: "EUR", symbol: "€" }, // Malta
  "CY": { code: "EUR", symbol: "€" }, // Cyprus
  "HR": { code: "EUR", symbol: "€" }, // Croatia
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
      CNY: 7.2,
      KRW: 1320,
      BRL: 5.1,
      MXN: 18.5,
      RUB: 90,
      ZAR: 18.5,
      ARS: 850,
      TRY: 30,
      SGD: 1.35,
      HKD: 7.8,
      NZD: 1.6,
      SEK: 10.5,
      NOK: 10.8,
      DKK: 6.8,
      CHF: 0.9,
      PLN: 4.0,
      THB: 36,
      MYR: 4.5,
      IDR: 15000,
      PHP: 56,
      VND: 23000,
      EGP: 30,
      NGN: 750,
      KES: 130,
      GHS: 12,
      MAD: 10,
      TND: 3.1,
      AED: 3.67,
      SAR: 3.75,
      ILS: 3.7,
      PKR: 280,
      BDT: 110,
      LKR: 300,
      NPR: 133,
      MMK: 2100,
      KHR: 4100,
      LAK: 17000,
      MNT: 3400,
    };
    return exchangeRates;
  }
}

export async function getUserLocation() {
  // Try GPS-based location first
  if (navigator.geolocation) {
    try {
      const position = await new Promise<GeolocationPosition>((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject, {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 300000 // 5 minutes
        });
      });
      
      const { latitude, longitude } = position.coords;
      
      // Use reverse geocoding to get country
      const response = await fetch(
        `https://api.opencagedata.com/geocode/v1/json?q=${latitude}+${longitude}&key=1ae59703ee7c4de384485c912df09348`
      );
      
      if (!response.ok) {
        throw new Error('Geocoding failed');
      }
      
      const data = await response.json();
      const result = data.results[0];
      
      if (result) {
        const countryCode = result.components.country_code?.toUpperCase() || "US";
        return {
          country: countryCode,
          currency: "USD" // Will be mapped later
        };
      }
    } catch (error) {
      console.warn("GPS location failed, falling back to IP:", error);
    }
  }
  
  // Fallback to IP-based location
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

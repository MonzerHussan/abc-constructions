export const SUPPORTED_CURRENCIES = ['SAR', 'USD', 'EUR', 'GBP', 'AED', 'QAR', 'OMR', 'KWD', 'BHD'] as const;
export type CurrencyCode = (typeof SUPPORTED_CURRENCIES)[number];

export class Currency {
  private constructor(public readonly code: CurrencyCode) {}

  static from(code: string): Currency {
    const normalized = code.toUpperCase();
    if (!SUPPORTED_CURRENCIES.includes(normalized as CurrencyCode)) {
      throw new Error(`Unsupported currency: ${code}`);
    }
    return new Currency(normalized as CurrencyCode);
  }

  static SAR(): Currency { return new Currency('SAR'); }
  static USD(): Currency { return new Currency('USD'); }
  static EUR(): Currency { return new Currency('EUR'); }
  static GBP(): Currency { return new Currency('GBP'); }

  equals(other: Currency): boolean {
    return this.code === other.code;
  }

  toString(): string {
    return this.code;
  }
}

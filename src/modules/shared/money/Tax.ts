import { Money } from '@/modules/shared/money/Money';

export type TaxType = 'VAT' | 'GST' | 'SALES_TAX' | 'CUSTOM_DUTY' | 'WITHHOLDING' | 'OTHER';

export class Tax {
  constructor(
    public readonly type: TaxType,
    public readonly rate: number,
    public readonly amount: Money
  ) {
    if (rate < 0 || rate > 100) throw new Error('Tax rate must be between 0 and 100');
  }

  static of(type: TaxType, rate: number, amount: Money): Tax {
    return new Tax(type, rate, amount);
  }

  static vat(rate: number, amount: Money): Tax {
    return new Tax('VAT', rate, amount);
  }

  static calculate(rate: number, taxableAmount: Money): Tax {
    return new Tax('VAT', rate, taxableAmount.percentage(rate));
  }

  toJSON(): { type: TaxType; rate: number; amount: { amount: number; currency: string } } {
    return { type: this.type, rate: this.rate, amount: this.amount.toJSON() };
  }
}

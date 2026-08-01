import { Money } from '@/modules/shared/money/Money';

export type DiscountType = 'PERCENTAGE' | 'FIXED_AMOUNT' | 'EARLY_PAYMENT' | 'VOLUME' | 'TRADE' | 'OTHER';

export class Discount {
  constructor(
    public readonly type: DiscountType,
    public readonly rateOrAmount: number,
    public readonly value: Money
  ) {
    if (rateOrAmount < 0) throw new Error('Discount rate/amount cannot be negative');
  }

  static percentage(rate: number, originalPrice: Money): Discount {
    if (rate < 0 || rate > 100) throw new Error('Percentage discount must be between 0 and 100');
    return new Discount('PERCENTAGE', rate, originalPrice.percentage(rate));
  }

  static fixed(amount: number, currency: import('@/modules/shared/money/Currency').Currency): Discount {
    const money = Money.of(amount, currency);
    return new Discount('FIXED_AMOUNT', amount, money);
  }

  applyTo(price: Money): Money {
    if (this.type === 'PERCENTAGE') {
      return price.subtract(this.value);
    }
    return price.subtract(this.value);
  }

  toJSON(): { type: DiscountType; rateOrAmount: number; value: { amount: number; currency: string } } {
    return { type: this.type, rateOrAmount: this.rateOrAmount, value: this.value.toJSON() };
  }
}

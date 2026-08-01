import { Currency } from '@/modules/shared/money/Currency';

export class Money {
  private constructor(
    public readonly amount: number,
    public readonly currency: Currency
  ) {
    if (!Number.isFinite(amount)) throw new Error('Amount must be a finite number');
    if (amount < 0) throw new Error('Amount cannot be negative');
  }

  static of(amount: number, currency: Currency): Money {
    return new Money(amount, currency);
  }

  static SAR(amount: number): Money {
    return new Money(amount, Currency.SAR());
  }

  static USD(amount: number): Money {
    return new Money(amount, Currency.USD());
  }

  static zero(currency: Currency): Money {
    return new Money(0, currency);
  }

  add(other: Money): Money {
    if (!this.currency.equals(other.currency)) {
      throw new Error('Cannot add money with different currencies');
    }
    return new Money(this.amount + other.amount, this.currency);
  }

  subtract(other: Money): Money {
    if (!this.currency.equals(other.currency)) {
      throw new Error('Cannot subtract money with different currencies');
    }
    return new Money(this.amount - other.amount, this.currency);
  }

  multiply(factor: number): Money {
    return new Money(this.amount * factor, this.currency);
  }

  divide(divisor: number): Money {
    if (divisor === 0) throw new Error('Cannot divide by zero');
    return new Money(this.amount / divisor, this.currency);
  }

  percentage(pct: number): Money {
    return new Money((this.amount * pct) / 100, this.currency);
  }

  isZero(): boolean {
    return this.amount === 0;
  }

  isGreaterThan(other: Money): boolean {
    if (!this.currency.equals(other.currency)) throw new Error('Cannot compare money with different currencies');
    return this.amount > other.amount;
  }

  isLessThan(other: Money): boolean {
    if (!this.currency.equals(other.currency)) throw new Error('Cannot compare money with different currencies');
    return this.amount < other.amount;
  }

  equals(other: Money): boolean {
    return this.currency.equals(other.currency) && this.amount === other.amount;
  }

  toJSON(): { amount: number; currency: string } {
    return { amount: this.amount, currency: this.currency.toString() };
  }

  toString(): string {
    return `${this.amount.toFixed(2)} ${this.currency.toString()}`;
  }
}

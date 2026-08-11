import { IsFutureDateConstraint } from './is-future-date.validator';

describe('IsFutureDateConstraint', () => {
  const constraint = new IsFutureDateConstraint();

  it('zwraca true dla daty w przyszłości', () => {
    const future = new Date(Date.now() + 24 * 60 * 60 * 1000);
    expect(constraint.validate(future)).toBe(true);
  });

  it('zwraca false dla daty z przeszłości', () => {
    const past = new Date(Date.now() - 24 * 60 * 60 * 1000);
    expect(constraint.validate(past)).toBe(false);
  });

  it('zwraca false dla wartości nie będącej instancją Date', () => {
    expect(constraint.validate('2099-01-01' as unknown)).toBe(false);
    expect(constraint.validate(1234567890 as unknown)).toBe(false);
    expect(constraint.validate(null as unknown)).toBe(false);
    expect(constraint.validate(undefined as unknown)).toBe(false);
  });

  it('zwraca false dla Invalid Date', () => {
    expect(constraint.validate(new Date('nonsense'))).toBe(false);
  });
});

import 'reflect-metadata';
import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';
import { RegisterDto } from './register.dto';

async function validateDto(payload: unknown) {
  const dto = plainToInstance(RegisterDto, payload);
  return validate(dto);
}

describe('RegisterDto', () => {
  it('akceptuje poprawne dane', async () => {
    const errors = await validateDto({
      email: 'jan.kowalski@example.com',
      password: 'tajneHaslo123',
      firstName: 'Jan',
      lastName: 'Kowalski',
      phone: '+48123456789',
    });
    expect(errors).toHaveLength(0);
  });

  it('odrzuca brak wymaganego lastName', async () => {
    const errors = await validateDto({
      email: 'jan.kowalski@example.com',
      password: 'tajneHaslo123',
      firstName: 'Jan',
      phone: '+48123456789',
    });
    expect(errors.some((e) => e.property === 'lastName')).toBe(true);
  });

  it('odrzuca brak wymaganego phone', async () => {
    const errors = await validateDto({
      email: 'jan.kowalski@example.com',
      password: 'tajneHaslo123',
      firstName: 'Jan',
      lastName: 'Kowalski',
    });
    expect(errors.some((e) => e.property === 'phone')).toBe(true);
  });

  it('odrzuca niepoprawny email', async () => {
    const errors = await validateDto({
      email: 'nie-jest-emailem',
      password: 'tajneHaslo123',
      firstName: 'Jan',
    });
    const err = errors.find((e) => e.property === 'email');
    expect(err?.constraints).toHaveProperty('isEmail');
  });

  it('odrzuca hasło krótsze niż 8 znaków', async () => {
    const errors = await validateDto({
      email: 'jan.kowalski@example.com',
      password: 'krotkie',
      firstName: 'Jan',
    });
    const err = errors.find((e) => e.property === 'password');
    expect(err?.constraints).toHaveProperty('minLength');
  });

  it('odrzuca hasło bez cyfry (polityka złożoności #79)', async () => {
    const errors = await validateDto({
      email: 'jan.kowalski@example.com',
      password: 'samesamiliteryy',
      firstName: 'Jan',
      lastName: 'Kowalski',
      phone: '+48123456789',
    });
    const err = errors.find((e) => e.property === 'password');
    expect(err?.constraints).toHaveProperty('matches');
  });

  it('odrzuca hasło bez litery (polityka złożoności #79)', async () => {
    const errors = await validateDto({
      email: 'jan.kowalski@example.com',
      password: '1234567890',
      firstName: 'Jan',
      lastName: 'Kowalski',
      phone: '+48123456789',
    });
    const err = errors.find((e) => e.property === 'password');
    expect(err?.constraints).toHaveProperty('matches');
  });

  it('odrzuca brak wymaganego firstName', async () => {
    const errors = await validateDto({
      email: 'jan.kowalski@example.com',
      password: 'tajneHaslo123',
    });
    expect(errors.some((e) => e.property === 'firstName')).toBe(true);
  });
});

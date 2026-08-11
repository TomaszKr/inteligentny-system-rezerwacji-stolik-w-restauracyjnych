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
    });
    expect(errors).toHaveLength(0);
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

  it('odrzuca brak wymaganego firstName', async () => {
    const errors = await validateDto({
      email: 'jan.kowalski@example.com',
      password: 'tajneHaslo123',
    });
    expect(errors.some((e) => e.property === 'firstName')).toBe(true);
  });
});

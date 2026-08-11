import 'reflect-metadata';
import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';
import { UpdateReservationStatusDto } from './update-reservation-status.dto';
import { ReservationStatus } from '../enums/reservation-status.enum';

async function validateDto(payload: unknown) {
  const dto = plainToInstance(UpdateReservationStatusDto, payload);
  return validate(dto);
}

describe('UpdateReservationStatusDto', () => {
  it('akceptuje poprawny status z enuma', async () => {
    const errors = await validateDto({
      status: ReservationStatus.COMPLETED,
    });
    expect(errors).toHaveLength(0);
  });

  it('akceptuje surową wartość enuma "W toku"', async () => {
    const errors = await validateDto({ status: 'W toku' });
    expect(errors).toHaveLength(0);
  });

  it('odrzuca status spoza enuma', async () => {
    const errors = await validateDto({ status: 'PENDING' });
    const err = errors.find((e) => e.property === 'status');
    expect(err?.constraints).toHaveProperty('isEnum');
  });

  it('odrzuca brak pola status', async () => {
    const errors = await validateDto({});
    expect(errors.some((e) => e.property === 'status')).toBe(true);
  });
});

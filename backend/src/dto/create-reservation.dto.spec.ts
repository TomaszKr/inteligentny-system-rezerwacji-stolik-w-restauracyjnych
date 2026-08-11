import 'reflect-metadata';
import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';
import { CreateReservationDto } from './create-reservation.dto';

const futureISO = () =>
  new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();
const pastISO = () =>
  new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();

async function validateDto(payload: unknown) {
  const dto = plainToInstance(CreateReservationDto, payload);
  return validate(dto);
}

describe('CreateReservationDto', () => {
  it('akceptuje poprawne dane (przyszła data, guests>=1, tableId)', async () => {
    const errors = await validateDto({
      reservationTime: futureISO(),
      guests: 4,
      tableId: 1,
    });
    expect(errors).toHaveLength(0);
  });

  it('odrzuca datę z przeszłości', async () => {
    const errors = await validateDto({
      reservationTime: pastISO(),
      guests: 4,
      tableId: 1,
    });
    expect(errors.some((e) => e.property === 'reservationTime')).toBe(true);
    const err = errors.find((e) => e.property === 'reservationTime');
    expect(err?.constraints).toHaveProperty('isFutureDate');
  });

  it('odrzuca śmieciowy string daty', async () => {
    const errors = await validateDto({
      reservationTime: 'to-nie-jest-data',
      guests: 4,
      tableId: 1,
    });
    expect(errors.some((e) => e.property === 'reservationTime')).toBe(true);
  });

  it('odrzuca brak pola reservationTime', async () => {
    const errors = await validateDto({ guests: 4, tableId: 1 });
    expect(errors.some((e) => e.property === 'reservationTime')).toBe(true);
  });

  it('odrzuca brak pola guests', async () => {
    const errors = await validateDto({
      reservationTime: futureISO(),
      tableId: 1,
    });
    expect(errors.some((e) => e.property === 'guests')).toBe(true);
  });

  it('odrzuca brak pola tableId', async () => {
    const errors = await validateDto({
      reservationTime: futureISO(),
      guests: 4,
    });
    expect(errors.some((e) => e.property === 'tableId')).toBe(true);
  });

  it('odrzuca guests=0 (naruszenie @Min(1))', async () => {
    const errors = await validateDto({
      reservationTime: futureISO(),
      guests: 0,
      tableId: 1,
    });
    const err = errors.find((e) => e.property === 'guests');
    expect(err?.constraints).toHaveProperty('min');
  });
});

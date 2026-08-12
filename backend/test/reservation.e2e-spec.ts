import { Test } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';

/**
 * Test integracyjny/E2E procesu rezerwacji (#11).
 * Wymaga działającej bazy PostgreSQL (env DB_*). Weryfikuje pełny przepływ
 * i faktyczny zapis rezerwacji do bazy (odczyt przez /admin/reservations).
 */
describe('Proces rezerwacji (e2e)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();
    app = moduleRef.createNestApplication();
    app.useGlobalPipes(new ValidationPipe({ transform: true, whitelist: true }));
    await app.init();
  }, 30000);

  afterAll(async () => {
    if (app) await app.close();
  });

  it('admin tworzy stolik, klient rezerwuje, rezerwacja zapisana w bazie', async () => {
    const server = app.getHttpServer();

    // 1. Login admina (seedowany przy starcie)
    const adminLogin = await request(server)
      .post('/auth/login')
      .send({
        email: process.env.ADMIN_EMAIL || 'admin@restaurant.local',
        password: process.env.ADMIN_PASSWORD || 'admin12345',
      })
      .expect(201);
    const adminToken = adminLogin.body.access_token;
    expect(adminToken).toBeDefined();

    // 2. Admin tworzy restaurację i stolik
    const restaurant = await request(server)
      .post('/admin/restaurants')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ name: 'E2E', address: 'ul. Testowa 1', phone: '+48111', email: 'e2e@x.pl' })
      .expect(201);

    const table = await request(server)
      .post('/admin/tables')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ tableNumber: 1, capacity: 4, restaurantId: restaurant.body.id })
      .expect(201);

    // 3. Rejestracja i logowanie klienta
    const email = `e2e-${Date.now()}@x.pl`;
    const reg = await request(server)
      .post('/auth/register')
      .send({ email, password: 'haslo1234', firstName: 'E', lastName: 'E', phone: '+48222' })
      .expect(201);
    // Weryfikacja e-mail (#81) — token zwracany w odpowiedzi (EMAIL_VERIFICATION_EXPOSE_TOKEN)
    await request(server)
      .get(`/auth/verify-email?token=${reg.body.verificationToken}`)
      .expect(200);
    const clientLogin = await request(server)
      .post('/auth/login')
      .send({ email, password: 'haslo1234' })
      .expect(201);
    const clientToken = clientLogin.body.access_token;

    // 4. Klient tworzy rezerwację
    const created = await request(server)
      .post('/reservations')
      .set('Authorization', `Bearer ${clientToken}`)
      .send({ reservationTime: '2027-01-01T19:00:00.000Z', guests: 2, tableId: table.body.id })
      .expect(201);
    expect(created.body.id).toBeDefined();

    // 5. Weryfikacja zapisu w bazie (odczyt przez admina)
    const list = await request(server)
      .get('/admin/reservations')
      .set('Authorization', `Bearer ${adminToken}`)
      .expect(200);
    expect(list.body.some((r: any) => r.id === created.body.id)).toBe(true);
  }, 30000);
});

import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { ThrottlerModule } from '@nestjs/throttler';
import request from 'supertest';
import { ContactController } from '../contact/contact.controller';
import { ContactService } from '../contact/contact.service';

describe('RateLimit on POST /contact', () => {
  let app: INestApplication;
  const sendContactEmail = jest.fn().mockResolvedValue(true);

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [ThrottlerModule.forRoot({ throttlers: [{ ttl: 60_000, limit: 60 }] })],
      controllers: [ContactController],
      providers: [{ provide: ContactService, useValue: { sendContactEmail } }],
    }).compile();
    app = moduleRef.createNestApplication();
    app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));
    await app.init();
  });

  afterAll(() => app.close());

  it('allows 5 messages, then returns 429 without sending more email', async () => {
    const body = { name: 'Test', email: 'test@example.com', subject: 'Hi', message: 'Hello' };
    for (let i = 0; i < 5; i++) {
      await request(app.getHttpServer()).post('/contact').send(body).expect(201);
    }
    await request(app.getHttpServer()).post('/contact').send(body).expect(429);
    expect(sendContactEmail).toHaveBeenCalledTimes(5);
  });
});

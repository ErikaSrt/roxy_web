import { Test, TestingModule } from '@nestjs/testing';
import { AppController } from './app.controller';

describe('AppController', () => {
  let appController: AppController;

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      controllers: [AppController],
    }).compile();

    appController = app.get<AppController>(AppController);
  });

  describe('health', () => {
    it('deve informar que a API está online', () => {
      expect(appController.getHealth()).toEqual({
        status: 'online',
        application: 'Roxy API',
      });
    });
  });
});
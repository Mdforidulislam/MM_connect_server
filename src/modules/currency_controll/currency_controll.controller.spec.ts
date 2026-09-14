import { Test, TestingModule } from '@nestjs/testing';
import { CurrencyControllController } from './currency_controll.controller';
import { CurrencyControllService } from './currency_controll.service';

describe('CurrencyControllController', () => {
  let controller: CurrencyControllController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [CurrencyControllController],
      providers: [CurrencyControllService],
    }).compile();

    controller = module.get<CurrencyControllController>(CurrencyControllController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});

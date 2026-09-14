import { Test, TestingModule } from '@nestjs/testing';
import { CurrencyControllService } from './currency_controll.service';

describe('CurrencyControllService', () => {
  let service: CurrencyControllService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [CurrencyControllService],
    }).compile();

    service = module.get<CurrencyControllService>(CurrencyControllService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});

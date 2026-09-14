import { Test, TestingModule } from '@nestjs/testing';
import { ProfitMarginService } from './profit-margin.service';

describe('ProfitMarginService', () => {
  let service: ProfitMarginService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ProfitMarginService],
    }).compile();

    service = module.get<ProfitMarginService>(ProfitMarginService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});

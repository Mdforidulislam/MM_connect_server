import { Test, TestingModule } from '@nestjs/testing';
import { ProfitMarginController } from './profit-margin.controller';
import { ProfitMarginService } from './profit-margin.service';

describe('ProfitMarginController', () => {
  let controller: ProfitMarginController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ProfitMarginController],
      providers: [ProfitMarginService],
    }).compile();

    controller = module.get<ProfitMarginController>(ProfitMarginController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});

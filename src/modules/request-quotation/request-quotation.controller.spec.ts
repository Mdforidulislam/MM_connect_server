import { Test, TestingModule } from '@nestjs/testing';
import { QuontationController } from './request-quotation.controller';
import { QuotationService } from './request-quotation.service';


describe('RequestQuotationController', () => {
  let controller: QuontationController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [QuontationController],
      providers: [QuotationService],
    }).compile();

    controller = module.get<QuontationController>(QuontationController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});

import { Test, TestingModule } from '@nestjs/testing';
import { BillingInfomationController } from './billing_infomation.controller';
import { BillingInfomationService } from './billing_infomation.service';

describe('BillingInfomationController', () => {
  let controller: BillingInfomationController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [BillingInfomationController],
      providers: [BillingInfomationService],
    }).compile();

    controller = module.get<BillingInfomationController>(BillingInfomationController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});

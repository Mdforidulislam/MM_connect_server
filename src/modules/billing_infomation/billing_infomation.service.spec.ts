import { Test, TestingModule } from '@nestjs/testing';
import { BillingInfomationService } from './billing_infomation.service';

describe('BillingInfomationService', () => {
  let service: BillingInfomationService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [BillingInfomationService],
    }).compile();

    service = module.get<BillingInfomationService>(BillingInfomationService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});

import { Test, TestingModule } from '@nestjs/testing';
import { CompnayInformationService } from './compnay_information.service';

describe('CompnayInformationService', () => {
  let service: CompnayInformationService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [CompnayInformationService],
    }).compile();

    service = module.get<CompnayInformationService>(CompnayInformationService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});

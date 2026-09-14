import { Test, TestingModule } from '@nestjs/testing';
import { CompnayInformationController } from './compnay_information.controller';
import { CompnayInformationService } from './compnay_information.service';

describe('CompnayInformationController', () => {
  let controller: CompnayInformationController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [CompnayInformationController],
      providers: [CompnayInformationService],
    }).compile();

    controller = module.get<CompnayInformationController>(CompnayInformationController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});

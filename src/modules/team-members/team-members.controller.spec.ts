import { Test, TestingModule } from '@nestjs/testing';
import { TeamMemberController } from './team-members.controller';
import { TeamMemberService } from './team-members.service';


describe('TeamMembersController', () => {
  let controller: TeamMemberController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [TeamMemberController],
      providers: [TeamMemberService],
    }).compile();

    controller = module.get<TeamMemberController>(TeamMemberController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});

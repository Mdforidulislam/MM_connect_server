import { Test, TestingModule } from '@nestjs/testing';
import { TeamMemberService } from './team-members.service';

describe('TeamMembersService', () => {
  let service: TeamMemberService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [TeamMemberService],
    }).compile();

    service = module.get<TeamMemberService>(TeamMemberService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});

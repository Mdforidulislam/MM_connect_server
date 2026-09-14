import { Module } from '@nestjs/common';
import { TeamMemberController } from './team-members.controller';
import { TeamMemberService } from './team-members.service';
import { PrismaService } from '@/helper/prisma.service';


@Module({
  controllers: [TeamMemberController],
  providers: [TeamMemberService,PrismaService],
})
export class TeamMembersModule {}

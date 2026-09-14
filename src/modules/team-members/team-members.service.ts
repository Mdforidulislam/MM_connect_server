import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateTeamMemberDto } from './dto/create-team-member.dto';
import { UpdateTeamMemberDto } from './dto/update-team-member.dto';
import { PrismaService } from '@/helper/prisma.service';
import { Request } from 'express';

@Injectable()
export class TeamMemberService {
  constructor(private readonly prisma: PrismaService) {}

  async create(user, dto: CreateTeamMemberDto) {

    const customerId = await this.prisma.customer.findUnique({
      where:{
        userId: user?.id as  string
      } 
    });

    if (!customerId) throw new NotFoundException(`Customer with ID ${user?.id} not found`);

    return this.prisma.teamMember.create({
      data: {
        ...dto,
        customerId: customerId?.id
      } as any
    });

  }

  async findAll(user: any) {

    try{
      const customer = await this.prisma.customer.findUnique({
      where:{
        userId: user?.id
      }
    });

    if (!customer) throw new NotFoundException(`Customer with ID ${customer?.id} not found`);

    return this.prisma.teamMember.findMany({
      where: { 
        customerId : customer?.id 
      },
      orderBy: { createdAt: 'desc' },
    });
    }catch(error: any){
      console.log(error.message);
      throw new NotFoundException(`Customer with ID ${user?.id} not found`);
    }

  }

  async findOne(id: string) {
    const member = await this.prisma.teamMember.findUnique({ where: { id } });
    if (!member) throw new NotFoundException(`Team member with ID ${id} not found`);
    return member;
  }

  async update(id: string, dto: UpdateTeamMemberDto) {
    return this.prisma.teamMember.update({
      where: { id },
      data: {
        dto
      } as any
    });
  }

  async remove(id: string) {
    return this.prisma.teamMember.delete({ where: { id } });
  }
}

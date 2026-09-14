import {
  Body,
  Controller,
  Delete,
  Get,
  HttpStatus,
  Param,
  Patch,
  Post,
  Req,
} from '@nestjs/common';
import { CreateTeamMemberDto } from './dto/create-team-member.dto';
import { UpdateTeamMemberDto } from './dto/update-team-member.dto';
import { Role } from '@prisma/client';
import { TeamMemberService } from './team-members.service';
import { Roles } from '../roles/roles.decorator';
import { ResponseService } from '@/utils/response';
import { Request } from 'express';

@Controller('team-members')
export class TeamMemberController {
  constructor(private readonly teamMemberService: TeamMemberService) {}

  // Create
  @Post()
  @Roles(Role.ADMIN, Role.CUSTOMER)
  async create(
    @Body() dto: CreateTeamMemberDto,
    @Req() req: Request,
  ) {

    const result = await this.teamMemberService.create(req.user, dto);
    return ResponseService.formatResponse({
      statusCode: HttpStatus.CREATED,
      message: 'Team member created successfully',
      data: result,
    });
  }

  // Find all
  @Get()
  @Roles(Role.ADMIN, Role.CUSTOMER)
  async findAll(
    @Req() req: Request
  ) {
    
    const user = req.user;
    const result = await this.teamMemberService.findAll(user);
    return ResponseService.formatResponse({
      statusCode: HttpStatus.OK,
      message: 'Team members fetched successfully',
      data: result,
    });
  }

  // Find one
  @Get('detail/:id')
  @Roles(Role.ADMIN, Role.CUSTOMER)
  async findOne(@Param('id') id: string) {
    const result = await this.teamMemberService.findOne(id);
    return ResponseService.formatResponse({
      statusCode: HttpStatus.OK,
      message: 'Team member fetched successfully',
      data: result,
    });
  }

  // Update
  @Patch(':id')
  @Roles(Role.ADMIN, Role.CUSTOMER)
  async update(@Param('id') id: string, @Body() dto: UpdateTeamMemberDto) {
    const result = await this.teamMemberService.update(id, dto);
    return ResponseService.formatResponse({
      statusCode: HttpStatus.OK,
      message: 'Team member updated successfully',
      data: result,
    });
  }

  // Delete
  @Delete(':id')
  @Roles(Role.ADMIN, Role.CUSTOMER)
  async remove(@Param('id') id: string) {
    const result = await this.teamMemberService.remove(id);
    return ResponseService.formatResponse({
      statusCode: HttpStatus.OK,
      message: 'Team member deleted successfully',
      data: result,
    });
  }
}

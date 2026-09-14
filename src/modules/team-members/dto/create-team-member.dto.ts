
// ========================================
// CREATE DTO
// ========================================
// src/team-members/dto/create-team-member.dto.ts

import { CustomerStatus, Lang, Role } from "@prisma/client";
import { IsEmail, IsEnum, IsNotEmpty, IsOptional, IsString } from "class-validator";

export class CreateTeamMemberDto {
  @IsString()
  @IsNotEmpty()
  fullName: string;

  @IsEmail()
  @IsNotEmpty()
  email: string;

  @IsString()
  @IsOptional()
  contactNo?: string;

  @IsEnum(CustomerStatus)
  @IsOptional()
  status?: CustomerStatus = CustomerStatus.ACTIVE;

  @IsEnum(Lang)
  @IsOptional()
  lang?: Lang = Lang.ENG;


  @IsOptional()
  @IsString()
  @IsNotEmpty()
  customerId: string;
}
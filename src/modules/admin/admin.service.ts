import { PrismaService } from '@/helper/prisma.service';
import { IGenericResponse } from '@/interface/common';
import { ApiError } from '@/utils/api_error';
import QueryBuilder from '@/utils/query_builder';
import { BadRequestException, HttpStatus, Injectable, NotFoundException } from '@nestjs/common';
import { Role, User } from '@prisma/client';
import { UpdateAdminDto } from './dto/update-admin.dto';

type DailyCount = {
  date: string;
  tourBookings: number;
  reviews: number;
};
@Injectable()
export class AdminService {
  constructor(private prisma: PrismaService) { }

  async findAll(query: Record<string, any>): Promise<IGenericResponse<User[]>> {
    const populateFields = query.populate
      ? query.populate
        .split(',')
        .reduce((acc: Record<string, boolean>, field) => {
          acc[field] = true;
          return acc;
        }, {})
      : {};

    const queryBuilder = new QueryBuilder(this.prisma.user, query);
    const result = await queryBuilder
      .range()
      .search([])
      .filter([], [])
      .sort()
      .paginate()
      .fields()
      .rawFilter({
        role: Role.ADMIN,
      })
      .include({ 
        admin: true 
      })
    
      .execute();

    const meta = await queryBuilder.countTotal();

    return { meta, data: result };
  }



async findOne(id: string) {

    const adminExite = await this.prisma.admin.findUnique({
      where:{
        userId: id
      },
 
    });

    if(!adminExite) throw new NotFoundException(`Admin with ID ${id} not found`);

    return await this.prisma.user.findUnique({
      where: { id: adminExite?.userId },
      include: { admin: true },
    })
}


 async update(userId: string, datas: any, avatar?: string[]) {
  const { admin, data, ...userData } = datas;

  return await this.prisma.$transaction(async (tx) => {
    // 1. Check if admin exists by userId (unique)
    const adminRecord = await tx.admin.findUnique({
      where: { userId },
    });

    if (!adminRecord) {
      throw new NotFoundException(`Admin with userId ${userId} not found`);
    }

    // 2. Update admin info
    const adminUpdation = await tx.admin.update({
      where: { id: adminRecord.id },
      data: { ...(admin as any) },
    });

    if (!adminUpdation) {
      throw new ApiError(HttpStatus.NOT_FOUND, `Admin update failed`);
    }

    // 3. Update related user info
    const userUpdation = await tx.user.update({
      where: { id: userId }, // ✅ use userId instead of admin.id
      data: {
        ...userData,
        ...(avatar?.length ? { avatar: avatar[0] } : {}),
      },
    });


    if (!userUpdation) {
      throw new ApiError(HttpStatus.NOT_FOUND, `User update failed`);
    }

    return {
      ...userUpdation,
      admin: adminUpdation,
    };
  }, {
    maxWait: 5000,
    timeout: 10000,
  });
}


  async remove(id: string) {

    const isUserExists = await this.prisma.user.findUnique({
      where: { id },
      include: { admin: true },
    });

    if (!isUserExists) {
      throw new ApiError(HttpStatus.NOT_FOUND, `user not found`);
    }

    await this.prisma.$transaction(
      async (tx) => {
        const adminDeletion = await this.prisma.admin.delete({
          where: { id: isUserExists?.admin.id },
        });

        const userDeletion = await this.prisma.user.delete({
          where: { id: isUserExists.id },
        });
        return userDeletion;
      },
      {
        maxWait: 5000,
        timeout: 10000,
      },
    );

    return 'user deleted successfully';
  }
}

import { BadRequestException, Injectable } from '@nestjs/common';
import { PrismaService } from '@/helper/prisma.service';
import { PrismaHelperService } from '@/utils/is_existance';
import QueryBuilder from '@/utils/query_builder';
import { ProviderProfiteAdd } from '@prisma/client';
import { IGenericResponse } from '@/interface/common';
import { CreateManyProviderProfiteAddDto } from './dto/CreateManyProviderProfiteAddDto';

@Injectable()
export class ProfitMarginService {

  constructor(
    private readonly prisma: PrismaService,
    private readonly helperService: PrismaHelperService
  ) {}
 async create(createProfitMarginDto: CreateManyProviderProfiteAddDto) {

  return await this.prisma.$transaction(async (tx) => {
  const brandIds = createProfitMarginDto.data?.map(item => item?.brandId);

  const isExiteBrand = await tx.ourBrand.findMany({
    where: { id: { in: brandIds } },
    select: { id: true },
  });

  if (isExiteBrand.length !== brandIds.length) {
    throw new BadRequestException('brand info missing in data or brand not found');
  }

  const upsertResults = await Promise.all(
    createProfitMarginDto.data.map(async(item) =>{
    
    const isExiteUser = await tx.customer.findUnique({
        where: { userId: item.customerId },
        select: { id: true }
    });
   return await tx.providerProfiteAdd.upsert({
       where:{
          customerId_brandId:{
               brandId: item.brandId,
               customerId: isExiteUser.id
          }
       },
        update: {
          profiteMargin: item.profiteMargin,
        },
        create: {
          customerId: isExiteUser.id,
          brandId: item.brandId,
          profiteMargin: item.profiteMargin,
        },
   })
   })
  );

  return upsertResults;
});
};

 async findAll(
    query: Record<string, any>,
  ): Promise<IGenericResponse<ProviderProfiteAdd[]>> {


    const populateFields = query.populate
      ? query.populate
          .split(',')
          .reduce((acc: Record<string, boolean>, field) => {
            acc[field] = true;
            return acc;
          }, {})
      : {};

    const queryBuilder = new QueryBuilder(this.prisma.providerProfiteAdd, query);
    const result = await queryBuilder
      .range()
      .search([])
      .filter(["customerId", "brandId"])
      .sort()
      .paginate()
      .fields()
      .populate(populateFields)
      .execute();

    const meta = await queryBuilder.countTotal();

    return { meta, data: result };
  }
 async findOne(id: string) {

  this.helperService.validateEntityExistence(
    "providerProfiteAdd",id,
     'ProviderProfiteAdd not found'
  ); 

  return await this.prisma.providerProfiteAdd.findUnique({ where: { id } });

  }

async  update(id: string, updateProfitMarginDto: any) {
  const isExisted = await this.prisma.providerProfiteAdd.findUnique({ where: { id } });
  if (!isExisted) {
    throw new BadRequestException('ProviderProfiteAdd not found');
  }

  const result = await this.prisma.providerProfiteAdd.update({ where: { id }, data: {...updateProfitMarginDto} });
  return result;

}

async  remove(id: string) {
  
  const isExisted = await this.prisma.providerProfiteAdd.findUnique({ where: { id } });
  if (!isExisted) {
    throw new BadRequestException('ProviderProfiteAdd not found');
  }
  
  const result = await this.prisma.providerProfiteAdd.delete({ where: { id } });
  if(result) return true;
  return false;
  }

}

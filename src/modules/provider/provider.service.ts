import { ConsoleLogger, Injectable, NotFoundException } from '@nestjs/common';
import { IGenericResponse } from '@/interface/common';
import { ApiProviderList, ProductUploadFile } from '@prisma/client';
import QueryBuilder from '@/utils/query_builder';
import { PrismaService } from '@/helper/prisma.service';
import { PrismaHelperService } from '@/utils/is_existance';
import { CLOSING } from 'ws';


@Injectable()
export class ProviderService {
  constructor(
    private prisma: PrismaService,
    private readonly helperService: PrismaHelperService
  ) {}
 async  create(createProviderDto: any) {
      return await this.prisma.apiProviderList.create({
        data:{
          providerName:"FoxCloud.B2B",
          providerUrl:"https://www.foxcloud.ro:44367/api/external/B2B/Search/Price"
        }
       });
}

  async findAll(
    query: Record<string, any>,
  ): Promise<IGenericResponse<ProductUploadFile[]>> {


    const populateFields = query.populate
      ? query.populate
          .split(',')
          .reduce((acc: Record<string, boolean>, field) => {
            acc[field] = true;
            return acc;
          }, {})
      : {};

    const queryBuilder = new QueryBuilder(this.prisma.productUploadFile, query);
    const result = await queryBuilder
      .range()
      .search([])
      .filter([], [])
      .sort()
      .paginate()
      .fields()
      .populate(populateFields)
      .execute();

    const meta = await queryBuilder.countTotal();

    return { meta, data: result };
  }


  async findAllApiProvider(
    query: Record<string, any>,
  ): Promise<IGenericResponse<ApiProviderList[]>> {


    const populateFields = query.populate
      ? query.populate
          .split(',')
          .reduce((acc: Record<string, boolean>, field) => {
            acc[field] = true;
            return acc;
          }, {})
      : {};

    const queryBuilder = new QueryBuilder(this.prisma.apiProviderList, query);
    const result = await queryBuilder
      .range()
      .search([])
      .filter([], [])
      .sort()
      .paginate()
      .fields()
      .populate(populateFields)
      .execute();

    const meta = await queryBuilder.countTotal();

    return { meta, data: result };
  }


async  findOne(id: string) {
  this.helperService.validateEntityExistence("productUploadFile", id,'ProductUploadFile not found');
  const result = await this.prisma.productUploadFile.findUnique({ where: { id } });
    return result;
}

async updateLocal(id: string, updateProviderDto: any) {
  const { isActive } = updateProviderDto;

if (typeof isActive !== "boolean") {
    throw new Error("Invalid input: isActive must be boolean");
}

// Check if the ProductUploadFile exists
const file = await this.prisma.productUploadFile.findUnique({ where: { id } });
if (!file) throw new NotFoundException("ProductUploadFile not found");
  


let batchFindUpdate : number = 10000;
const concurrency = 5;
let index = 0;

const countNumberData =  await this.prisma.product.count({
    where:{
      productUploadFileId:id
    }
});

  while (index < Math.ceil(countNumberData / batchFindUpdate)) {
      const batchGroup = Array.from({ length: concurrency }).map(async (_, i) => {

      const current = index + i;
      if (current >= Math.ceil(countNumberData / batchFindUpdate)) return;

      const findingProduct = await this.prisma.product.findMany({
          where: { productUploadFileId: id },
          skip: batchFindUpdate * current,
          take: batchFindUpdate,
          select: { id: true },
      });

      if (findingProduct.length === 0) return;

      const result = await this.prisma.product.updateMany({
          where: { id: { in: findingProduct.map((p) => p.id) } },
          data: { isActive },
      });


        return result;
      });

      await Promise.all(batchGroup);
      index += concurrency;
  }
  return await this.prisma.productUploadFile.update({ where: { id }, data: updateProviderDto });
}

async updateApi(id: string, updateProviderDto: any) {
  this.helperService.validateEntityExistence("productUploadFile", id,'ProductUploadFile not found');
  return await this.prisma.productUploadFile.update({ where: { id }, data: updateProviderDto });
}


async remove(id: string) {

    // Check if the file exists
    const file = await this.prisma.productUploadFile.findUnique({ where: { id } });
    if (!file) throw new NotFoundException("ProductUploadFile not found");

    const batchSize = 10000;
    let totalDeleted = 0;
    let round = 0;

    const totalCountNumber = await this.prisma.product.count({
      where:{
        productUploadFileId:id
      }
    });


    for (let i = 0; i < Math.ceil(totalCountNumber / batchSize); i++) {
     
      const products = await this.prisma.product.findMany({
        where: { productUploadFileId: id },
        select: { id: true },
        take: batchSize,
      });

      if (products.length === 0) break;

      const ids = products.map(p => p.id);
      const result = await this.prisma.product.deleteMany({
        where: { id: { in: ids } },
      });

      totalDeleted += result.count;
    }

    if(totalDeleted === totalCountNumber){
        return  await this.prisma.productUploadFile.delete({ where: { id } });
    }

    // while (true) {
    //   round++;

    //   // Fetch up to concurrency * batchSize IDs
    //   const batches = await Promise.all(
    //     Array.from({ length: concurrency }).map(async (_, i) => {

    //       const products = await this.prisma.product.findMany({
    //         where: { productUploadFileId: id },
    //         select: { id: true },
    //         take: batchSize,
    //       });


    //       if (products.length === 0) return null;

    //       const ids = products.map(p => p.id);
    //       const result = await this.prisma.product.deleteMany({
    //         where: { id: { in: ids } },
    //       });

    //       console.log(result,'result =========>');

    //       totalDeleted += result.count;
    //       console.log(
    //         `Round ${round} | Batch ${i + 1}/${concurrency}: Deleted ${result.count} items (Total: ${totalDeleted})`
    //       );

    //       return result.count;
    //     })
    //   );

    //   console.log(batches,'batches   =>======>');

    //   if (batches.every(b => b === null)) break;
    // }

    // const isDeleted = await this.prisma.product.findMany({
    //     where: { 
    //       productUploadFileId: id
    //     } 
    // }); 

    //  if(isDeleted.length === 0) return await this.prisma.productUploadFile.delete({ where: { id } });

  // Delete the file only when no products remain


  return false;
}

}

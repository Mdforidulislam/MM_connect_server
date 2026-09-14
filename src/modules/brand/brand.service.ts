import { BadRequestException, Injectable } from '@nestjs/common';
import { UpdateBrandDto } from './dto/update-brand.dto';
import { CreateOurBrandDto } from './dto/create-brand.dto';
import { PrismaService } from '@/helper/prisma.service';
import { IsApproved, OurBrand } from '@prisma/client';
import { IGenericResponse } from '@/interface/common';
import QueryBuilder from '@/utils/query_builder';
import { PrismaHelperService } from '@/utils/is_existance';

@Injectable()
export class BrandService {
  constructor(
    private prisma: PrismaService,
    private readonly helperService: PrismaHelperService
  ) {}
  async create(createBrandDto: CreateOurBrandDto) {
  const result = await this.prisma.$transaction(async (tx) => {

    const ifBrandExists = await tx.ourBrand.findUnique({
      where: { Brand: createBrandDto.Brand },
    });

    if(ifBrandExists) {
      throw new BadRequestException('Brand already exists');
    }

    // 1️⃣ Create the brand
    const createBrand = await tx.ourBrand.create({
      data: { ...createBrandDto },
    });

    // 2️⃣ Find all approved users
    const approvedUsers = await tx.customer.findMany({
      where: { isApproved: IsApproved.APPROVED },
    });

    // 3️⃣ Map users to brand
    const userBrandMappings = approvedUsers.map((customer) => ({
      customerId: customer.id,
      brandId: createBrand.id
    }));

    // 4️⃣ Only create mappings if there are users
    let createMapping = null;
    if (userBrandMappings.length > 0) {

      for (const item of userBrandMappings) {

           const isExiteBrandProfite = await this.prisma.providerProfiteAdd.findUnique({
            where:{
              customerId_brandId:{
                brandId: item.brandId,
                customerId: item.customerId
              }
            }
          });


          if(isExiteBrandProfite){
              continue 
          }

          await this.prisma.providerProfiteAdd.create({
            data:{
              customerId: item.customerId,
              brandId: item.brandId
            }
          })
      }

    } else {
      console.log('No approved users found, skipping mapping creation');
    }

    return { createBrand, createMapping };
  });

  return result;
}

async findAll(
    query: Record<string, any>,
    id: string,
    user: any
  ): Promise<IGenericResponse<OurBrand[]>> {

    const populateFields = query.populate
      ? query.populate
          .split(',')
          .reduce((acc: Record<string, boolean>, field) => {
            acc[field] = true;
            return acc;
          }, {})
      : {};
    
    const customer = await this.prisma.customer.findUnique({
      where: {
        userId: id
      }
    });




    const queryBuilder = new QueryBuilder(this.prisma.ourBrand, query);
    const result = await queryBuilder
      .range()
      .search(["Brand"])
      .filter([], [])
      .rawFilter({ })
      .sort()
      .include({
         ...(customer && { providerProfiteAdd: true}),
         
      })
      // .rawFilter({
      //   createdAt: "desc"
      // })
      .paginate()
      .fields()
      .populate(populateFields)
      .execute();

    const meta = await queryBuilder.countTotal();

    
    if(customer){
          result.forEach((brand: any) => {
          brand.providerProfiteAdd = brand?.providerProfiteAdd.filter((providerProfiteAdd: any) => providerProfiteAdd?.customerId === customer?.id);
    });
    }
    
    return { meta, data: result };
}

async  findOne(id: string) {
  
  const isBrandExists = await this.prisma.ourBrand
    .findUnique({
      where: { id },
    })
    .catch(() => null);
  if (!isBrandExists) {
    throw new BadRequestException('Brand not found');
  }

  return await this.prisma.ourBrand.findUnique({ where: { id } });
}
 async update(id: string, updateBrandDto: UpdateBrandDto) {

     
      await this.prisma.$transaction(async (tx) => {

                const isBrandExists = await tx.ourBrand.findUnique({
                                                                      where: { id },
                                                                   })
                                                                    .catch(() => null);
                console.log(isBrandExists,'isBrandExists');
            if (!isBrandExists) {
              throw new BadRequestException('Brand not found');
            }

            return await tx.ourBrand.update({
                                where:{id},
                                data:{
                                  ...updateBrandDto, 
                                }
                          })
            
      })
 }

 async remove(id: string) {
 
  const isExiteBrand = await this.prisma.ourBrand.findUnique({ where: { id } });
    
    if (!isExiteBrand) {
      throw new BadRequestException('brand not found');
    }
  
    const deleted = await this.prisma.$transaction(async (tx) => {
      // Step 1: Delete all related ProviderProfiteAdd entries
      await tx.providerProfiteAdd.deleteMany({
        where: {
          brandId: id,
        },
    });

    // Step 2: Delete the brand itself
    const brand = await tx.ourBrand.delete({
      where: { id },
    });
    return brand;

  });

  if(!deleted){
    throw new Error('brand not found')
  }  

  return deleted;
  
}
}

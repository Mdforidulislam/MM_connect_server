import { parentPort, Worker } from 'worker_threads';
import os from "os";
import { Injectable, BadRequestException, NotFoundException, InternalServerErrorException } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bull';
import { Queue } from 'bull';
import { Readable } from 'stream';
import { v4 as uuidv4 } from 'uuid';
import * as fs from 'fs';
import * as path from 'path';
import * as readline from 'readline';
import * as XLSX from 'xlsx';
import  pdfParse from 'pdf-parse';
import { PrismaService } from '@/helper/prisma.service';
import { PrismaHelperService } from '@/utils/is_existance';
import { IGenericResponse } from '@/interface/common';
import { Product } from '@prisma/client';
import QueryBuilder from '@/utils/query_builder';
import { FoxcloudService } from './apiProvider/foxcloud.service';
import { SiemensService } from './apiProvider/siemens.service';
import { Parser } from 'json2csv';
import { all } from 'node_modules/axios/index.cjs';
import { PartialSearchResult } from './product.interface';



@Injectable()
export class ProductService {
  constructor(@InjectQueue('product') 
  private readonly JobQueue: Queue,
  private readonly prisma: PrismaService,
  private readonly helperService: PrismaHelperService,
  private readonly foxCloud: FoxcloudService,
  private readonly siyemens: SiemensService 
) {}

/**
 * ------------------------------------------------------------------
 * @link : Bulk Product Create Service Method
 * @access : Should Be Authenticated User
 * @method : POST
 * @param : file : Express.Multer.File
 * @description : Bulk Product Create Service Method to handle CSV , Excel , PDF File Upload and parse the file and create product in bulk using job queue
 * @author : mmengservices
 * @date : 2024-06-12
 * ------------------------------------------------------------------
 * @param file 
 * @returns 
 */

async create(file: Express.Multer.File) {

    let parsedData: any[] = [];
    let response: any ;

    // Detect which file type & parse accordingly
    switch (file.mimetype) {
      case 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet':
          const parsResponse  = await this.handleExcel(file);
                parsedData =  parsResponse.products;
                response =  parsResponse.fileUploadCreate;
          break;

      case  "application/pdf":
                parsedData = await this.handlePDF(file);
          break;

      case 'text/csv':
                parsedData = await this.handleCSV(file);
          break;

      default:
        throw new BadRequestException('Unsupported file type');
    }

    const batchSize = 1000;
    const totalBatches = Math.ceil(parsedData.length / batchSize);

    for (let i = 0; i < parsedData.length; i += batchSize) {
      const batch = parsedData.slice(i, i + batchSize);
      await this.JobQueue.add("createProduct", {
        data: batch,
        fileName: response.fileName,
        fileUploadId: response.id,
        totalBatches: totalBatches,
        currentBatch: i / batchSize,
      },{
        delay: 500
      });
    }

  return response;
}

  /**
   *  CSV Handler – Streams & parses CSV line by line
   */

private async handleCSV(file: Express.Multer.File): Promise<any[]> {
    const stream = Readable.from(file.buffer.toString('utf8'));
    const rl = readline.createInterface({ input: stream });

    const rows: any[] = [];
    for await (const line of rl) {
      const [name, price, category] = line.split(',');
      if (name && price && category) {
        rows.push({ name, price, category });
      }
    }
    return rows;
}

  /**
   *  Excel Handler – Parses XLSX to JSON
   */
private async handleExcel(file: Express.Multer.File) {
    try {

      if (!file || !file.buffer) {
        throw new BadRequestException("Uploaded file is missing or corrupted");
      }
      let workbook: XLSX.WorkBook;
      try {
        workbook = XLSX.read(file.buffer, { type: "buffer", cellDates: true });
      } catch (err) {
        throw new BadRequestException("Invalid Excel file format. Please upload a valid .xlsx or .xls file.");
      }

      if (!workbook.SheetNames.length) {
        throw new BadRequestException("Excel file has no sheets");
      }

      const sheet = workbook.Sheets[workbook.SheetNames[0]];
      const rawData: any[][] = XLSX.utils.sheet_to_json(sheet, { header: 1, defval: "" });

      if (!rawData.length) {
        throw new BadRequestException("Excel file is empty");
      }

      const [headerRow, ...dataRows] = rawData;

      if (!headerRow || headerRow.length === 0) {
        throw new BadRequestException("Header row not found in Excel file");
      }


      const normalize = (val: string) => val?.toLowerCase()?.trim();


      const headerMap: Record<string, number> = {
        BrandIndex: headerRow.findIndex((col: string) => normalize(col).includes("brand")),
        PartNumberIndex: headerRow.findIndex((col: string) => normalize(col).includes("partnumber")),
        PriceIndex: headerRow.findIndex((col: string) => normalize(col).includes("price")),
        LeadTimeUnitsIndex: headerRow.findIndex((col: string) => normalize(col).includes("leadtimeunits")),
        LeadTimeTypeIndex: headerRow.findIndex((col: string) => normalize(col).includes("leadtimetype")),
        supplierNameIndex: headerRow.findIndex((col: string) => normalize(col).includes("suppliername")),
      };

      if (headerMap.PartNumberIndex === -1 || headerMap.PriceIndex === -1) {
        throw new BadRequestException("Excel must contain 'PartNumber' and 'Price' columns");
      }

      if (
        headerMap.supplierNameIndex === -1
      ) {
        throw new BadRequestException(
          "Excel must contain 'LeadTimeUnits', 'LeadTimeType' and 'SupplierName' columns"
        );
      }

      const fileReference = `${file.originalname}-${uuidv4()}`;

      const createFileUpload = await this.prisma.productUploadFile.create({
        data: {
          fileName: fileReference,
          fileType: file.mimetype,
          uploadedBy: "admin",
          fileSize: file.size,
        },
      });


      const products: any[] = [];
      for (let i = 0; i < dataRows.length; i++) {
        const row = dataRows[i];
        const rowNumber = i + 2;

        const PartNumber = row[headerMap.PartNumberIndex];
        const Price = row[headerMap.PriceIndex];

        if (!PartNumber) {
          console.warn(`Skipping row ${rowNumber}: missing PartNumber`);
          continue;
        }
        if (!Price || isNaN(Number(Price))) {
          console.warn(`Skipping row ${rowNumber}: invalid Price -> ${Price}`);
          continue;
        }

        const product = {
          ProductName: fileReference,
          PartNumber: String(PartNumber).trim(),
          Price: parseFloat(Price.toString().replace(/,/g, "")),
          Currency: headerRow[headerMap.PriceIndex]?.split("(")[1]?.split(")")[0] || "USD",
          Brand: headerMap.BrandIndex !== -1 ? row[headerMap.BrandIndex] || "Unknown" : "Unknown",
          LeadTimeUnits: headerMap.LeadTimeUnitsIndex !== -1 ? row[headerMap.LeadTimeUnitsIndex] || "0" : "0",
          LeadTimeTypes: headerMap.LeadTimeTypeIndex !== -1 ? row[headerMap.LeadTimeTypeIndex] || "DAYS" : "DAYS",
          supplierName:  headerMap.supplierNameIndex !== -1 ? row[headerMap.supplierNameIndex] || "Unknown" : "Unknown",
          productUploadFileId: createFileUpload.id,
        };

      const isEmpty = Object.keys(product).every((item)=> !item)

      if(isEmpty) throw new BadRequestException(`Row ${rowNumber} is empty or invalid`);

        products.push(product);
      }

      if (!products.length) {
        throw new BadRequestException("No valid product rows found in Excel file");
      }


      return {
        fileUploadCreate: createFileUpload,
        products,
        stats: {
          totalRows: dataRows.length,
          validRows: products.length,
          skippedRows: dataRows.length - products.length,
        },
      };
    } catch (error) {
      console.error("Excel file processing failed:", error);
      throw new InternalServerErrorException(`Excel processing error: ${error}`);
    }
}

/**
   *  PDF Handler – Extracts text from PDF and parses line
   *  @param file
   *  @returns
*/

private async handlePDF(file: Express.Multer.File): Promise<any[]> {
    const data = await pdfParse(file.buffer);
    const lines = data.text.split('\n');

    const rows: any[] = [];
    for (const line of lines) {
      const [name, price, category] = line.trim().split(',');
      if (name && price && category) {
        rows.push({ name, price, category });
      }
    }
    return rows;
}


/**
 * ------------------------------------------------------------------
 * @link : Get All Products Service Method
 * @access : Should Be Authenticated User
 * @method : GET
 * @param : query : Record<string, any>
 * description : Get All Products Service Method to handle query params for filtering , sorting , pagination , field selection and population
 * @author : mmengservices
 * @date : 2024-06-10
 * ------------------------------------------------------------------
 * @param query 
 * @returns 
 */

async findAll(
    query: Record<string, any>,
  ): Promise<IGenericResponse<Product[]>> {

    const populateFields = query.populate
      ? query.populate
          .split(',')
          .reduce((acc: Record<string, boolean>, field) => {
            acc[field] = true;
            return acc;
          }, {})
      : {};

    const queryBuilder = new QueryBuilder(this.prisma.product, query);
    const result = await queryBuilder
      .range()
      .search(["PartNumber", "Brand", "ProductName"])
      .filter(["PartNumber", "Brand", "ProductName","productUploadFileId"])
      .sort()
      .paginate()
      .fields()
      .populate(populateFields)
      .execute();

    const meta = await queryBuilder.countTotal();

    return { meta, data: result };
}

/**
 * ------------------------------------------------------------------
 * @link : Get Single Product Service Method
 * @access : Should Be Authenticated User
 * @method : GET
 * @param : id : string
 * @description : Get Single Product Service Method to handle get single product by id with validation
 * @author : mmengservices
 * @date : 2024-06-10
 * ------------------------------------------------------------------
 * @param id 
 * @returns 
 */

async findOne(id: string) {
    this.helperService.validateEntityExistence("product", id,'Product not found');
     return await this.prisma.product.findUnique({ where: { id } });
}

/**
 * ------------------------------------------------------------------
 * @link : Update Product Service Method
 * @access : Should Be Authenticated User
 * @method : PATCH
 * @param : id : string
 * @description : Update Product Service Method to handle update product by id with validation
 * @author : mmengservices
 * @date : 2024-06-10
 * ------------------------------------------------------------------
 * @param id 
 * @param updateProductDto 
 * @returns 
 */

async update(id: string, updateProductDto: any) {
      this.helperService.validateEntityExistence("product", id,'Product not found');
      return await this.prisma.product.update({ where: { id }, data: {...updateProductDto} });
}

/**
 * ------------------------------------------------------------------
 *  @link : Remove Product Service Method
 * @access : Should Be Authenticated User
 * @method : DELETE
 * @param : id : string
 * description : Remove Product Service Method to handle delete product by id with validation
 * @author : mmengservices
 * @date : 2024-06-10
 * ------------------------------------------------------------------
 * @param id
 * @returns
 * */

async  remove(id: string) {
    
      const ifExist = await this.prisma.product.findUnique({ where: { id } });  
      if(!ifExist) throw new NotFoundException('Product not found');

      const result = await this.prisma.product.deleteMany({ where: { id } });
      if(result) return true;
      return false;
}

/**
 * ----------------------------------------------------------------- 
 * @link : Two Website connect with searcing product (FoxCloud , Siemens)
 * @access : Should Be Authenticated User
 * @method : GET
 * @param : PartNumber : string | number, quantity: number, currency: string , DBId: string
 * @returns : Product Details with price , leadTime ,Brand , ETA availability
 * @author : mmengservices
 * @date : 2024-06-10
 * @description : Searcing 2 condition > one is fully partNumber match Searching : fist Call FoxCloud API get data if not found go to partial searching , after geting the customer profit margin apply margin on foxcloud price and local DB price and return the final result  
 * @description : Second is Partial match Searching :  if no exact match found from foxcloud API then go to local DB and search the partNumber with contains function and return the unique result and remove the duplicate partNumber with brand name and return the final result with profit margin applied price return finally price
 * @description : There can able to convert currency also work the currency conversion with base local db currency which is controlled by admin change manually from admin currency rate setting
 * -----------------------------------------------------------------
 */

async SearchingProductPartNumber(query: Record<string, any>, user: any) {

    /**
     * -------------------------------------------------------------------
     * @description : Remove the space from ParNumber and Uppercase the partNumber checking others return error if not provide PartNumber 
     * -------------------------------------------------------------------
     */

    let PartNumber = query?.searchTerm?.trim();
    const quantity = Number(query?.quantity) || 1;
    const currency = query?.currency;
    const DBId = query?.DBId;        

    if (DBId) {
      PartNumber = PartNumber?.toString()?.toUpperCase();
    }else if(PartNumber) {
      PartNumber = PartNumber.toString().toUpperCase();
    }

    if (!PartNumber) {
      throw new BadRequestException("Search term is required");
    }

    /**
     * -------------------------------------------------------------------
     * @description : Exact Match Searching from foxCloude API && mach partNumber with foxcloud product partnumber
     * -------------------------------------------------------------------
     */

    const foxData = await this.foxCloud.searchFoxcloud(PartNumber);
    let isPartNumber : any | null ;

    if (foxData?.[0]?.Product) {
        const productParts = foxData[0].Product.split(/[/\s]+/).map(p => p.trim());
        isPartNumber = productParts.find((item : any) => item === PartNumber);
    }

    /**
     * -------------------------------------------------------------------
     * @description : if not geting data from foxloud then Partial Match Searching from local DB
     * -------------------------------------------------------------------
     */

    if (!foxData || foxData?.length === 0 || !foxData[0]?.Brand) {
      return { partiallyMatched: await this.searchPartialProduct(PartNumber) };
    }

    /**
     * -------------------------------------------------------------------
     * @description : 1. Get Customer , CurrencyControll , All Product from local DB 
     * -------------------------------------------------------------------
     */

    // fetch samltimeously data customer , currencyControll , all product
    const [ customer, currencyControll , allProduct ] = await Promise.all([
      this.prisma.customer.findUnique({
          where:{
            userId: user?.id
          }
        }),

      this.prisma.currencyControll.findMany({
        where: { isDelete: false },
        orderBy: { createdAt: 'desc' },
        take: 1, 
      }),

      this.prisma.product.findMany({
          where: {
              PartNumber: isPartNumber ? isPartNumber : PartNumber,
              isActive: true
         },
         select:{
            id: true,
            PartNumber: true,
            Brand: true,
            Price: true,
            Currency: true,
            supplierName: true,
            LeadTimeUnits: true,
            LeadTimeTypes: true
         }
      })

    ]);
 
    // TODO: "" : what is this??
    // null === 0 
    // "" === null 

    /**
     * -------------------------------------------------------------------
     * @description : 2. Get Profit Margin from local DB and apply margin on foxcloud price and local DB price and return the final result
     * -------------------------------------------------------------------
     */

    const margin = await this.getProfitMargin(customer?.id, foxData[0]?.Brand);
    if(foxData.length > 0){
    /**
     * -------------------------------------------------------------------
     * @description : 3. Check ETA Availability from local DB product list
     * ------------------------------------------------------------------
     */

    const isETAAvailable = await this.checkETA( allProduct, foxData[0]?.Brand);

    // Add FoxCloud as first option 
    isETAAvailable.unshift({
        ProviderFrom: "FoxCloud",
        IdFromDB: foxData[0]?.id || null,
        PartNumber: foxData[0]?.PartNumber,
        Product: foxData[0]?.Product,
        Brand: foxData[0]?.Brand,
        Price: foxData[0]?.FinalSellPrice,
        LeadTimeUnits: (this.convertLeadTime(foxData[0]?.LeadTimeType, foxData[0]?.LeadTimeUnits)) || 0,
        LeadTimeType: foxData[0]?.LeadTimeType,
    });

    /**
     * -------------------------------------------------------------------
     * @description : if DBId Not provide so Geting price HIger price all the price list ( foxcloud and local Db Price ) with profit margin applied price
     * @description : if DBId provide so Geting price from local DB only with profit margin applied price
     * -------------------------------------------------------------------
     */

    let unitePrice: number | null;
    let totalPrice: number;
    let LeadTimeUnits: number | string | null;
    let LeadTimeType: string | null;
    if(DBId){        
        let LeadTimeUnitsInner : number | string | null ;
        let LeadTimeTypeInner : string | null;
                const isDBPriceAndPrice = await this.getDBETApriceDelivery(PartNumber, DBId, customer?.id);
                unitePrice =  this.convertCurrency(currencyControll[0], isDBPriceAndPrice.unitePrice, isDBPriceAndPrice?.currency?.toUpperCase(), currency?.toUpperCase());
                totalPrice = this.roundSecondDecimalAndMultiplayQuantity(unitePrice , quantity);
        if(foxData[0]?.Brand === 'SIEMENS'){
                const siemensETA = await this.siyemens.searchSiemens(foxData[0]?.Product);
              if(siemensETA.length > 0 && parseInt(siemensETA[0]?.stockQuantityUIvalue) > 0){
                LeadTimeUnitsInner = "2-4";
                LeadTimeTypeInner = "WEEKS";      
              } else if(siemensETA.length > 0 && siemensETA[0]?.stockQuantityUIvalue <= 0){
                LeadTimeUnitsInner = siemensETA[0]?.uiMessage;
                LeadTimeTypeInner = "string";
        }
        }else {
                LeadTimeUnitsInner = isDBPriceAndPrice?.LeadTimeUnits;
                LeadTimeTypeInner = isDBPriceAndPrice?.LeadTimeType;
        }
                LeadTimeUnits = LeadTimeUnitsInner;
                LeadTimeType = LeadTimeTypeInner;   
    }

    /**
     * -------------------------------------------------------------------
     * @description : 1. convert currency function call
     * @description : 2. round second decimal and quantity calculation function call
     * @description : 3. convert little bit lead time function call
     * -------------------------------------------------------------------
     */

    else if (!DBId){ 

                  const convertETACheck = isETAAvailable.sort((a: any, b: any) => {
                      return a.Price - b.Price;
                  });

                  unitePrice =  this.convertCurrency(
                    currencyControll[0],
                    this.applyMargin(convertETACheck[0]?.Price,
                    margin?.profiteMargin),
                    convertETACheck[0]?.Currency?.toUpperCase() || foxData[0]?.Currency?.toUpperCase(),
                    currency?.toUpperCase()
                  );

                  totalPrice = this.roundSecondDecimalAndMultiplayQuantity(unitePrice, quantity) ;
                  LeadTimeUnits = convertETACheck[0]?.LeadTimeUnits;
                  LeadTimeType = convertETACheck[0]?.LeadTimeType;               
  }
    return {
                    ...foxData[0],
                    Product: foxData[0]?.Product || foxData[0]?.PartNumber ,
                    Quantity: quantity || 1,
                    Currency: currency || foxData[0]?.Currency,
                    Price: unitePrice,
                    TotalPrice:  totalPrice,
                    LeadTimeUnits: LeadTimeUnits,
                    LeadTimeType: LeadTimeType,
                    isETAAvailable: await Promise.all(
                      isETAAvailable?.map(async(item: any) => {
                      const Price =  this.applyMargin(item?.Price, margin?.profiteMargin);
                          return {
                              ...item,
                              Price: await this.convertCurrency(currencyControll[0], Price, foxData[0]?.Currency?.toUpperCase() , currency?.toUpperCase())
                          }
                      })
                    )
      };
    }

    // 5. No exact match → partial search
    return { partiallyMatched: await this.searchPartialProduct(PartNumber) };
}

roundSecondDecimalAndMultiplayQuantity(num: number, quantity: number): number {
    const calMultiplit = num * quantity;

    if(isNaN(calMultiplit)) return 0;
    if(!isFinite(calMultiplit)) return 0;
    if(calMultiplit < 0) return 0;
    if(calMultiplit === 0) return 0;
    if(calMultiplit !== null) {
        return Number((calMultiplit * quantity ).toFixed(2)) || 0 ;
    }
}

/**
 * -------------------------------------------------------------------------
 * Currency Conversion Method 
 * -------------------------------------------------------------------------
 * @param currency 
 * @param amount 
 * @param from 
 * @param to 
 * @returns 
 */

convertCurrency(currency: any  , amount: number , from: string , to: string) {
  if (!currency) {
    throw new Error('Currency rates not found');
  }
  const fromRate = currency[from];
  const toRate = currency[to];
  if (fromRate === undefined || toRate === undefined) {
    throw new Error(`Invalid currency codes: ${from} or ${to}`);
  }

  const usdAmount = amount / fromRate;
  const convertedAmount = usdAmount * toRate;
  return Number(convertedAmount) || 0;
}

/**
 * -------------------------------------------------------------------------
 * Profit Margin Method 
 * -------------------------------------------------------------------------
 * @param customerId 
 * @param brandName 
 * @returns 
 */
private async getProfitMargin(customerId: string, brandName: string) {
  if (!customerId || !brandName) return null;
  const findingMargin = await this.prisma.providerProfiteAdd.findFirst({
    where: { isActive: true, customerId , brand:{
      Brand: brandName?.toLocaleUpperCase()
    } }
  });

  return findingMargin || { profiteMargin: 0 };
}

/**
 * -------------------------------------------------------------------------
 * Margin Calculation Method 
 * -------------------------------------------------------------------------
 * @param price 
 * @param percentage 
 * @returns 
 */

private applyMargin(price: number = 0, percentage: number = 0): number {
  const margin = percentage / 100;
  if (margin >= 1) throw new BadRequestException('Invalid profit margin');
  return price / (1 - margin);
}


/**
 * -------------------------------------------------------------------------
 * Check ETA Method 
 * -------------------------------------------------------------------------
 * @param allProduct 
 * @param brand 
 * @returns 
 */

private async checkETA( allProduct: any, brand: string) {

  if(brand === 'SIEMENS'){
     return Promise.all(
            allProduct.map(async (item: any) => {

            const siemensETA = await this.siyemens.searchSiemens(item?.PartNumber);
            let LeadTimeUnits : number | string | null ;
            let LeadTimeType : string | null;

              if(siemensETA.length > 0 && parseInt(siemensETA[0]?.stockQuantityUIvalue) > 0 ){
                    LeadTimeUnits = "2-4";
                    LeadTimeType = "WEEKS";      
              } else if(siemensETA.length > 0 && siemensETA[0]?.stockQuantityUIvalue <= 0){
                    LeadTimeUnits = siemensETA[0]?.uiMessage;
                    LeadTimeType = "string"
              } else {
                 LeadTimeUnits = "2-4";
                 LeadTimeType = "WEEKS";  
              }
            
              return {
                ProviderFrom: "Local_DB",
                IdFromDB: item.id,
                PartNumber: item.PartNumber,
                Product: item.PartNumber,
                Brand: item.Brand,
                Price: item.Price,
                LeadTimeUnits: LeadTimeUnits , 
                LeadTimeType: LeadTimeType
              };

            })
          );
    }else {

                return allProduct.map((item: any) => {
                if(!item) return null;
                return {
                  ProviderFrom: "Local_DB",
                  IdFromDB: item?.id,
                  PartNumber: item?.PartNumber,
                  Product: item?.PartNumber,
                  Brand: item?.Brand,
                  Price: item?.Price,
                  LeadTimeType: item?.LeadTimeUnits,
                  LeadTimeUnits: item?.LeadTimeTypes
                }
              })
    }
}

/**
 * -------------------------------------------------------------------------
 * Lead Time Conversion Method 
 * -------------------------------------------------------------------------
 * @param LeadTimeType 
 * @param leadTimeUnites 
 * @returns 
 */

convertLeadTime(LeadTimeType: string , leadTimeUnites : number ): string | number {
      let LeadTimeValue : number;

      if (LeadTimeType === "WEEKS") {
         LeadTimeValue = leadTimeUnites  + 1; 
      } else if (LeadTimeType === "DAYS") { 
           LeadTimeValue = leadTimeUnites  + 5;
      }
      return LeadTimeValue;
}

/**
 * -------------------------------------------------------------------------
 * Get DB Price , ETA , Delivery Method 
 * -------------------------------------------------------------------------
 * @param partNumber 
 * @param dbId 
 * @param ownerid 
 * @returns 
 */

async getDBETApriceDelivery (partNumber: string, dbId : string, ownerid: string){

    const priceDeliveryDate = await this.prisma.product.findFirst({
      where: {
        id: dbId
      }
    });

    const getProfitMargin = await this.getProfitMargin(ownerid, priceDeliveryDate?.Brand);  
 

    return {
     unitePrice: this.applyMargin(priceDeliveryDate?.Price, getProfitMargin?.profiteMargin),
     LeadTimeUnits: priceDeliveryDate?.LeadTimeUnits,
     LeadTimeType: priceDeliveryDate?.LeadTimeTypes,
     currency : priceDeliveryDate?.Currency
    }
}

/** ----------------------------------------------------------------- 
 * @link : Download Price List CSV File
 * @access : Should Be Authenticated User
 * @method : GET
 * @param : user : any , query : Record<string, any>
 * @returns : CSV File Path and Name
 * -----------------------------------------------------------------
 */

// async downloadPriceList(user: any, query: Record<string, any>): Promise<{ fileName: string,  filePath: string  }> {
//     try {

//       const userHave = await this.prisma.user.findFirst({
//         where: { id: user?.id },
//         include: { customer: true },
//       });

//       if (!userHave) throw new NotFoundException(`Customer with ID ${user?.id} not found`);
//       if (!query.brandName) throw new NotFoundException(`brandName not found`);

//       const findBrandName = await this.prisma.ourBrand.findUnique({
//         where:{
//           Brand: query.brandName
//         }
//       });

//       if (!findBrandName) throw new NotFoundException(`brandName not found`);

//       const isProfitMarginGet = await this.getProfitMargin(userHave?.customer?.id, findBrandName?.Brand);
  
//       const getProductList = await this.prisma.product.findMany({
//         where: { Brand: query?.brandName },
//          select: {
//             id: true,
//             PartNumber: true,
//             Brand: true,
//             Price: true,
//             Currency: true
//           },
//       });

//       if (getProductList.length === 0)  throw new NotFoundException('Product not found');

//       let processedProducts: any[] = [];
//       getProductList.forEach(item => {
//         const priceWithMargin = this.applyMargin(item?.Price, isProfitMarginGet?.profiteMargin);

//         processedProducts.push({
//             PartNumber: item.PartNumber,
//             Price: priceWithMargin.toFixed(2),
//             Brand: item.Brand ?? '',
//             Currency: item.Currency
//         });
//       });

//       processedProducts.sort((a, b) => a.Price - b.Price);

//       const fields = ['PartNumber', `Price`, 'Brand', 'Currency'];
//       const parser = new Parser({ fields });
//       const csvData = parser.parse(processedProducts);

//       const tmpDir = path.join(process.cwd(), 'tmp');
//       if (!fs.existsSync(tmpDir)) fs.mkdirSync(tmpDir);

//       const safeBrand = findBrandName?.Brand?.replace(/[\/\\?%*:|"<>]/g, '-');
//       const safeDate = (findBrandName?.validDate || '').replace(/[\/\\?%*:|"<>]/g, '-');
//       const fileName = `${safeBrand}-Valid-Until-${safeDate}.csv`;
//       const filePath = path.join(tmpDir, fileName);

//       fs.writeFileSync(filePath, csvData);

//       return {
//         filePath: filePath,
//         fileName: fileName
//       }; 
//     } catch (error) {
//       console.log('Error generating CSV file:', error);
//       throw new NotFoundException('Product not found');
//     }
// }

async downloadPriceList(user: any, query: any) {
  try {
    const cpuCount = os.cpus().length;
    const workerPath = path.join(__dirname, "./workers/download.price.worker.js");

    if (!query.brandName) {
      throw new NotFoundException("brandName is required");
    }

    const findCustomer = await this.prisma.customer.findUnique({
      where:{
        userId: user.id
      },
      select:{
        id: true
      }
    });

    const findBrandName = await this.prisma.ourBrand.findUnique({
      where: { Brand: query.brandName }
    });

    // Get profit margin
    const profitMargin =
      (
        await this.getProfitMargin(findCustomer.id, query.brandName)
      )?.profiteMargin ?? 0;

    // Count total
    const totalCount = await this.prisma.product.count({
      where: { Brand: query.brandName }
    });

    if (totalCount === 0) {
      throw new NotFoundException("No products found");
    }

    // Batching
    const batchSize = 100000;
    const totalBatches = Math.ceil(totalCount / batchSize);
    let allPromises = [];

    for (let b = 0; b < totalBatches; b++) {
      allPromises.push(
        this.prisma.product.findMany({
          where: { Brand: query.brandName },
          skip: b * batchSize,
          take: batchSize,
          select: {
            id: true,
            PartNumber: true,
            Brand: true,
            Price: true,
            Currency: true
          }
        })
      );
    }

    const batchProducts = await Promise.all(allPromises);
    const flatProducts = batchProducts.flat();

    // Split for workers
    const chunkSize = Math.ceil(flatProducts.length / cpuCount);
    const workerPromises = [];

    for (let i = 0; i < cpuCount; i++) {
      const slice = flatProducts.slice(i * chunkSize, (i + 1) * chunkSize);
      if (slice.length === 0) continue;

      const p = new Promise((resolve, reject) => {
        const worker = new Worker(workerPath, {
          workerData: { productList: slice, profitMargin }
        });

        worker.on("message", resolve);
        worker.on("error", reject);
        worker.on("exit", (code) => {
          if (code !== 0) reject(new Error("Worker exited with error"));
        });
      });

      workerPromises.push(p);
    }

    // Wait for all workers
    const results = await Promise.all(workerPromises);

    // Flatten
    const finalProducts = results.flat();

    // Sort
    finalProducts.sort((a, b) => a.Price - b.Price);

    // CSV
    const fields = ["PartNumber", "Price", "Brand", "Currency"];
    const parser = new Parser({ fields });
    const csvData = parser.parse(finalProducts);

    const tmpDir = path.join(process.cwd(), "tmp");
    if (!fs.existsSync(tmpDir)) fs.mkdirSync(tmpDir);

    const safeBrand = findBrandName?.Brand?.replace(/[\/\\?%*:|"<>]/g, "-");
    const safeDate = (findBrandName?.validDate || "").replace(
      /[\/\\?%*:|"<>]/g,
      "-"
    );

    const fileName = `${safeBrand}-Valid-Until-${safeDate}.csv`;
    const filePath = path.join(tmpDir, fileName);

    fs.writeFileSync(filePath, csvData);

    return { filePath, fileName };
  } catch (error) {
    throw new NotFoundException("Unexpected error");
  }
}


/**
 * -------------------------------------------------------------------------
 * Partial Product Search Method 
 * -------------------------------------------------------------------------
 * @param partNumber 
 * @returns 
 */

private async searchPartialProduct(partNumber: string) {
  
  // const results: any[] = [];

  // // DB matches
  // const dbMatches = await this.prisma.product.findMany({
  //     where: { PartNumber: { contains: partNumber } , isActive: true },
  //     select:{
  //       ProductName: true,
  //       PartNumber: true,
  //       Brand: true
  //     }
  // });


  // results.push(
  //     ...dbMatches.map((d) => ({
  //       ProductName: d.ProductName,
  //       PartNumber: d.PartNumber,
  //       Brand: d.Brand
  //     }))
  // );

  // // Remove duplicates by partNumber + brandName
  // const uniqueResults = Array.from(
  //   new Map(results.map((r) => [`${r.Brand}-${r.PartNumber}`, r])).values()
  // );

  // return uniqueResults;
  
    const dbMatches = await this.prisma.product.findMany({
      where: {
        PartNumber: { contains: partNumber },
        isActive: true
      },
      select: {
        ProductName: true,
        PartNumber: true,
        Brand: true
      },
      take: 100
    });

   // Remove duplicates by brand + partNumber
    const uniqueMap = new Map<string, PartialSearchResult>();
    
    for (const match of dbMatches) {
      const key = `${match.Brand}-${match.PartNumber}`;
      if (!uniqueMap.has(key)) {
        uniqueMap.set(key, match);
      }
    }

    return Array.from(uniqueMap.values());
  }

/**
 * -------------------------------------------------------------------------
 * Product Brand Name Search Method 
 *  ------------------------------------------------------------------------
 * @param query 
 * @returns 
 */
async SearchingProductBrandName(query: Record<string, any>) {
  return this.prisma.ourBrand.findMany({
   ...( query && {
     where: {
      Brand: {
        contains: query.Brand,
      },
    }
   })
  })}

}


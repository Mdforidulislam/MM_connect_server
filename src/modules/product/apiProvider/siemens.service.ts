import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';

@Injectable()
export class SiemensService {
  constructor(
    private readonly http: HttpService,
    private readonly config: ConfigService
  ) {}

  async searchSiemens(partNumber: string) {
    const url = this.config.get('SIEMENS_API_URL');
    const headers = {
      'Content-Type': 'application/json',
    };
    try {
      if(!partNumber) return [];
      const res = await firstValueFrom(this.http.get(`${url}/${partNumber}`, { headers }));
      return  res?.data?.results || [];

    } catch (err) {
      return  [];
    }
  }
}






// response {
// 	seletedProduct:{
// 			brandName: string;
// 			partNumber: partNumber;
// 			quantity : number;
// 			hsCode: string;
// 			coo: string;
// 			totalPrice: {
// 				 { 
// 					offers:  key + brandName + partNumber ,
// 					moq: string;
// 					eta: string;
// 					price: string;
// 				},
// 				{ 
// 					offers:  key + brandName + partNumber ,
// 					moq: string;
// 					eta: string;
// 					price: string;
// 				}
// 			]
//      particallyMatch: [
// 		{
// 		productName: string;
// 		partNumber: string;
// 		brandName: string;
// 		},
// 		{
// 		productName: string;
// 		partNumber: string;
// 		brandName: string;
// 		}
// 	 ]
// }
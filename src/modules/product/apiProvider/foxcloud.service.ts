import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';

@Injectable()
export class FoxcloudService {
  constructor(
    private readonly http: HttpService,
    private readonly config: ConfigService
  ) {}

  async searchFoxcloud(partNumber: string, quantity = 1, brand = '') {
    const url = this.config.get('FOX_API_URL');

    const headers = {
      APIKey: this.config.get('FOX_API_KEY'),
      SecretToken: this.config.get('FOX_SECRET_TOKEN'),
      'Content-Type': 'application/json',
    };

    const body = {
      SearchTerm: partNumber,
      Quantity: quantity,
      Language: 'en',
      Brand: brand,
    };

    try {
      const res = await firstValueFrom(
        this.http.request({
          url,
          method: 'get',               
          headers,
          data: {
            Items:[
              {...body}
            ]
          },
        }),
      );

     return Array.isArray(res?.data.Results[0].Items) ? res?.data.Results[0].Items : [];
     // ===============================================
     // This data comes formt the FoxCloud API
     // ===============================================

    } catch (err) {
      console.error('FoxCloud API error:', err || err);
      return [];
    }
  }
}

import { HttpService } from '@nestjs/axios';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { firstValueFrom } from 'rxjs';

@Injectable()
export class PaypalService {
  private readonly endpointUrl: string;

  constructor(
    private readonly httpService: HttpService,
    private readonly configService: ConfigService,
  ) {
    const environment =
      this.configService.get<string>('ENVIRONMENT') || 'sandbox';
    this.endpointUrl =
      environment === 'sandbox'
        ? 'https://api-m.sandbox.paypal.com'
        : 'https://api-m.paypal.com';
  }

  private async getAccessToken(): Promise<string> {
    const clientId = this.configService.get<string>('CLIENT_ID');
    const clientSecret = this.configService.get<string>('CLIENT_SECRET');
    const auth = Buffer.from(`${clientId}:${clientSecret}`).toString('base64');
    const headers = {
      'Content-Type': 'application/x-www-form-urlencoded',
      Authorization: `Basic ${auth}`,
    };

    const body = 'grant_type=client_credentials';

    const { data } = await firstValueFrom(
      this.httpService.post(`${this.endpointUrl}/v1/oauth2/token`, body, {
        headers,
      }),
    );

    return data.access_token;
  }

  async createOrder(intent: string) {
    const accessToken = await this.getAccessToken();

    const headers = {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${accessToken}`,
    };

    const body = {
      intent: intent.toUpperCase(),
      purchase_units: [
        {
          amount: {
            currency_code: 'USD',
            value: '100.00',
          },
        },
      ],
    };

    const { data } = await firstValueFrom(
      this.httpService.post(`${this.endpointUrl}/v2/checkout/orders`, body, {
        headers,
      }),
    );

    return data;
  }

  async completeOrder(orderId: string, intent: string) {
    const accessToken = await this.getAccessToken();

    const headers = {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${accessToken}`,
    };

    const { data } = await firstValueFrom(
      this.httpService.post(
        `${this.endpointUrl}/v2/checkout/orders/${orderId}/${intent}`,
        {},
        { headers },
      ),
    );

    return data;
  }
}


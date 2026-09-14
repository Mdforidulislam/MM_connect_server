// src/modules/stripe/stripe.service.ts
import { Injectable, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Stripe from 'stripe';

@Injectable()
export class StripeService implements OnModuleInit {
  private stripe: Stripe;

  constructor(private readonly configService: ConfigService) {}

  onModuleInit() {
    const stripeSecretKey = this.configService.get<string>('STRIPE_SECRET_KEY');
    if (!stripeSecretKey) {
      throw new Error('STRIPE_SECRET_KEY not found in env');
    }

    this.stripe = new Stripe(stripeSecretKey, {
    //   apiVersion: '2024-04-10',
    });
  }

  get stripeClient(): Stripe {
    if (!this.stripe) throw new Error('Stripe client not initialized');
    return this.stripe;
  }
}

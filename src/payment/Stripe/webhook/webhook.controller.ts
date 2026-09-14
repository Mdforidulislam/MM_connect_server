import {
  Controller,
  Post,
  Req,
  Res,
  Headers,
  HttpStatus,
  UseGuards,
} from '@nestjs/common';
import { Request, Response } from 'express';
import Stripe from 'stripe';
import { WebhookService } from './webhook.service';
import { ConfigService } from '@nestjs/config';
import { SkipThrottle } from '@nestjs/throttler';
import { SkipRateLimit } from '@/utils/skip.ratelimite';
import { Public } from '@/modules/auth/auth.decorator';

@Public()
@Controller('webhook')
export class WebhookController {
  private stripe: Stripe;

  constructor(
    private readonly webhookService: WebhookService,
    private readonly configService: ConfigService,
  ) {
    this.stripe = new Stripe(configService.get('STRIPE_SECRET_KEY'), {
    //   apiVersion: '2024-04-10',
    });
  }
}

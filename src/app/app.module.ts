import { PrismaService } from '@/helper/prisma.service';
import { AuthGuard } from '@/modules/auth/auth.guard';
import { AuthModule } from '@/modules/auth/auth.module';
import { UserModule } from '@/modules/user/user.module';
import { BcryptService } from '@/utils/bcrypt.service';
import { GlobalExceptionFilter } from '@/utils/global_exception';
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { APP_FILTER, APP_GUARD } from '@nestjs/core';
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';
import config from '../config';
import { AppController } from './app.controller';
import { AdminModule } from '@/modules/admin/admin.module';
import { CustomerModule } from '@/modules/customer/customer.module';
import { FileService } from '@/helper/file.service';
import { PrismaHelperService } from '@/utils/is_existance';
import { OrderModule } from '@/modules/order/order.module';
import { RequestQuotationModule } from '@/modules/request-quotation/request-quotation.module';
import { SupplierModule } from '@/modules/supplier/supplier.module';
import { ProductModule } from '@/modules/product/product.module';
import { RolesGuard } from '@/modules/roles/roles.guard';
import { BullModule } from '@nestjs/bull';
import { WebsocketModule } from '@/ws/socket.module';
import { ProviderController } from '@/modules/provider/provider.controller';
import { ProviderModule } from '@/modules/provider/provider.module';
import { ProfitMarginModule } from '@/modules/profit-margin/profit-margin.module';
import { BrandModule } from '@/modules/brand/brand.module';
import { TeamMembersModule } from '@/modules/team-members/team-members.module';
import { ShippingAddressModule } from '@/modules/shipping_address/shipping_address.module';
import { AnalyticsModule } from '@/modules/analytics/analytics.module';
import { BillingInfomationModule } from '@/modules/billing_infomation/billing_infomation.module';
import { CompnayInformationModule } from '@/modules/compnay_information/compnay_information.module';
import { CurrencyControllModule } from '@/modules/currency_controll/currency_controll.module';



@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [config],
    }),
    ThrottlerModule.forRoot({
      throttlers: [
        {
          name: 'short',
          ttl: 1000,
          limit: 100,
        },
        {
          name: 'medium',
          ttl: 10000,
          limit: 1000,
        },
        {
          name: 'long',
          ttl: 600000,
          limit: 1000,
        },
      ],
    }),
    BullModule.forRoot({
      redis: {
        host: process.env.REDIS_HOST,
        port: parseInt(process.env.REDIS_PORT),
      }
    }),
    AuthModule,
    UserModule,
    AdminModule,
    CustomerModule,
    OrderModule,
    RequestQuotationModule,
    SupplierModule,
    ProductModule,
    ProviderModule,
    ProfitMarginModule,
    BrandModule,
    TeamMembersModule,
    ShippingAddressModule,
    AnalyticsModule,
    BillingInfomationModule,
    CompnayInformationModule,
    CurrencyControllModule,
    // AnalyticsModule,
    // WebhookModule

    WebsocketModule
  ],
  controllers: [AppController],
  providers: [
    PrismaService,
    BcryptService,
    FileService,
    PrismaHelperService,
    { provide: APP_FILTER, useClass: GlobalExceptionFilter },
    { provide: APP_GUARD, useClass: ThrottlerGuard },
    { provide: APP_GUARD, useClass: AuthGuard },
    { provide: APP_GUARD, useClass: RolesGuard },
  ]
})


export class AppModule {}

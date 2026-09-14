import { BrevoService } from '@/email/brevo';
import { PrismaService } from '@/helper/prisma.service';
import { UserModule } from '@/modules/user/user.module';
import { HttpModule } from '@nestjs/axios';
import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { BcryptService } from 'src/utils/bcrypt.service';
import { UserService } from '@/modules/user/user.service';
import { jwtConstants } from './auth.constants';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';

@Module({
  imports: [
    HttpModule.register({
      timeout: 5000,

      maxRedirects: 5,
    }),
    UserModule,
    JwtModule.register({
      global: true,
      secret: jwtConstants.secret,
      signOptions: { expiresIn: '7d' },
    }),
  ],
  providers: [
    AuthService,
    BcryptService,
    PrismaService,
    UserService,
    ConfigService,
    BrevoService
  ],
  controllers: [AuthController],
  exports: [AuthService],
})
export class AuthModule {}

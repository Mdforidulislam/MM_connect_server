import { BrevoService } from '@/email/brevo';
import { sendEmailWithSendGrid } from '@/email/sendGrid';
import { PrismaService } from '@/helper/prisma.service';
import { BrevoEmailParams } from '@/interface/brevo';
import { UserService } from '@/modules/user/user.service';
import { BadRequestException, HttpStatus, Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import {  IsApproved, Role } from '@prisma/client';
import e from 'express';
import { ApiError } from 'src/utils/api_error';
import { BcryptService } from 'src/utils/bcrypt.service';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UserService,
    private jwtService: JwtService,
    private bcryptService: BcryptService,
    private configService: ConfigService,
    private brevoService: BrevoService,
    private prisma: PrismaService,
  ) { }

async login(data: {
  email: string;
  password: string;
}): Promise<{ accessToken: string; refreshToken: string; user: any }> {
  const { email, password } = data;

  // 1. Fetch User
  const user = await this.prisma.user.findUnique({
    where: { email },
    include: {
      admin: true,
      customer: true,
    },
  });

  // 2. CHECK USER EXISTENCE FIRST!
  if (!user) {
    throw new NotFoundException('User not found');
  }

  // 3. Password Verification (Check if password exists on user)
  if (!user.password) {
    throw new UnauthorizedException('Invalid credentials');
  }

  const isPasswordMatched = await this.bcryptService.compare(
    password,
    user.password,
  );

  if (!isPasswordMatched) {
    throw new UnauthorizedException('Password is incorrect');
  }

  // 4. Check Customer Approval Status
if (
  user.role === Role.CUSTOMER &&
  user.customer &&
  ([IsApproved.PENDING, IsApproved.DE_ACTIVATED, IsApproved.REJECTED] as IsApproved[]).includes(
    user.customer.isApproved,
  )
) {
  throw new BadRequestException('Customer is not approved');
}

  // 5. Payload & Token Generation
  const payload = {
    id: user.id,
    email: user.email,
    role: user.role,
    name: user.username,
    avatar: user.avatar,
  };

  const [accessToken, refreshToken] = await Promise.all([
    this.jwtService.signAsync(payload),
    this.jwtService.signAsync(payload),
  ]);

  return {
    user: payload,
    accessToken,
    refreshToken,
  };
}

  async getMe(user: any) {

    const isUserExists = await this.prisma.user.findUnique({
      where: { 
        email: user?.email
       } as any,
      include: { admin: true , customer: true }
    });

    if (!isUserExists) {
      throw new ApiError(HttpStatus.NOT_FOUND, `user not found`);
    }     

    return isUserExists;
  }

  async changePassword({
    id,
    prevPass,
    newPass,
  }: {
    id: string;
    prevPass: string;
    newPass: string;
  }) {

    const isUserExists = await this.prisma.user.findUnique({ where: { id } });

    if (!isUserExists) {
      throw new ApiError(HttpStatus.NOT_FOUND, `user not found`);
    }

    const isPasswordMatched = await this.bcryptService.compare(
      prevPass,
      isUserExists.password!,
    );

    if (!isPasswordMatched) {
      throw new ApiError(HttpStatus.UNAUTHORIZED, 'Password is not matched!');
    }

    const hashPassword = await this.bcryptService.hash(newPass);

    const changePassword = await this.prisma.user.update({
      where: { id: isUserExists?.id },
      data: {
        password: hashPassword,
      },
    });

    if (!changePassword) {
      throw new ApiError(HttpStatus.NOT_FOUND, `password not updated`);
    }

    return 'password updated';
  }

  async forgetPassword({ email }: { email: string }) {
    const user = await this.usersService.getOne({ email });

    if (!user) {
      throw new ApiError(HttpStatus.NOT_FOUND, `User Not Found`);
    }

    const payload = {
      email: user.email,
      role: user.role,
    };

    const resetPassToken = this.jwtService.signAsync(payload);

    const resetPasswordLink =
      this.configService.get(`RESET_PASSWORD_LINK`) +
      `?userId=${user.id}&token=${resetPassToken}`;

    const params: BrevoEmailParams = {
      sender: { email: 'info@fourteencapital.com', name: 'Fourteen Capital' },
      to: [{ email: user?.email, name: user?.username }],
      subject: 'FourteenCapital - Reset Your Password',
      htmlContent: `<!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Password Reset Request</title>
    </head>
    <body style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f4f7fa; margin: 0; padding: 20px; line-height: 1.6; color: #333333;">
        <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);">
            <div style="background-color: #FF7600; padding: 30px 20px; text-align: center;">
                <h1 style="color: #ffffff; margin: 0; font-size: 24px; font-weight: 600;">Password Reset Request</h1>
            </div>
            <div style="padding: 40px 30px;">
                <p style="font-size: 16px; margin-bottom: 20px;">Dear User,</p>
                
                <p style="font-size: 16px; margin-bottom: 30px;">We received a request to reset your password. Click the button below to reset your password:</p>
                
                <div style="text-align: center; margin-bottom: 30px;">
                    <a href=${resetPasswordLink} style="display: inline-block; background-color: #FF7600; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; font-size: 16px; font-weight: 600; transition: background-color 0.3s ease;">
                        Reset Password
                    </a>
                </div>
                
                <p style="font-size: 16px; margin-bottom: 20px;">If you did not request a password reset, please ignore this email or contact support if you have any concerns.</p>
                
                <p style="font-size: 16px; margin-bottom: 0;">Best regards,<br>Your Support Team</p>
            </div>
            <div style="background-color: #f8f9fa; padding: 20px; text-align: center; font-size: 14px; color: #6c757d;">
                <p style="margin: 0 0 10px;">This is an automated message, please do not reply to this email.</p>
                <p style="margin: 0;">© 2023 Your Company Name. All rights reserved.</p>
            </div>
        </div>
    </body>
    </html>`,
    };

    await sendEmailWithSendGrid({
        to: user?.email,
        subject: 'FourteenCapital - Reset Your Password',
        text: "",
        htmlContent: params.htmlContent
    })

    return {
      message: 'Reset password link sent via your email successfully',
    };
  }

  async resetPassword({
    token,
    payload: { id, password },
  }: {
    token: string;
    payload: { id: string; password: string };
  }) {
    const user = this.usersService.getOne({ email: id });

    if (!user) {
      throw new ApiError(HttpStatus.NOT_FOUND, `User Not Found`);
    }

    const isValidToken = await this.jwtService.verifyAsync(token);

    if (!isValidToken) {
      throw new ApiError(HttpStatus.FORBIDDEN, `Forbidden`);
    }

    const hashPassword = await this.bcryptService.hash(password);

    await this.usersService.updatePassword({
      id: (await user)?.id,
      password: hashPassword,
    });
  }
}

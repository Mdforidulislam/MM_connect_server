import {
  Body,
  Controller,
  Get,
  Headers,
  HttpCode,
  HttpStatus,
  Post,
  Req,
  Res,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { Public } from './auth.decorator';
import { Request } from 'express';
import { ResponseService } from '@/utils/response';
import { ApiOperation, ApiTags } from '@nestjs/swagger';


@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) { }

  @HttpCode(HttpStatus.OK)
  @Public()
  @Post('login')
  @ApiOperation({ summary: 'User Login' })
  async signIn(
    @Body() loginDto: LoginDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    const result = await this.authService.login(loginDto);
    return ResponseService.formatResponse({
      statusCode: HttpStatus.OK,
      message: 'User Login successfully',
      data: result,
    });
  }

  @Get('get-me')
  async getProfile(@Req() req: Request) {
    const user: any = req?.user;
    const result = await this.authService.getMe(user);
    return ResponseService.formatResponse({
      statusCode: HttpStatus.OK,
      message: 'Getme Found successfully',
      data: result,
    });
  }

  @Post('change-password')
  async changePassword(
    @Body() data: { prevPass: string; newPass: string },
    @Req() req: Request,
  ) {
    const user: any = req?.user;
    const id: string = user?.id;
    const result = await this.authService.changePassword({ ...data, id });

    return ResponseService.formatResponse({
      statusCode: HttpStatus.OK,
      message: 'Password Changed successfully',
      data: result,
    });
  }

  @Post('forgot-password')
  async forgotPasswod(@Body() data: { email: string }) {
    const result = await this.authService.forgetPassword({
      email: data?.email,
  });

    return ResponseService.formatResponse({
      statusCode: HttpStatus.OK,
      message: 'Forget Password Mail Sent successfully',
      data: result,
    });
  }

  @Post('reset-password')
  async resetPassword(
    @Headers('authorization') token: string,
    @Body() payload: { prevPass: string; newPass: string },
    @Req() req: Request
  ) {
    const user: any = req?.user;

    const result = await this.authService.resetPassword({
      token,
      payload: {
        id: user?.id,
        password: payload.newPass,
      },
    });

    return ResponseService.formatResponse({
      statusCode: HttpStatus.OK,
      message: 'Password Resetted successfully',
      data: result,
    });
  }
}

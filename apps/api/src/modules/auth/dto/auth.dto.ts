import { ApiProperty } from '@nestjs/swagger';
import {
  IsEmail,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsPhoneNumber,
  IsString,
  Length,
  Matches,
  MinLength,
} from 'class-validator';
import { Locale } from '@prisma/client';

export class RequestOtpDto {
  @ApiProperty({ example: '+966555000111' })
  @IsPhoneNumber()
  phoneE164!: string;
}

export class VerifyOtpDto {
  @ApiProperty()
  @IsPhoneNumber()
  phoneE164!: string;

  @ApiProperty({ example: '123456' })
  @IsString()
  @Length(4, 8)
  code!: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  deviceId?: string;

  @ApiProperty({ required: false, enum: ['IOS', 'ANDROID', 'WEB'] })
  @IsOptional()
  @IsEnum(['IOS', 'ANDROID', 'WEB'])
  deviceKind?: 'IOS' | 'ANDROID' | 'WEB';
}

export class CompleteRegistrationDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  firstName!: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  lastName?: string;

  @ApiProperty({ enum: Locale, required: false })
  @IsOptional()
  @IsEnum(Locale)
  preferredLocale?: Locale;

  @ApiProperty({ required: false })
  @IsOptional()
  @Matches(/^[A-Z0-9]{4,12}$/i)
  referralCode?: string;
}

export class SocialAuthDto {
  @ApiProperty({ enum: ['APPLE', 'GOOGLE'] })
  @IsEnum(['APPLE', 'GOOGLE'])
  provider!: 'APPLE' | 'GOOGLE';

  @ApiProperty()
  @IsString()
  identityToken!: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  authorizationCode?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  fullName?: string;
}

export class RefreshDto {
  @ApiProperty()
  @IsString()
  refreshToken!: string;
}

export class LogoutDto {
  @ApiProperty()
  @IsString()
  refreshToken!: string;
}

export class EmailPasswordLoginDto {
  @ApiProperty({ example: 'admin@drivethru.local' })
  @IsEmail()
  email!: string;

  @ApiProperty({ example: 'ChangeMe!2026' })
  @IsString()
  @MinLength(8)
  password!: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  deviceId?: string;
}

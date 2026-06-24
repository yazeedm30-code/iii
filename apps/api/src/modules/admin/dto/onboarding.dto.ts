import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsOptional, IsString, MinLength } from 'class-validator';

export class OnboardMerchantDto {
  @ApiProperty() @IsString() name!: string;
  @ApiProperty() @IsString() nameAr!: string;
  @ApiProperty() @IsString() slug!: string;
  @ApiProperty({ required: false }) @IsOptional() @IsString() logoUrl?: string;
  @ApiProperty({ required: false }) @IsOptional() @IsString() vatNumber?: string;
  @ApiProperty({ required: false }) @IsOptional() @IsString() crNumber?: string;
  @ApiProperty({ required: false }) @IsOptional() @IsString() primaryColor?: string;

  @ApiProperty({ description: 'Email of the merchant owner that will manage the dashboard' })
  @IsEmail()
  ownerEmail!: string;

  @ApiProperty({ description: 'Initial password for the owner', minLength: 8 })
  @IsString()
  @MinLength(8)
  ownerPassword!: string;

  @ApiProperty() @IsString() ownerName!: string;

  @ApiProperty({ required: false }) @IsOptional() @IsString() ownerPosition?: string;
}

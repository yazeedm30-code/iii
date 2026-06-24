import { ApiProperty } from '@nestjs/swagger';
import {
  IsBoolean,
  IsEnum,
  IsInt,
  IsLatitude,
  IsLongitude,
  IsNumber,
  IsOptional,
  IsString,
  IsUUID,
  Min,
} from 'class-validator';
import { Type } from 'class-transformer';
import { CouponType } from '@prisma/client';

export class CreateMerchantDto {
  @ApiProperty() @IsString() name!: string;
  @ApiProperty() @IsString() nameAr!: string;
  @ApiProperty() @IsString() slug!: string;
  @ApiProperty({ required: false }) @IsOptional() @IsString() logoUrl?: string;
  @ApiProperty({ required: false }) @IsOptional() @IsString() vatNumber?: string;
  @ApiProperty({ required: false }) @IsOptional() @IsString() crNumber?: string;
}

export class CreateBranchDto {
  @ApiProperty() @IsUUID() merchantId!: string;
  @ApiProperty() @IsUUID() cityId!: string;
  @ApiProperty() @IsString() name!: string;
  @ApiProperty() @IsString() nameAr!: string;
  @ApiProperty() @IsString() code!: string;
  @ApiProperty() @Type(() => Number) @IsLatitude() latitude!: number;
  @ApiProperty() @Type(() => Number) @IsLongitude() longitude!: number;
  @ApiProperty({ required: false }) @IsOptional() @IsString() address?: string;
  @ApiProperty({ required: false }) @IsOptional() @IsInt() @Min(50) arrivalRadiusM?: number;
  @ApiProperty({ required: false }) @IsOptional() @IsInt() @Min(1) averagePrepMin?: number;
  @ApiProperty({ required: false }) @IsOptional() @IsBoolean() supportsDriveThru?: boolean;
  @ApiProperty({ required: false }) @IsOptional() @IsBoolean() supportsPickup?: boolean;
}

export class CreateCategoryDto {
  @ApiProperty() @IsUUID() merchantId!: string;
  @ApiProperty() @IsString() name!: string;
  @ApiProperty() @IsString() nameAr!: string;
  @ApiProperty() @IsString() slug!: string;
  @ApiProperty({ required: false }) @IsOptional() @IsString() imageUrl?: string;
  @ApiProperty({ required: false }) @IsOptional() @IsInt() sortOrder?: number;
}

export class CreateProductDto {
  @ApiProperty() @IsUUID() merchantId!: string;
  @ApiProperty() @IsUUID() categoryId!: string;
  @ApiProperty() @IsString() sku!: string;
  @ApiProperty() @IsString() name!: string;
  @ApiProperty() @IsString() nameAr!: string;
  @ApiProperty({ required: false }) @IsOptional() @IsString() description?: string;
  @ApiProperty({ required: false }) @IsOptional() @IsString() descriptionAr?: string;
  @ApiProperty({ required: false }) @IsOptional() @IsString() imageUrl?: string;
  @ApiProperty() @Type(() => Number) @IsNumber() basePrice!: number;
  @ApiProperty({ required: false }) @IsOptional() @Type(() => Number) @IsNumber() taxRate?: number;
  @ApiProperty({ required: false }) @IsOptional() @IsInt() calories?: number;
  @ApiProperty({ required: false }) @IsOptional() @IsInt() prepSeconds?: number;
}

export class CreateCouponDto {
  @ApiProperty() @IsUUID() merchantId!: string;
  @ApiProperty() @IsString() code!: string;
  @ApiProperty({ enum: CouponType }) @IsEnum(CouponType) type!: CouponType;
  @ApiProperty() @Type(() => Number) @IsNumber() value!: number;
  @ApiProperty({ required: false }) @IsOptional() @Type(() => Number) @IsNumber() minSubtotal?: number;
  @ApiProperty({ required: false }) @IsOptional() @Type(() => Number) @IsNumber() maxDiscount?: number;
  @ApiProperty({ required: false }) @IsOptional() @IsInt() usageLimit?: number;
  @ApiProperty({ required: false }) @IsOptional() @IsInt() perCustomerLimit?: number;
}

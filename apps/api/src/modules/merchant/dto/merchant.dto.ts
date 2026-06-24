import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsBoolean,
  IsInt,
  IsLatitude,
  IsLongitude,
  IsNumber,
  IsOptional,
  IsString,
  IsUUID,
  Min,
} from 'class-validator';

export class MerchantCreateBranchDto {
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

export class MerchantCreateCategoryDto {
  @ApiProperty() @IsString() name!: string;
  @ApiProperty() @IsString() nameAr!: string;
  @ApiProperty() @IsString() slug!: string;
  @ApiProperty({ required: false }) @IsOptional() @IsString() imageUrl?: string;
  @ApiProperty({ required: false }) @IsOptional() @IsInt() sortOrder?: number;
}

export class MerchantCreateProductDto {
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

export class MerchantUpdateProductDto {
  @ApiProperty({ required: false }) @IsOptional() @IsString() name?: string;
  @ApiProperty({ required: false }) @IsOptional() @IsString() nameAr?: string;
  @ApiProperty({ required: false }) @IsOptional() @IsString() description?: string;
  @ApiProperty({ required: false }) @IsOptional() @IsString() descriptionAr?: string;
  @ApiProperty({ required: false }) @IsOptional() @IsString() imageUrl?: string;
  @ApiProperty({ required: false }) @IsOptional() @Type(() => Number) @IsNumber() basePrice?: number;
  @ApiProperty({ required: false }) @IsOptional() @IsBoolean() isActive?: boolean;
}

import { Injectable, NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';

import { PrismaService } from '../../common/prisma/prisma.service';

@Injectable()
export class CatalogService {
  constructor(private readonly prisma: PrismaService) {}

  async getMenu(branchId: string, search?: string) {
    const branch = await this.prisma.branch.findFirst({
      where: { id: branchId, deletedAt: null },
      select: { id: true, merchantId: true },
    });
    if (!branch) throw new NotFoundException({ code: 'BRANCH_NOT_FOUND' });

    const where: Prisma.ProductWhereInput = {
      merchantId: branch.merchantId,
      isActive: true,
      deletedAt: null,
      availability: { some: { branchId: branch.id, isAvailable: true } },
      ...(search
        ? {
            OR: [
              { name: { contains: search, mode: 'insensitive' } },
              { nameAr: { contains: search, mode: 'insensitive' } },
            ],
          }
        : {}),
    };

    const [categories, products] = await this.prisma.$transaction([
      this.prisma.category.findMany({
        where: { merchantId: branch.merchantId, isActive: true },
        orderBy: { sortOrder: 'asc' },
      }),
      this.prisma.product.findMany({
        where,
        include: {
          availability: { where: { branchId } },
          modifierGroups: { include: { options: true }, orderBy: { sortOrder: 'asc' } },
        },
        orderBy: { sortOrder: 'asc' },
      }),
    ]);

    return {
      branchId: branch.id,
      categories: categories.map((category) => ({
        id: category.id,
        name: category.name,
        nameAr: category.nameAr,
        slug: category.slug,
        imageUrl: category.imageUrl,
        products: products
          .filter((product) => product.categoryId === category.id)
          .map((product) => this.serializeProduct(product)),
      })),
    };
  }

  async getProduct(branchId: string, productId: string) {
    const product = await this.prisma.product.findFirst({
      where: { id: productId, isActive: true, deletedAt: null },
      include: {
        availability: { where: { branchId } },
        modifierGroups: { include: { options: true }, orderBy: { sortOrder: 'asc' } },
      },
    });
    if (!product) throw new NotFoundException({ code: 'PRODUCT_NOT_FOUND' });
    return this.serializeProduct(product);
  }

  private serializeProduct(
    product: Prisma.ProductGetPayload<{
      include: {
        availability: true;
        modifierGroups: { include: { options: true } };
      };
    }>,
  ) {
    const branchPrice = product.availability[0]?.priceOverride;
    return {
      id: product.id,
      sku: product.sku,
      name: product.name,
      nameAr: product.nameAr,
      description: product.description,
      descriptionAr: product.descriptionAr,
      imageUrl: product.imageUrl,
      price: Number(branchPrice ?? product.basePrice),
      taxRate: Number(product.taxRate),
      calories: product.calories,
      prepSeconds: product.prepSeconds,
      isAvailable: product.availability[0]?.isAvailable ?? true,
      modifierGroups: product.modifierGroups.map((group) => ({
        id: group.id,
        name: group.name,
        nameAr: group.nameAr,
        minSelections: group.minSelections,
        maxSelections: group.maxSelections,
        isRequired: group.isRequired,
        options: group.options
          .filter((option) => option.isAvailable)
          .map((option) => ({
            id: option.id,
            name: option.name,
            nameAr: option.nameAr,
            priceDelta: Number(option.priceDelta),
            isDefault: option.isDefault,
          })),
      })),
    };
  }
}

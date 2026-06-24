import { Injectable, NotFoundException } from '@nestjs/common';
import { BranchStatus, Prisma } from '@prisma/client';

import { PrismaService } from '../../common/prisma/prisma.service';
import { paginate, PaginatedResult } from '../../common/pagination/pagination.dto';
import { haversineDistanceMeters } from '../../common/utils/geo.util';
import { BranchQueryDto } from './dto/branch-query.dto';

export interface BranchSummary {
  id: string;
  merchantId: string;
  merchantName: string;
  name: string;
  nameAr: string;
  latitude: number;
  longitude: number;
  status: BranchStatus;
  distanceMeters?: number;
  averagePrepMin: number;
  supportsDriveThru: boolean;
  supportsPickup: boolean;
}

@Injectable()
export class BranchesService {
  constructor(private readonly prisma: PrismaService) {}

  async list(query: BranchQueryDto): Promise<PaginatedResult<BranchSummary>> {
    const where: Prisma.BranchWhereInput = {
      deletedAt: null,
      status: { not: BranchStatus.COMING_SOON },
      cityId: query.cityId,
      merchantId: query.merchantId,
    };

    const [rows, totalItems] = await this.prisma.$transaction([
      this.prisma.branch.findMany({
        where,
        include: { merchant: true },
        skip: query.skip,
        take: query.take,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.branch.count({ where }),
    ]);

    const items = rows.map<BranchSummary>((row) => ({
      id: row.id,
      merchantId: row.merchantId,
      merchantName: row.merchant.nameAr,
      name: row.name,
      nameAr: row.nameAr,
      latitude: Number(row.latitude),
      longitude: Number(row.longitude),
      status: row.status,
      averagePrepMin: row.averagePrepMin,
      supportsDriveThru: row.supportsDriveThru,
      supportsPickup: row.supportsPickup,
      distanceMeters:
        query.latitude != null && query.longitude != null
          ? Math.round(
              haversineDistanceMeters(
                { latitude: query.latitude, longitude: query.longitude },
                { latitude: Number(row.latitude), longitude: Number(row.longitude) },
              ),
            )
          : undefined,
    }));

    if (query.latitude != null && query.longitude != null) {
      items.sort((a, b) => (a.distanceMeters ?? 0) - (b.distanceMeters ?? 0));
    }

    return paginate(items, totalItems, query);
  }

  async getById(id: string) {
    const branch = await this.prisma.branch.findFirst({
      where: { id, deletedAt: null },
      include: { merchant: true, city: true, hours: { orderBy: { dayOfWeek: 'asc' } } },
    });
    if (!branch) throw new NotFoundException({ code: 'BRANCH_NOT_FOUND' });
    return branch;
  }
}

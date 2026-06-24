import {
  PrismaClient,
  BranchStatus,
  CouponType,
  UserKind,
  AccountStatus,
  AuthProvider,
  AdminRole,
} from '@prisma/client';
import * as argon2 from 'argon2';

const prisma = new PrismaClient();

async function main(): Promise<void> {
  // ---------------------------------------------------------------------------
  // Cities
  // ---------------------------------------------------------------------------
  const riyadh = await prisma.city.upsert({
    where: { countryCode_name: { countryCode: 'SA', name: 'Riyadh' } },
    update: {},
    create: {
      name: 'Riyadh',
      nameAr: 'الرياض',
      centerLat: 24.7136,
      centerLng: 46.6753,
    },
  });
  await prisma.city.upsert({
    where: { countryCode_name: { countryCode: 'SA', name: 'Jeddah' } },
    update: {},
    create: {
      name: 'Jeddah',
      nameAr: 'جدة',
      centerLat: 21.4858,
      centerLng: 39.1925,
    },
  });

  // ---------------------------------------------------------------------------
  // Merchant + branch + menu
  // ---------------------------------------------------------------------------
  const merchant = await prisma.merchant.upsert({
    where: { slug: 'demo-coffee' },
    update: {},
    create: {
      name: 'Demo Coffee',
      nameAr: 'ديمو كوفي',
      slug: 'demo-coffee',
      vatNumber: '300000000000003',
      primaryColor: '#1F2937',
    },
  });

  const branch = await prisma.branch.upsert({
    where: { code: 'DEMO-001' },
    update: {},
    create: {
      merchantId: merchant.id,
      cityId: riyadh.id,
      name: 'King Fahd Road',
      nameAr: 'طريق الملك فهد',
      code: 'DEMO-001',
      latitude: 24.7136,
      longitude: 46.6753,
      address: 'طريق الملك فهد',
      status: BranchStatus.OPEN,
      arrivalRadiusM: 250,
      averagePrepMin: 6,
    },
  });

  for (let day = 0; day < 7; day += 1) {
    await prisma.branchHour.upsert({
      where: { branchId_dayOfWeek: { branchId: branch.id, dayOfWeek: day } },
      update: {},
      create: {
        branchId: branch.id,
        dayOfWeek: day,
        opensAt: '06:00',
        closesAt: '23:30',
      },
    });
  }

  const drinks = await prisma.category.upsert({
    where: { merchantId_slug: { merchantId: merchant.id, slug: 'drinks' } },
    update: {},
    create: {
      merchantId: merchant.id,
      name: 'Hot Drinks',
      nameAr: 'مشروبات ساخنة',
      slug: 'drinks',
      sortOrder: 1,
    },
  });

  const latte = await prisma.product.upsert({
    where: { sku: 'LATTE-12' },
    update: {},
    create: {
      merchantId: merchant.id,
      categoryId: drinks.id,
      sku: 'LATTE-12',
      name: 'Spanish Latte',
      nameAr: 'لاتيه إسباني',
      basePrice: 18,
      taxRate: 0.15,
      calories: 220,
      prepSeconds: 180,
    },
  });
  await prisma.branchProduct.upsert({
    where: { branchId_productId: { branchId: branch.id, productId: latte.id } },
    update: {},
    create: { branchId: branch.id, productId: latte.id, isAvailable: true },
  });

  await prisma.modifierGroup.create({
    data: {
      productId: latte.id,
      name: 'Size',
      nameAr: 'الحجم',
      minSelections: 1,
      maxSelections: 1,
      isRequired: true,
      options: {
        create: [
          { name: 'Medium', nameAr: 'وسط', priceDelta: 0, isDefault: true },
          { name: 'Large', nameAr: 'كبير', priceDelta: 4 },
        ],
      },
    },
  });

  // ---------------------------------------------------------------------------
  // Loyalty program + tier + coupon
  // ---------------------------------------------------------------------------
  await prisma.loyaltyProgram.upsert({
    where: { id: '00000000-0000-0000-0000-000000000001' },
    update: {},
    create: {
      id: '00000000-0000-0000-0000-000000000001',
      merchantId: merchant.id,
      name: 'Demo Rewards',
      earnRatio: 1,
      redeemValue: 0.05,
      welcomeBonus: 50,
      referralBonus: 100,
    },
  });

  await prisma.loyaltyTier.upsert({
    where: { merchantId_threshold: { merchantId: merchant.id, threshold: 0 } },
    update: {},
    create: {
      merchantId: merchant.id,
      name: 'Silver',
      nameAr: 'فضي',
      threshold: 0,
      multiplier: 1,
      sortOrder: 1,
    },
  });
  await prisma.loyaltyTier.upsert({
    where: { merchantId_threshold: { merchantId: merchant.id, threshold: 1_000 } },
    update: {},
    create: {
      merchantId: merchant.id,
      name: 'Gold',
      nameAr: 'ذهبي',
      threshold: 1_000,
      multiplier: 1.25,
      sortOrder: 2,
    },
  });

  await prisma.coupon.upsert({
    where: { code: 'WELCOME10' },
    update: {},
    create: {
      merchantId: merchant.id,
      code: 'WELCOME10',
      type: CouponType.PERCENT,
      value: 10,
      maxDiscount: 20,
      perCustomerLimit: 1,
    },
  });

  // ---------------------------------------------------------------------------
  // Platform admin user (email/password)
  // ---------------------------------------------------------------------------
  const adminEmail = 'admin@drivethru.local';
  const adminPassword = process.env.ADMIN_SEED_PASSWORD ?? 'ChangeMe!2026';
  const existingAdmin = await prisma.user.findUnique({
    where: { email: adminEmail },
    include: { adminProfile: true, identities: true },
  });
  if (!existingAdmin) {
    const passwordHash = await argon2.hash(adminPassword, { type: argon2.argon2id });
    await prisma.user.create({
      data: {
        email: adminEmail,
        emailVerifiedAt: new Date(),
        kind: UserKind.ADMIN,
        status: AccountStatus.ACTIVE,
        adminProfile: {
          create: { role: AdminRole.SUPER_ADMIN, fullName: 'Platform Admin' },
        },
        identities: {
          create: {
            provider: AuthProvider.EMAIL_PASSWORD,
            providerUserId: adminEmail,
            passwordHash,
          },
        },
      },
    });
    console.log(`Admin user created: ${adminEmail} / ${adminPassword}`);
  }

  // Link the seed merchant to an owner login (idempotent)
  const merchantOwnerEmail = 'owner@demo-coffee.local';
  const merchantOwnerPassword = process.env.MERCHANT_SEED_PASSWORD ?? 'ChangeMe!2026';
  const existingOwner = await prisma.user.findUnique({ where: { email: merchantOwnerEmail } });
  if (!existingOwner) {
    const passwordHash = await argon2.hash(merchantOwnerPassword, { type: argon2.argon2id });
    await prisma.user.create({
      data: {
        email: merchantOwnerEmail,
        emailVerifiedAt: new Date(),
        kind: UserKind.MERCHANT,
        status: AccountStatus.ACTIVE,
        merchantProfile: {
          create: { merchantId: merchant.id, position: 'Owner' },
        },
        identities: {
          create: {
            provider: AuthProvider.EMAIL_PASSWORD,
            providerUserId: merchantOwnerEmail,
            passwordHash,
          },
        },
      },
    });
    console.log(`Merchant owner created: ${merchantOwnerEmail} / ${merchantOwnerPassword}`);
  }

  console.log('Seed completed.');
}

main()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

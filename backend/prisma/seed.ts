import { PrismaClient, UserRole } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  const passwordHash = await bcrypt.hash('Admin123!', 12);

  const defaultAdminPassword = 'Admin123!';

  const admin = await prisma.user.upsert({
    where: { email: 'admin@foodapp.local' },
    update: {
      passwordHash,
      adminPasswordNote: defaultAdminPassword,
      role: UserRole.SUPER_ADMIN,
      isActive: true,
      deletedAt: null,
    },
    create: {
      email: 'admin@foodapp.local',
      phone: '+998900000001',
      fullName: 'Super Admin',
      role: UserRole.SUPER_ADMIN,
      passwordHash,
      adminPasswordNote: defaultAdminPassword,
    },
  });

  const manager = await prisma.user.upsert({
    where: { email: 'manager@foodapp.local' },
    update: {
      passwordHash,
      adminPasswordNote: defaultAdminPassword,
      phone: '+998900000002',
      isActive: true,
      deletedAt: null,
    },
    create: {
      email: 'manager@foodapp.local',
      phone: '+998900000002',
      fullName: 'Operations Manager',
      role: UserRole.MANAGER,
      passwordHash,
      adminPasswordNote: defaultAdminPassword,
    },
  });
  await prisma.manager.upsert({
    where: { userId: manager.id },
    update: {},
    create: { userId: manager.id },
  });

  const businessTypes = [
    { name: "Oziq-ovqat", slug: 'grocery', icon: '🥬', sortOrder: 1 },
    { name: "Gul do'konlari", slug: 'flowers', icon: '💐', sortOrder: 2 },
    { name: 'Parfyumeriya', slug: 'perfume', icon: '🧴', sortOrder: 3 },
    { name: "Sovg'alar", slug: 'gift', icon: '🎁', sortOrder: 4 },
    { name: 'Dorixona', slug: 'pharmacy', icon: '💊', sortOrder: 5 },
    { name: 'Elektronika', slug: 'electronics', icon: '💻', sortOrder: 6 },
    { name: 'Restoran', slug: 'restaurant', icon: '🍽', sortOrder: 0 },
  ];

  const typeMap: Record<string, string> = {};
  for (const t of businessTypes) {
    const row = await prisma.businessType.upsert({
      where: { slug: t.slug },
      update: { name: t.name, icon: t.icon, sortOrder: t.sortOrder, isActive: true },
      create: { ...t, isActive: true },
    });
    typeMap[t.slug] = row.id;
  }

  const restaurant = await prisma.business.upsert({
    where: { slug: 'demo-pizza' },
    update: {
      isActive: true,
      approvalStatus: 'APPROVED',
      deletedAt: null,
      businessTypeId: typeMap.restaurant,
    },
    create: {
      name: 'Demo Pizza',
      slug: 'demo-pizza',
      kind: 'RESTAURANT',
      description: 'Best pizza in town',
      commissionRate: 10,
      isActive: true,
      approvalStatus: 'APPROVED',
      businessTypeId: typeMap.restaurant,
      averageRating: 4.8,
      reviewCount: 120,
    },
  });

  let branch = await prisma.businessBranch.findFirst({
    where: { businessId: restaurant.id, name: 'Main Branch' },
  });
  if (!branch) {
    branch = await prisma.businessBranch.create({
      data: {
        businessId: restaurant.id,
        name: 'Main Branch',
        address: 'Tashkent, Amir Temur 1',
        latitude: 41.311081,
        longitude: 69.240562,
        isActive: true,
      },
    });
  }

  const owner = await prisma.user.upsert({
    where: { email: 'owner@foodapp.local' },
    update: { passwordHash, adminPasswordNote: defaultAdminPassword, isActive: true, deletedAt: null },
    create: {
      email: 'owner@foodapp.local',
      phone: '+998900000003',
      fullName: 'Business Owner',
      role: UserRole.BUSINESS,
      passwordHash,
      adminPasswordNote: defaultAdminPassword,
    },
  });

  await prisma.businessStaff.upsert({
    where: { userId_restaurantId: { userId: owner.id, businessId: restaurant.id } },
    update: {},
    create: { userId: owner.id, businessId: restaurant.id },
  });

  const courierUser = await prisma.user.upsert({
    where: { email: 'courier@foodapp.local' },
    update: { passwordHash, adminPasswordNote: defaultAdminPassword, isActive: true, deletedAt: null },
    create: {
      email: 'courier@foodapp.local',
      fullName: 'Demo Courier',
      phone: '+998901112233',
      role: UserRole.COURIER,
      passwordHash,
      adminPasswordNote: defaultAdminPassword,
    },
  });

  await prisma.courier.upsert({
    where: { userId: courierUser.id },
    update: {},
    create: { userId: courierUser.id, isOnline: true },
  });

  const dishCategory = await prisma.dishCategory.upsert({
    where: { slug: 'pizza' },
    update: {},
    create: { name: 'Pizza', slug: 'pizza', sortOrder: 0, isActive: true },
  });

  await prisma.product.upsert({
    where: { restaurantId_slug: { businessId: restaurant.id, slug: 'margherita' } },
    update: { dishCategoryId: dishCategory.id },
    create: {
      businessId: restaurant.id,
      dishCategoryId: dishCategory.id,
      name: 'Margherita',
      slug: 'margherita',
      description: 'Classic tomato and mozzarella',
      price: 45000,
      isAvailable: true,
    },
  });

  await prisma.setting.upsert({
    where: { key: 'delivery_pricing' },
    update: {},
    create: {
      key: 'delivery_pricing',
      group: 'delivery',
      value: {
        baseFee: 0,
        pricePerKm: 3000,
        minDeliveryFee: 0,
        roadDistanceFactor: 1.35,
        courierPricePerKm: 1500,
        courierMinFee: 5000,
      },
    },
  });

  await prisma.banner.createMany({
    data: [
      {
        title: '100 000 so‘mdan ortiq — bepul yetkazish',
        description: 'Buyurtma qiling va yetkazish xarajatisiz',
        imageUrl: '/banners/promo1.jpg',
        placement: 'PROMO',
        isActive: true,
        sortOrder: 0,
      },
    ],
    skipDuplicates: true,
  });

  await prisma.banner.updateMany({
    where: {
      deletedAt: null,
      imageUrl: '/banners/promo1.jpg',
      placement: 'HERO',
    },
    data: { placement: 'PROMO' },
  });

  console.log('Seed complete. Staff logins (password: Admin123!):');
  console.log('  Super Admin — email: admin@foodapp.local | phone: +998900000001');
  console.log('  Manager     — email: manager@foodapp.local');
  console.log('  Business    — email: owner@foodapp.local');
  console.log('  Courier     — email: courier@foodapp.local');
  console.log('  Restaurant:', branch.name);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());

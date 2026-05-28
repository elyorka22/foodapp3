import { PrismaClient, UserRole } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  const passwordHash = await bcrypt.hash('Admin123!', 12);

  const admin = await prisma.user.upsert({
    where: { email: 'admin@foodapp.local' },
    update: {},
    create: {
      email: 'admin@foodapp.local',
      fullName: 'Super Admin',
      role: UserRole.SUPER_ADMIN,
      passwordHash,
    },
  });

  const manager = await prisma.user.upsert({
    where: { email: 'manager@foodapp.local' },
    update: {},
    create: {
      email: 'manager@foodapp.local',
      fullName: 'Operations Manager',
      role: UserRole.MANAGER,
      passwordHash,
    },
  });
  await prisma.manager.upsert({
    where: { userId: manager.id },
    update: {},
    create: { userId: manager.id },
  });

  const restaurant = await prisma.restaurant.upsert({
    where: { slug: 'demo-pizza' },
    update: {},
    create: {
      name: 'Demo Pizza',
      slug: 'demo-pizza',
      description: 'Best pizza in town',
      commissionRate: 10,
      isActive: true,
    },
  });

  let branch = await prisma.restaurantBranch.findFirst({
    where: { restaurantId: restaurant.id, name: 'Main Branch' },
  });
  if (!branch) {
    branch = await prisma.restaurantBranch.create({
      data: {
        restaurantId: restaurant.id,
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
    update: {},
    create: {
      email: 'owner@foodapp.local',
      fullName: 'Restaurant Owner',
      role: UserRole.RESTAURANT_OWNER,
      passwordHash,
    },
  });

  await prisma.restaurantStaff.upsert({
    where: { userId_restaurantId: { userId: owner.id, restaurantId: restaurant.id } },
    update: {},
    create: { userId: owner.id, restaurantId: restaurant.id },
  });

  const courierUser = await prisma.user.upsert({
    where: { email: 'courier@foodapp.local' },
    update: {},
    create: {
      email: 'courier@foodapp.local',
      fullName: 'Demo Courier',
      phone: '+998901112233',
      role: UserRole.COURIER,
      passwordHash,
    },
  });

  await prisma.courier.upsert({
    where: { userId: courierUser.id },
    update: {},
    create: { userId: courierUser.id, isOnline: true },
  });

  const category = await prisma.category.upsert({
    where: { restaurantId_slug: { restaurantId: restaurant.id, slug: 'pizza' } },
    update: {},
    create: { restaurantId: restaurant.id, name: 'Pizza', slug: 'pizza' },
  });

  await prisma.product.upsert({
    where: { restaurantId_slug: { restaurantId: restaurant.id, slug: 'margherita' } },
    update: {},
    create: {
      restaurantId: restaurant.id,
      categoryId: category.id,
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
        baseFee: 5000,
        pricePerKm: 2000,
        minDeliveryFee: 8000,
        courierPricePerKm: 1500,
        courierMinFee: 5000,
      },
    },
  });

  await prisma.banner.createMany({
    data: [
      {
        title: 'Free delivery over 100k',
        imageUrl: '/banners/promo1.jpg',
        isActive: true,
        sortOrder: 0,
      },
    ],
    skipDuplicates: true,
  });

  console.log('Seed complete:', { admin: admin.email, branch: branch.name });
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());

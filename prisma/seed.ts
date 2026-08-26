import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

const CATEGORIES = [
  { slug: 'housing', nameRu: 'Жильё', nameEn: 'Housing', icon: 'home' },
  { slug: 'jobs', nameRu: 'Работа', nameEn: 'Jobs', icon: 'briefcase' },
  { slug: 'marketplace', nameRu: 'Маркет', nameEn: 'Marketplace', icon: 'shopping-bag' },
  { slug: 'services', nameRu: 'Услуги', nameEn: 'Services', icon: 'wrench' },
  { slug: 'vehicles', nameRu: 'Транспорт', nameEn: 'Vehicles', icon: 'car' },
  { slug: 'community', nameRu: 'Сообщество', nameEn: 'Community', icon: 'users' },
  { slug: 'education', nameRu: 'Образование', nameEn: 'Education', icon: 'book' },
  { slug: 'electronics', nameRu: 'Электроника', nameEn: 'Electronics', icon: 'phone' },
];

async function main() {

  console.log('🌱 Starting Branched seed...');


  console.log('Creating categories...');

  const categories: {
  id: string;
  slug: string;
  nameRu: string;
  nameEn: string;
  icon: string | null;
}[] = [];

  for (const category of CATEGORIES) {
    const result = await prisma.category.upsert({
      where: {
        slug: category.slug,
      },
      update: {
        nameRu: category.nameRu,
        nameEn: category.nameEn,
        icon: category.icon,
      },
      create: category,
    });

    categories.push(result);
  }


  const byId = (slug: string) => {
    const category = categories.find((c) => c.slug === slug);

    if (!category) {
      throw new Error(`Missing category ${slug}`);
    }

    return category.id;
  };


  console.log('Creating demo users...');


  const password = await bcrypt.hash('password123', 10);


  const users = await Promise.all([

    prisma.user.upsert({
      where: { email: 'anna@example.com' },
      update: {},
      create: {
        name: 'Anna Volkova',
        email: 'anna@example.com',
        password,
        location: 'Moscow, Russia',
        bio: 'Helping foreigners find apartments and everyday essentials.',
        isVerified: true,
      },
    }),


    prisma.user.upsert({
      where: { email: 'dmitri@example.com' },
      update: {},
      create: {
        name: 'Dmitri Orlov',
        email: 'dmitri@example.com',
        password,
        location: 'Saint Petersburg, Russia',
        bio: 'Full stack developer offering remote work.',
        isVerified: true,
      },
    }),


    prisma.user.upsert({
      where: { email: 'mira@example.com' },
      update: {},
      create: {
        name: 'Mira Petrova',
        email: 'mira@example.com',
        password,
        location: 'Kazan, Russia',
        bio: 'Russian language teacher for foreigners.',
        isVerified: true,
      },
    }),


    prisma.user.upsert({
      where: { email: 'alex@example.com' },
      update: {},
      create: {
        name: 'Alex Ivanov',
        email: 'alex@example.com',
        password,
        location: 'Moscow, Russia',
        bio: 'Cars, bikes and transport enthusiast.',
      },
    }),


    prisma.user.upsert({
      where: { email: 'elena@example.com' },
      update: {},
      create: {
        name: 'Elena Smirnova',
        email: 'elena@example.com',
        password,
        location: 'Saint Petersburg, Russia',
        bio: 'Designer and creative freelancer.',
      },
    }),


    prisma.user.upsert({
      where: { email: 'karim@example.com' },
      update: {},
      create: {
        name: 'Karim Hassan',
        email: 'karim@example.com',
        password,
        location: 'Moscow, Russia',
        bio: 'Selling electronics and gadgets.',
      },
    }),

  ]);


  const [
    anna,
    dmitri,
    mira,
    alex,
    elena,
    karim,
  ] = users;


  console.log('Removing old demo listings...');

  await prisma.listing.deleteMany();


  console.log('Creating listings...');
    const listings = [

    {
      title: 'Modern 2-room apartment near Moscow metro',
      description:
        'Bright furnished apartment close to metro, supermarkets, pharmacy and parks. Suitable for students and professionals.',
      price: 55000,
      currency: 'RUB',
      location: 'Moscow, Russia',
      categoryId: byId('housing'),
      userId: anna.id,
      featured: true,
      views: 1240,
      images: [
        'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800',
      ],
    },


    {
      title: 'Private room for foreign student',
      description:
        'Clean private room in shared apartment. Good transport connection and safe neighborhood.',
      price: 28000,
      currency: 'RUB',
      location: 'Moscow, Russia',
      categoryId: byId('housing'),
      userId: anna.id,
      featured: false,
      views: 430,
      images: [
        'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800',
      ],
    },


    {
      title: 'English speaking full stack developer',
      description:
        'React, Next.js and Node.js developer available for freelance and remote projects.',
      price: null,
      currency: 'RUB',
      location: 'Saint Petersburg, Russia',
      categoryId: byId('jobs'),
      userId: dmitri.id,
      featured: true,
      views: 980,
      images: [
        'https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=800',
      ],
    },


    {
      title: 'Russian language lessons for foreigners',
      description:
        'Private Russian lessons focused on speaking, grammar and daily communication.',
      price: 1500,
      currency: 'RUB',
      location: 'Kazan, Russia',
      categoryId: byId('education'),
      userId: mira.id,
      featured: true,
      views: 760,
      images: [
        'https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=800',
      ],
    },


    {
      title: 'iPhone 15 Pro 256GB',
      description:
        'Excellent condition smartphone. Original box included. Available for pickup.',
      price: 90000,
      currency: 'RUB',
      location: 'Moscow, Russia',
      categoryId: byId('electronics'),
      userId: karim.id,
      featured: true,
      views: 1500,
      images: [
        'https://images.unsplash.com/photo-1592750475338-74b7b21085ab?w=800',
      ],
    },


    {
      title: 'MacBook Pro M2',
      description:
        'Professional laptop suitable for developers, designers and students.',
      price: 120000,
      currency: 'RUB',
      location: 'Moscow, Russia',
      categoryId: byId('electronics'),
      userId: karim.id,
      featured: false,
      views: 620,
      images: [
        'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=800',
      ],
    },


    {
      title: 'City bicycle in excellent condition',
      description:
        'Comfortable bicycle for commuting around parks and city streets.',
      price: 18000,
      currency: 'RUB',
      location: 'Saint Petersburg, Russia',
      categoryId: byId('vehicles'),
      userId: alex.id,
      featured: false,
      views: 340,
      images: [
        'https://images.unsplash.com/photo-1485965120184-e220f721d03e?w=800',
      ],
    },


    {
      title: 'Car maintenance service',
      description:
        'Affordable vehicle inspection and repair services from experienced mechanics.',
      price: 3000,
      currency: 'RUB',
      location: 'Moscow, Russia',
      categoryId: byId('services'),
      userId: alex.id,
      featured: false,
      views: 510,
      images: [
        'https://images.unsplash.com/photo-1487754180451-c456f719a1fc?w=800',
      ],
    },


    {
      title: 'UI/UX design freelance service',
      description:
        'Modern interface design for websites and mobile applications.',
      price: 15000,
      currency: 'RUB',
      location: 'Saint Petersburg, Russia',
      categoryId: byId('services'),
      userId: elena.id,
      featured: true,
      views: 870,
      images: [
        'https://images.unsplash.com/photo-1558655146-9f40138edfeb?w=800',
      ],
    },


    {
      title: 'Foreigners meetup and language exchange',
      description:
        'Weekly community event for foreigners living in Russia.',
      price: null,
      currency: 'RUB',
      location: 'Kazan, Russia',
      categoryId: byId('community'),
      userId: mira.id,
      featured: true,
      views: 290,
      images: [
        'https://images.unsplash.com/photo-1529156069898-49953e39b3ac?w=800',
      ],
    },

  ];


  for (const listing of listings) {
    await prisma.listing.create({
      data: listing,
    });
  }


  console.log(`Created ${listings.length} listings`);

  console.log('');
  console.log('✅ Seed completed successfully');
  console.log('');
  console.log('Demo accounts:');
  console.log('anna@example.com / password123');
  console.log('dmitri@example.com / password123');
  console.log('mira@example.com / password123');
}


main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
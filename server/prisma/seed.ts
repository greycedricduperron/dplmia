import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  const hash = (p: string) => bcrypt.hash(p, 12);

  const t1 = await prisma.teacher.upsert({
    where: { email: 'prof.france@example.com' },
    update: {},
    create: {
      name: 'Marie Dupont',
      email: 'prof.france@example.com',
      passwordHash: await hash('password123'),
      language: 'fr',
      country: 'FR',
    },
  });

  const t2 = await prisma.teacher.upsert({
    where: { email: 'teacher.spain@example.com' },
    update: {},
    create: {
      name: 'Carlos García',
      email: 'teacher.spain@example.com',
      passwordHash: await hash('password123'),
      language: 'es',
      country: 'ES',
    },
  });

  const c1 = await prisma.class.upsert({
    where: { name_country: { name: 'CM2-A Bordeaux', country: 'FR' } },
    update: {},
    create: { name: 'CM2-A Bordeaux', country: 'FR', language: 'fr', teacherId: t1.id },
  });

  const c2 = await prisma.class.upsert({
    where: { name_country: { name: '5B Madrid', country: 'ES' } },
    update: {},
    create: { name: '5B Madrid', country: 'ES', language: 'es', teacherId: t2.id },
  });

  const conn = await prisma.classConnection.upsert({
    where: { requesterId_receiverId: { requesterId: c1.id, receiverId: c2.id } },
    update: {},
    create: { requesterId: c1.id, receiverId: c2.id, status: 'ACCEPTED' },
  });

  await prisma.post.createMany({
    skipDuplicates: true,
    data: [
      { title: 'Bonjour depuis Bordeaux !', content: 'Nous sommes ravis de vous rencontrer.', mediaType: 'TEXT', classId: c1.id },
      { title: '¡Hola desde Madrid!', content: 'Estamos muy contentos de conoceros.', mediaType: 'TEXT', classId: c2.id },
    ],
  });

  console.log('Seed done ✓');
  console.log('prof.france@example.com / password123');
  console.log('teacher.spain@example.com / password123');
}

main().finally(() => prisma.$disconnect());

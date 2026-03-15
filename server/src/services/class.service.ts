import { prisma } from '../config/prisma';
import { signToken } from '../utils/jwt';
import { CreateClassInput, UpdateClassInput } from '@dplmia/shared';

export async function createClass(teacherId: string, input: CreateClassInput) {
  const existing = await prisma.class.findUnique({ where: { teacherId } });
  if (existing) throw { status: 409, message: 'Vous avez déjà une classe' };

  const cls = await prisma.class.create({
    data: { ...input, teacherId },
  });

  // Re-issue token with classId
  const token = signToken({ teacherId, classId: cls.id });
  return { class: cls, token };
}

export async function getMyClass(teacherId: string) {
  const cls = await prisma.class.findUnique({
    where: { teacherId },
    include: {
      teacher: { select: { id: true, name: true, email: true, country: true, language: true } },
    },
  });
  if (!cls) throw { status: 404, message: 'Aucune classe trouvée' };
  return cls;
}

export async function updateClass(teacherId: string, input: UpdateClassInput) {
  const cls = await prisma.class.findUnique({ where: { teacherId } });
  if (!cls) throw { status: 404, message: 'Classe introuvable' };

  return prisma.class.update({ where: { id: cls.id }, data: input });
}

export async function deleteClass(teacherId: string) {
  const cls = await prisma.class.findUnique({ where: { teacherId } });
  if (!cls) throw { status: 404, message: 'Classe introuvable' };

  await prisma.class.delete({ where: { id: cls.id } });
}

export async function searchClass(name: string, country: string) {
  return prisma.class.findUnique({
    where: { name_country: { name, country } },
    select: { id: true, name: true, country: true, language: true },
  });
}

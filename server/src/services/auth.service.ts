import { prisma } from '../config/prisma';
import { hash, compare } from '../utils/password';
import { signToken } from '../utils/jwt';
import { RegisterInput, LoginInput } from '@dplmia/shared';

export async function register(input: RegisterInput) {
  const existing = await prisma.teacher.findUnique({ where: { email: input.email } });
  if (existing) throw { status: 409, message: 'Email déjà utilisé' };

  const passwordHash = await hash(input.password);
  const teacher = await prisma.teacher.create({
    data: {
      name: input.name,
      email: input.email,
      passwordHash,
      language: input.language,
      country: input.country,
    },
    include: { class: true },
  });

  const token = signToken({ teacherId: teacher.id, classId: teacher.class?.id ?? null });
  return { teacher, token };
}

export async function login(input: LoginInput) {
  const teacher = await prisma.teacher.findUnique({
    where: { email: input.email },
    include: { class: true },
  });
  if (!teacher) throw { status: 401, message: 'Identifiants incorrects' };

  const valid = await compare(input.password, teacher.passwordHash);
  if (!valid) throw { status: 401, message: 'Identifiants incorrects' };

  const token = signToken({ teacherId: teacher.id, classId: teacher.class?.id ?? null });
  return { teacher, token };
}

export async function getMe(teacherId: string) {
  const teacher = await prisma.teacher.findUnique({
    where: { id: teacherId },
    include: { class: true },
  });
  if (!teacher) throw { status: 404, message: 'Enseignant introuvable' };
  return teacher;
}

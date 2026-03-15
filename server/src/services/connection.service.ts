import { prisma } from '../config/prisma';

const includeClasses = {
  requester: { select: { id: true, name: true, country: true, language: true } },
  receiver: { select: { id: true, name: true, country: true, language: true } },
};

export async function sendInvite(classId: string, targetName: string, targetCountry: string) {
  const target = await prisma.class.findUnique({
    where: { name_country: { name: targetName, country: targetCountry } },
  });
  if (!target) throw { status: 404, message: 'Classe cible introuvable' };
  if (target.id === classId) throw { status: 400, message: 'Vous ne pouvez pas vous inviter vous-même' };

  const existing = await prisma.classConnection.findFirst({
    where: {
      OR: [
        { requesterId: classId, receiverId: target.id },
        { requesterId: target.id, receiverId: classId },
      ],
    },
  });
  if (existing) throw { status: 409, message: 'Une connexion existe déjà avec cette classe' };

  return prisma.classConnection.create({
    data: { requesterId: classId, receiverId: target.id },
    include: includeClasses,
  });
}

export async function getConnections(classId: string) {
  return prisma.classConnection.findMany({
    where: {
      OR: [{ requesterId: classId }, { receiverId: classId }],
    },
    include: includeClasses,
    orderBy: { createdAt: 'desc' },
  });
}

export async function getPendingReceived(classId: string) {
  return prisma.classConnection.findMany({
    where: { receiverId: classId, status: 'PENDING' },
    include: includeClasses,
  });
}

export async function respondToInvite(connectionId: string, classId: string, accept: boolean) {
  const conn = await prisma.classConnection.findUnique({ where: { id: connectionId } });
  if (!conn) throw { status: 404, message: 'Connexion introuvable' };
  if (conn.receiverId !== classId) throw { status: 403, message: 'Non autorisé' };
  if (conn.status !== 'PENDING') throw { status: 400, message: 'Invitation déjà traitée' };

  return prisma.classConnection.update({
    where: { id: connectionId },
    data: { status: accept ? 'ACCEPTED' : 'REJECTED' },
    include: includeClasses,
  });
}

export async function removeConnection(connectionId: string, classId: string) {
  const conn = await prisma.classConnection.findUnique({ where: { id: connectionId } });
  if (!conn) throw { status: 404, message: 'Connexion introuvable' };
  if (conn.requesterId !== classId && conn.receiverId !== classId) {
    throw { status: 403, message: 'Non autorisé' };
  }
  await prisma.classConnection.delete({ where: { id: connectionId } });
}

export async function getAcceptedConnection(classId: string) {
  return prisma.classConnection.findFirst({
    where: {
      status: 'ACCEPTED',
      OR: [{ requesterId: classId }, { receiverId: classId }],
    },
  });
}

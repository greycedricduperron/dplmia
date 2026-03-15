import { prisma } from '../config/prisma';
import { MediaType } from '@prisma/client';
import { getAcceptedConnection } from './connection.service';

const includeClass = {
  class: { select: { id: true, name: true, country: true, language: true } },
};

async function assertFeedAccess(classId: string) {
  const conn = await getAcceptedConnection(classId);
  if (!conn) throw { status: 403, message: 'Aucune classe connectée' };
  return conn;
}

export async function getFeed(classId: string) {
  const conn = await assertFeedAccess(classId);
  const partnerClassId = conn.requesterId === classId ? conn.receiverId : conn.requesterId;

  return prisma.post.findMany({
    where: { classId: { in: [classId, partnerClassId] } },
    include: { ...includeClass, _count: { select: { comments: true } } },
    orderBy: { createdAt: 'desc' },
  });
}

export async function getMediaPosts(classId: string, mediaType: MediaType) {
  const conn = await assertFeedAccess(classId);
  const partnerClassId = conn.requesterId === classId ? conn.receiverId : conn.requesterId;

  return prisma.post.findMany({
    where: { classId: { in: [classId, partnerClassId] }, mediaType },
    include: includeClass,
    orderBy: { createdAt: 'desc' },
  });
}

export async function createPost(
  classId: string,
  data: { title: string; content?: string; mediaType: MediaType; mediaUrl?: string }
) {
  return prisma.post.create({
    data: { ...data, classId },
    include: includeClass,
  });
}

export async function deletePost(postId: string, classId: string) {
  const post = await prisma.post.findUnique({ where: { id: postId } });
  if (!post) throw { status: 404, message: 'Post introuvable' };
  if (post.classId !== classId) throw { status: 403, message: 'Non autorisé' };
  await prisma.post.delete({ where: { id: postId } });
}

export async function getComments(postId: string) {
  return prisma.comment.findMany({
    where: { postId },
    include: includeClass,
    orderBy: { createdAt: 'asc' },
  });
}

export async function addComment(postId: string, classId: string, content: string) {
  // Verify post exists and requester has access
  const post = await prisma.post.findUnique({ where: { id: postId } });
  if (!post) throw { status: 404, message: 'Post introuvable' };

  const conn = await getAcceptedConnection(classId);
  if (!conn) throw { status: 403, message: 'Accès refusé' };

  const partnerClassId = conn.requesterId === classId ? conn.receiverId : conn.requesterId;
  if (post.classId !== classId && post.classId !== partnerClassId) {
    throw { status: 403, message: 'Accès refusé' };
  }

  return prisma.comment.create({
    data: { postId, classId, content },
    include: includeClass,
  });
}

export async function deleteComment(commentId: string, classId: string) {
  const comment = await prisma.comment.findUnique({ where: { id: commentId } });
  if (!comment) throw { status: 404, message: 'Commentaire introuvable' };
  if (comment.classId !== classId) throw { status: 403, message: 'Non autorisé' };
  await prisma.comment.delete({ where: { id: commentId } });
}

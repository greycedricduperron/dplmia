import { Request, Response, NextFunction } from 'express';
import * as postService from '../services/post.service';
import { ok, fail } from '../utils/apiResponse';

function classId(req: Request) {
  if (!req.teacher.classId) throw { status: 400, message: 'Vous devez créer une classe d\'abord' };
  return req.teacher.classId;
}

export async function getFeed(req: Request, res: Response, next: NextFunction) {
  try {
    ok(res, await postService.getFeed(classId(req)));
  } catch (e: any) {
    e.status ? fail(res, e.message, e.status) : next(e);
  }
}

export async function getGallery(req: Request, res: Response, next: NextFunction) {
  try {
    ok(res, await postService.getMediaPosts(classId(req), 'IMAGE'));
  } catch (e: any) {
    e.status ? fail(res, e.message, e.status) : next(e);
  }
}

export async function getAudio(req: Request, res: Response, next: NextFunction) {
  try {
    ok(res, await postService.getMediaPosts(classId(req), 'AUDIO'));
  } catch (e: any) {
    e.status ? fail(res, e.message, e.status) : next(e);
  }
}

export async function createTextPost(req: Request, res: Response, next: NextFunction) {
  try {
    const post = await postService.createPost(classId(req), {
      title: req.body.title,
      content: req.body.content,
      mediaType: 'TEXT',
    });
    ok(res, post, 201);
  } catch (e: any) {
    e.status ? fail(res, e.message, e.status) : next(e);
  }
}

export async function createImagePost(req: Request, res: Response, next: NextFunction) {
  try {
    if (!req.file) return fail(res, 'Fichier image requis', 400);
    const post = await postService.createPost(classId(req), {
      title: req.body.title,
      content: req.body.content,
      mediaType: 'IMAGE',
      mediaUrl: `/uploads/images/${req.file.filename}`,
    });
    ok(res, post, 201);
  } catch (e: any) {
    e.status ? fail(res, e.message, e.status) : next(e);
  }
}

export async function createAudioPost(req: Request, res: Response, next: NextFunction) {
  try {
    if (!req.file) return fail(res, 'Fichier audio requis', 400);
    const post = await postService.createPost(classId(req), {
      title: req.body.title,
      content: req.body.content,
      mediaType: 'AUDIO',
      mediaUrl: `/uploads/audio/${req.file.filename}`,
    });
    ok(res, post, 201);
  } catch (e: any) {
    e.status ? fail(res, e.message, e.status) : next(e);
  }
}

export async function deletePost(req: Request, res: Response, next: NextFunction) {
  try {
    await postService.deletePost(req.params.id, classId(req));
    ok(res, null);
  } catch (e: any) {
    e.status ? fail(res, e.message, e.status) : next(e);
  }
}

export async function getComments(req: Request, res: Response, next: NextFunction) {
  try {
    ok(res, await postService.getComments(req.params.postId));
  } catch (e: any) {
    e.status ? fail(res, e.message, e.status) : next(e);
  }
}

export async function addComment(req: Request, res: Response, next: NextFunction) {
  try {
    ok(res, await postService.addComment(req.params.postId, classId(req), req.body.content), 201);
  } catch (e: any) {
    e.status ? fail(res, e.message, e.status) : next(e);
  }
}

export async function deleteComment(req: Request, res: Response, next: NextFunction) {
  try {
    await postService.deleteComment(req.params.commentId, classId(req));
    ok(res, null);
  } catch (e: any) {
    e.status ? fail(res, e.message, e.status) : next(e);
  }
}

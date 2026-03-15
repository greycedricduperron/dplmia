import { Request, Response, NextFunction } from 'express';
import * as classService from '../services/class.service';
import { ok, fail } from '../utils/apiResponse';
import { env } from '../config/env';

const COOKIE_OPTS = {
  httpOnly: true,
  sameSite: 'lax' as const,
  secure: env.NODE_ENV === 'production',
  maxAge: 7 * 24 * 60 * 60 * 1000,
};

export async function createClass(req: Request, res: Response, next: NextFunction) {
  try {
    const { class: cls, token } = await classService.createClass(req.teacher.teacherId, req.body);
    res.cookie('token', token, COOKIE_OPTS);
    ok(res, cls, 201);
  } catch (e: any) {
    e.status ? fail(res, e.message, e.status) : next(e);
  }
}

export async function getMyClass(req: Request, res: Response, next: NextFunction) {
  try {
    ok(res, await classService.getMyClass(req.teacher.teacherId));
  } catch (e: any) {
    e.status ? fail(res, e.message, e.status) : next(e);
  }
}

export async function updateClass(req: Request, res: Response, next: NextFunction) {
  try {
    ok(res, await classService.updateClass(req.teacher.teacherId, req.body));
  } catch (e: any) {
    e.status ? fail(res, e.message, e.status) : next(e);
  }
}

export async function deleteClass(req: Request, res: Response, next: NextFunction) {
  try {
    await classService.deleteClass(req.teacher.teacherId);
    ok(res, null);
  } catch (e: any) {
    e.status ? fail(res, e.message, e.status) : next(e);
  }
}

export async function searchClass(req: Request, res: Response, next: NextFunction) {
  try {
    const { name, country } = req.query as { name: string; country: string };
    if (!name || !country) return fail(res, 'name et country requis', 400);
    ok(res, await classService.searchClass(name, country));
  } catch (e: any) {
    e.status ? fail(res, e.message, e.status) : next(e);
  }
}

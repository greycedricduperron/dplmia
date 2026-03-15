import { Request, Response, NextFunction } from 'express';
import * as authService from '../services/auth.service';
import { ok, fail } from '../utils/apiResponse';
import { env } from '../config/env';

const COOKIE_OPTS = {
  httpOnly: true,
  sameSite: 'lax' as const,
  secure: env.NODE_ENV === 'production',
  maxAge: 7 * 24 * 60 * 60 * 1000,
};

export async function register(req: Request, res: Response, next: NextFunction) {
  try {
    const { teacher, token } = await authService.register(req.body);
    res.cookie('token', token, COOKIE_OPTS);
    const { passwordHash: _, ...safeTeacher } = teacher as any;
    ok(res, safeTeacher, 201);
  } catch (e: any) {
    e.status ? fail(res, e.message, e.status) : next(e);
  }
}

export async function login(req: Request, res: Response, next: NextFunction) {
  try {
    const { teacher, token } = await authService.login(req.body);
    res.cookie('token', token, COOKIE_OPTS);
    const { passwordHash: _, ...safeTeacher } = teacher as any;
    ok(res, safeTeacher);
  } catch (e: any) {
    e.status ? fail(res, e.message, e.status) : next(e);
  }
}

export function logout(req: Request, res: Response) {
  res.clearCookie('token');
  ok(res, null);
}

export async function me(req: Request, res: Response, next: NextFunction) {
  try {
    const teacher = await authService.getMe(req.teacher.teacherId);
    const { passwordHash: _, ...safeTeacher } = teacher as any;
    ok(res, safeTeacher);
  } catch (e: any) {
    e.status ? fail(res, e.message, e.status) : next(e);
  }
}

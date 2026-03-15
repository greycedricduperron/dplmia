import { Request, Response, NextFunction } from 'express';
import { verifyToken, JwtPayload } from '../utils/jwt';
import { fail } from '../utils/apiResponse';

declare global {
  namespace Express {
    interface Request {
      teacher: JwtPayload;
    }
  }
}

export function requireAuth(req: Request, res: Response, next: NextFunction) {
  const token = req.cookies?.token as string | undefined;
  if (!token) return fail(res, 'Non authentifié', 401);
  try {
    req.teacher = verifyToken(token);
    next();
  } catch {
    return fail(res, 'Token invalide ou expiré', 401);
  }
}

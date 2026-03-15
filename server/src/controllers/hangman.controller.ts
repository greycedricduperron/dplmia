import { Request, Response, NextFunction } from 'express';
import * as hangmanService from '../services/hangman.service';
import { ok, fail } from '../utils/apiResponse';

function classId(req: Request) {
  if (!req.teacher.classId) throw { status: 400, message: 'Vous devez créer une classe d\'abord' };
  return req.teacher.classId;
}

export async function proposeGame(req: Request, res: Response, next: NextFunction) {
  try {
    ok(res, await hangmanService.proposeGame(classId(req), req.body), 201);
  } catch (e: any) {
    e.status ? fail(res, e.message, e.status) : next(e);
  }
}

export async function listGames(req: Request, res: Response, next: NextFunction) {
  try {
    const { connectionId } = req.query as { connectionId: string };
    if (!connectionId) return fail(res, 'connectionId requis', 400);
    ok(res, await hangmanService.listGames(classId(req), connectionId));
  } catch (e: any) {
    e.status ? fail(res, e.message, e.status) : next(e);
  }
}

export async function getGame(req: Request, res: Response, next: NextFunction) {
  try {
    ok(res, await hangmanService.getGame(req.params.id, classId(req)));
  } catch (e: any) {
    e.status ? fail(res, e.message, e.status) : next(e);
  }
}

export async function guessLetter(req: Request, res: Response, next: NextFunction) {
  try {
    ok(res, await hangmanService.guessLetter(req.params.id, classId(req), req.body.letter));
  } catch (e: any) {
    e.status ? fail(res, e.message, e.status) : next(e);
  }
}

export async function abandonGame(req: Request, res: Response, next: NextFunction) {
  try {
    ok(res, await hangmanService.abandonGame(req.params.id, classId(req)));
  } catch (e: any) {
    e.status ? fail(res, e.message, e.status) : next(e);
  }
}

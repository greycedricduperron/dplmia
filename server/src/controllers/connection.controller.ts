import { Request, Response, NextFunction } from 'express';
import * as connService from '../services/connection.service';
import { ok, fail } from '../utils/apiResponse';

function classId(req: Request) {
  if (!req.teacher.classId) throw { status: 400, message: 'Vous devez créer une classe d\'abord' };
  return req.teacher.classId;
}

export async function sendInvite(req: Request, res: Response, next: NextFunction) {
  try {
    const { name, country } = req.body;
    ok(res, await connService.sendInvite(classId(req), name, country), 201);
  } catch (e: any) {
    e.status ? fail(res, e.message, e.status) : next(e);
  }
}

export async function getConnections(req: Request, res: Response, next: NextFunction) {
  try {
    ok(res, await connService.getConnections(classId(req)));
  } catch (e: any) {
    e.status ? fail(res, e.message, e.status) : next(e);
  }
}

export async function getPending(req: Request, res: Response, next: NextFunction) {
  try {
    ok(res, await connService.getPendingReceived(classId(req)));
  } catch (e: any) {
    e.status ? fail(res, e.message, e.status) : next(e);
  }
}

export async function accept(req: Request, res: Response, next: NextFunction) {
  try {
    ok(res, await connService.respondToInvite(req.params.id, classId(req), true));
  } catch (e: any) {
    e.status ? fail(res, e.message, e.status) : next(e);
  }
}

export async function reject(req: Request, res: Response, next: NextFunction) {
  try {
    ok(res, await connService.respondToInvite(req.params.id, classId(req), false));
  } catch (e: any) {
    e.status ? fail(res, e.message, e.status) : next(e);
  }
}

export async function remove(req: Request, res: Response, next: NextFunction) {
  try {
    await connService.removeConnection(req.params.id, classId(req));
    ok(res, null);
  } catch (e: any) {
    e.status ? fail(res, e.message, e.status) : next(e);
  }
}

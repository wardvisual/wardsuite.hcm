import * as admin from 'firebase-admin';
import { Request, Response, NextFunction } from 'express';
import { error } from '@api/core/utils/response.utils';

export interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
    email: string;
    role: string;
    employeeCode?: string;
  };
}

export async function requireAuth(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader?.startsWith('Bearer ')) {
      res.status(401).json(error('Unauthorized — no token provided', 401));
      return;
    }

    const token = authHeader.substring(7);
    const decoded = await admin.auth().verifyIdToken(token);

    const userDoc = await admin.firestore().collection('users').doc(decoded.uid).get();
    const userData = userDoc.data();

    req.user = {
      id: decoded.uid,
      email: decoded.email ?? '',
      role: userData?.role ?? 'STAFF',
      employeeCode: userData?.employeeCode,
    };

    next();
  } catch {
    res.status(401).json(error('Unauthorized — invalid or expired token', 401));
  }
}

export function requireRole(...roles: string[]) {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json(error('Unauthorized', 401));
      return;
    }

    if (!roles.includes(req.user.role)) {
      res.status(403).json(error('Forbidden — insufficient permissions', 403));
      return;
    }

    next();
  };
}

export function resolveActor(req: AuthenticatedRequest): string {
  return req.user?.id ?? 'system';
}

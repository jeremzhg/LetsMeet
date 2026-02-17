import { Request, Response, NextFunction } from "express";
import * as JwtService from '../services/jwt_service';

declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string;
        email: string;
        role: 'org' | 'corp';
      }
    }
  }
}

export const authenticate = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const token = req.cookies.access_token;

    if (!token) {
      return res.status(401).json({ error: "unauthorized: no token provided" });
    }

    const payload = await JwtService.verifyJWT(token);

    req.user = payload;

    next();
  } catch (error) {
    return res.status(401).json({ error: "unauthorized: invalid token" });
  }
};

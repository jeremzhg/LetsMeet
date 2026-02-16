import { Request, Response } from "express";
import * as JwtService from '../services/jwt_service';

async function logout(req: Request, res: Response){
  res.clearCookie('access_token');
  return res.status(200).json({ message: 'logout successful' });
};

async function verify(req: Request, res: Response) {
  try {
    const token = req.cookies.access_token;
    if (!token) {
      return res.status(401).json({ error: "unauthorized" });
    }

    const payload = await JwtService.verifyJWT(token);

    const roleMap = {
      'corp': 'corporation',
      'org': 'organization'
    };

    return res.status(200).json({
      message: "verified",
      user: {
        id: payload.id,
        email: payload.email,
        role: roleMap[payload.role]
      }
    });
  } catch (error) {
    return res.status(401).json({ error: "invalid token" });
  }
}

export {logout, verify}
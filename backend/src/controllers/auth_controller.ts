import { Request, Response } from "express";

async function logout(req: Request, res: Response){
  res.clearCookie('access_token');
  return res.status(200).json({ message: 'logout successful' });
};

export {logout}
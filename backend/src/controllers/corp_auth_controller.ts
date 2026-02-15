import { Request, Response } from "express";
import * as CorpRepo from '../repositories/prisma_corporation_repository';
import * as JwtService from '../services/jwt_service';
import * as BcryptService from '../services/bcrypt_service';

async function registerCorp(req: Request, res: Response) {
  try {
    const { email, name, password, details } = req.body;
    if (!email || !name || !password || !details) {
      return res.status(400).json({ error: "bad request" });
    }

    const exist = await CorpRepo.findCorpByEmail(email)
    const hashedPassword = await BcryptService.hashPassword(password);

    if (!exist) {
      await CorpRepo.createCorp({
        email: email,
        name: name,
        hashedPassword: hashedPassword,
        details: details,
      })

      return res.status(201).json({ message: "corporation created successfully" });
    }
    await CorpRepo.claimCorp(exist.id, {
      name: name,
      hashedPassword: hashedPassword,
      details: details,
    })
    return res.status(200).json({ message: "corporation claimed successfully" });



  } catch (error: unknown) {
    if (error instanceof Error) {
      return res.status(409).json({ error: error.message });
    }
    return res.status(500).json({ error: "internal server error" });
  }
}

async function corpLogin(req: Request, res: Response) {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: "bad request" });
    }

    const corp = await CorpRepo.findCorpByEmail(email);
    if (!corp) {
      return res.status(404).json({ error: "not found" });
    }

    if (corp.isClaimed) {
      const ok = await BcryptService.comparePassword(password, corp.hashedPassword)
      if (!ok) {
        return res.status(401).json({ error: "unauthorized access" })
      }

      const token = await JwtService.generateJWT({
        id: corp.id,
        email: corp.email,
      });

      res.cookie("access_token", token, {
        httpOnly: true,
        maxAge: 1000 * 60 * 60 * 24,
        path: "/",
      });

      return res.status(200).json({ message: "login successful", role: "corporation" });
    }
  } catch (error: unknown) {
    if (error instanceof Error) {
      return res.status(401).json({ error: error.message });
    }
    return res.status(500).json({ error: "internal server error" });
  }
}

export { corpLogin, registerCorp }


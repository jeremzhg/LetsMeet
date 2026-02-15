import { Request, Response } from "express";
import * as OrgRepo from '../repositories/prisma_organization_repository';
import * as JwtService from '../services/jwt_service';
import * as BcryptService from '../services/bcrypt_service';

async function registerOrg(req: Request, res: Response){
  try{
    const {email, name, password, details} = req.body;
    if (!email || !name || !password || !details){
      return res.status(400).json({error: "bad request"});
    }

    const exist = OrgRepo.findOrgByEmail(email)
    if(!exist){
      return res.status(409).json({error: "email already taken"})
    }
    
    const hashedPassword = await BcryptService.hashPassword(password);

    await OrgRepo.createOrg({
      email: email,
      name: name,
      hashedPassword: hashedPassword,
      details: details,
    })
    
    return res.status(201).json({ message: "organization created successfully" });

  }catch (error: unknown) {
      if (error instanceof Error) {
        return res.status(409).json({ error: error.message });
      }
      return res.status(500).json({ error: "internal server error" });
    }
}

async function orgLogin(req: Request, res: Response){
  try {
      const { email, password } = req.body;
      if (!email || !password) {
        return res.status(400).json({ error: "bad request" });
      }
      
      const org = await OrgRepo.findOrgByEmail(email); 
      if(!org){
        return res.status(404).json({ error: "not found"});
      }

      const ok = await BcryptService.comparePassword(password, org.hashedPassword)
      if(!ok){
        return res.status(401).json({ error: "unauthorized access"})
      }

      const token = await JwtService.generateJWT({
        id: org.id,
        email: org.email,
      });

      res.cookie("access_token", token, {
        httpOnly: true,
        maxAge: 1000 * 60 * 60 * 24,
        path: "/",
      });

      return res.status(200).json({ message: "login successful", role: "organization" });
    } catch (error: unknown) {
      if (error instanceof Error) {
        return res.status(401).json({ error: error.message });
      }
      return res.status(500).json({ error: "internal server error" });
    }
}

export {orgLogin, registerOrg}


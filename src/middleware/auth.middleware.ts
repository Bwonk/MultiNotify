import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { env } from "../config/env.js";

export interface AuthRequest extends Request {
  admin?: { id: number; email: string };
}

export function authenticate(req: AuthRequest, res: Response, next: NextFunction) {
  const header = req.headers.authorization;
  if (!header?.startsWith("Bearer "))
    return res.status(401).json({ success: false, message: "Token gerekli" });
  try {
    req.admin = jwt.verify(header.split(" ")[1], env.JWT_SECRET) as { id: number; email: string };
    next();
  } catch {
    res.status(401).json({ success: false, message: "Geçersiz token" });
  }
}
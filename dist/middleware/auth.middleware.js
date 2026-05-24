import jwt from "jsonwebtoken";
import { env } from "../config/env.js";
export function authenticate(req, res, next) {
    const header = req.headers.authorization;
    if (!header?.startsWith("Bearer "))
        return res.status(401).json({ success: false, message: "Token gerekli" });
    try {
        req.admin = jwt.verify(header.split(" ")[1], env.JWT_SECRET);
        next();
    }
    catch {
        res.status(401).json({ success: false, message: "Geçersiz token" });
    }
}

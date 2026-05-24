import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import prisma from "../config/db.js";
import { env } from "../config/env.js";
export async function register(req, res, next) {
    try {
        const { email, password, name } = req.body;
        const existing = await prisma.admin.findUnique({ where: { email } });
        if (existing)
            return res.status(409).json({ success: false, message: "Email zaten kayıtlı" });
        const hashed = await bcrypt.hash(password, 10);
        const admin = await prisma.admin.create({ data: { email, password: hashed, name } });
        res.status(201).json({ success: true, data: { id: admin.id, email: admin.email, name: admin.name } });
    }
    catch (err) {
        next(err);
    }
}
export async function login(req, res, next) {
    try {
        const { email, password } = req.body;
        const admin = await prisma.admin.findUnique({ where: { email } });
        if (!admin || !(await bcrypt.compare(password, admin.password)))
            return res.status(401).json({ success: false, message: "Email veya şifre hatalı" });
        const token = jwt.sign({ id: admin.id, email: admin.email }, env.JWT_SECRET, { expiresIn: env.JWT_EXPIRES_IN });
        res.json({ success: true, data: { token, admin: { id: admin.id, email: admin.email, name: admin.name } } });
    }
    catch (err) {
        next(err);
    }
}

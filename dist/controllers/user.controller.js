import prisma from "../config/db.js";
export async function list(req, res, next) {
    try {
        const page = Number(req.query.page) || 1;
        const limit = Number(req.query.limit) || 50;
        const [items, total] = await Promise.all([
            prisma.user.findMany({ skip: (page - 1) * limit, take: limit, orderBy: { createdAt: "desc" } }),
            prisma.user.count(),
        ]);
        res.json({ success: true, items, total, page, limit });
    }
    catch (err) {
        next(err);
    }
}
export async function create(req, res, next) {
    try {
        const user = await prisma.user.create({ data: req.body });
        res.status(201).json({ success: true, data: user });
    }
    catch (err) {
        if (err.code === "P2002")
            return res.status(409).json({ success: false, message: "Email veya telefon zaten kayıtlı" });
        next(err);
    }
}
export async function remove(req, res, next) {
    try {
        await prisma.user.delete({ where: { id: Number(req.params.id) } });
        res.json({ success: true, message: "Kullanıcı silindi" });
    }
    catch (err) {
        if (err.code === "P2025")
            return res.status(404).json({ success: false, message: "Kullanıcı bulunamadı" });
        next(err);
    }
}

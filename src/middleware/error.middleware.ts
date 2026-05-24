import { Request, Response, NextFunction } from "express";

export function errorHandler(err: any, req: Request, res: Response, next: NextFunction) {
  const status = err.status || err.statusCode || 500;
  const message = err.message || "Sunucu hatası";
  if (process.env.NODE_ENV === "development") console.error("[ERROR]", err);
  res.status(status).json({ success: false, message });
}

export function notFound(req: Request, res: Response) {
  res.status(404).json({ success: false, message: `Route bulunamadı: ${req.method} ${req.path}` });
}
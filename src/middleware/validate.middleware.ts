import { Request, Response, NextFunction } from "express";
import { ZodSchema, ZodError } from "zod";

export function validate(schema: ZodSchema) {
  return (req: Request, res: Response, next: NextFunction) => {
    const result = schema.safeParse(req.body);
    if (result.success) {
      req.body = result.data;
      next();
    } else {
      return res.status(400).json({
        success: false,
        message: "Validasyon hatası",
        errors: result.error.issues.map((e: any) => ({
          field: e.path.join("."),
          message: e.message,
        })),
      });
    }
  };
}
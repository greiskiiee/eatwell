import type { Request, Response, NextFunction } from "express";

export function notFound(_req: Request, res: Response, _next: NextFunction) {
  void _next;
  res.status(404).json({ error: "NOT_FOUND" });
}


import type { NextFunction, Request, Response } from "express";
import { UpstreamError } from "../lib/http";

export function errorHandler(
  err: unknown,
  _req: Request,
  res: Response,
  _next: NextFunction,
) {
  void _next;
  if (err instanceof UpstreamError) {
    return res.status(502).json({
      error: "UPSTREAM_ERROR",
      upstreamStatus: err.status,
      upstreamBody: err.upstreamBody,
    });
  }

  if (err instanceof Error) {
    return res.status(500).json({ error: "INTERNAL_ERROR", message: err.message });
  }

  return res.status(500).json({ error: "INTERNAL_ERROR" });
}


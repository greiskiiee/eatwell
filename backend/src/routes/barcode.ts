import { Router } from "express";
import { fetchJson } from "../lib/http";

export const barcodeRouter = Router();

function requireEnv(name: string): string {
  const value = process.env[name];
  if (!value) throw new Error(`Missing required env var: ${name}`);
  return value;
}

barcodeRouter.get("/:code", async (req, res) => {
  const { code } = req.params;
  if (!code) return res.status(400).json({ error: "VALIDATION_ERROR", field: "code" });

  const baseUrl = requireEnv("BARCODE_API_BASE_URL").replace(/\/+$/, "");
  const apiKey = process.env.BARCODE_API_KEY;

  const url = new URL(`${baseUrl}/lookup`);
  url.searchParams.set("code", code);

  const data = await fetchJson<unknown>(url.toString(), {
    headers: {
      ...(apiKey ? { authorization: `Bearer ${apiKey}` } : {}),
    },
  });
  return res.json(data);
});


import { Router } from "express";
import { fetchJson } from "../lib/http";

export const externalRecipesRouter = Router();

function requireEnv(name: string): string {
  const value = process.env[name];
  if (!value) throw new Error(`Missing required env var: ${name}`);
  return value;
}

externalRecipesRouter.get("/search", async (req, res) => {
  const q = typeof req.query.q === "string" ? req.query.q : "";
  if (!q) return res.status(400).json({ error: "VALIDATION_ERROR", field: "q" });

  const baseUrl = requireEnv("RECIPES_API_BASE_URL").replace(/\/+$/, "");
  const apiKey = process.env.RECIPES_API_KEY;

  const url = new URL(`${baseUrl}/search`);
  url.searchParams.set("q", q);
  for (const [k, v] of Object.entries(req.query)) {
    if (k === "q") continue;
    if (typeof v === "string") url.searchParams.set(k, v);
  }

  const data = await fetchJson<unknown>(url.toString(), {
    headers: {
      ...(apiKey ? { authorization: `Bearer ${apiKey}` } : {}),
    },
  });
  return res.json(data);
});

externalRecipesRouter.get("/:id", async (req, res) => {
  const { id } = req.params;
  if (!id) return res.status(400).json({ error: "VALIDATION_ERROR", field: "id" });

  const baseUrl = requireEnv("RECIPES_API_BASE_URL").replace(/\/+$/, "");
  const apiKey = process.env.RECIPES_API_KEY;

  const url = `${baseUrl}/recipes/${encodeURIComponent(id)}`;
  const data = await fetchJson<unknown>(url, {
    headers: {
      ...(apiKey ? { authorization: `Bearer ${apiKey}` } : {}),
    },
  });
  return res.json(data);
});


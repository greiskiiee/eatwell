import type { CatalogIngredient } from "./ingredientCatalog";

const ANY_PREFIX = "any:";
const ANY_STORAGE_KEY = "eatwell_any_ingredients_v1";

type AnyStore = Record<string, string[]>;

function safeParse(raw: string | null): AnyStore {
  if (!raw) return {};
  try {
    return JSON.parse(raw) as AnyStore;
  } catch {
    return {};
  }
}

function loadStore(): AnyStore {
  if (typeof window === "undefined") return {};
  return safeParse(sessionStorage.getItem(ANY_STORAGE_KEY));
}

function saveStore(store: AnyStore) {
  sessionStorage.setItem(ANY_STORAGE_KEY, JSON.stringify(store));
}

export function makeAnyToken(word: string) {
  return `${ANY_PREFIX}${word.trim().toLowerCase()}`;
}

export function isAnyToken(value: string) {
  return value.trim().toLowerCase().startsWith(ANY_PREFIX);
}

export function anyTokenWord(token: string) {
  return token.trim().slice(ANY_PREFIX.length).trim().toLowerCase();
}

export function anyTokenLabel(token: string) {
  const w = anyTokenWord(token);
  if (!w) return token;
  return `${w.charAt(0).toUpperCase()}${w.slice(1)} (any)`;
}

export function setAnyExpansion(word: string, mealDbNames: string[]) {
  const w = word.trim().toLowerCase();
  if (!w) return;
  const store = loadStore();
  store[w] = [...new Set(mealDbNames.map((s) => s.trim()).filter(Boolean))];
  saveStore(store);
}

export function getAnyExpansion(word: string): string[] {
  const store = loadStore();
  return store[word.trim().toLowerCase()] ?? [];
}

export function expandAnySelected(selected: string[]): string[] {
  const expanded: string[] = [];
  for (const s of selected) {
    if (!isAnyToken(s)) {
      expanded.push(s);
      continue;
    }
    const word = anyTokenWord(s);
    const list = getAnyExpansion(word);
    if (list.length > 0) expanded.push(...list);
    else {
      // Fallback: search by the base word (MealDB sometimes supports it)
      expanded.push(word.charAt(0).toUpperCase() + word.slice(1));
    }
  }
  return [...new Set(expanded.map((x) => x.trim()).filter(Boolean))];
}

/** Convert selected ingredients into AND-groups. Each group is OR within it. */
export function selectedToIngredientGroups(selected: string[]): string[][] {
  const groups: string[][] = [];
  for (const s of selected) {
    if (!isAnyToken(s)) {
      const name = s.trim();
      if (name) groups.push([name]);
      continue;
    }
    const word = anyTokenWord(s);
    const list = getAnyExpansion(word);
    if (list.length > 0) groups.push(list);
    else {
      const fallback = word
        ? word.charAt(0).toUpperCase() + word.slice(1)
        : "";
      if (fallback) groups.push([fallback]);
    }
  }
  // de-dupe within group
  return groups.map((g) => [...new Set(g.map((x) => x.trim()).filter(Boolean))]);
}

export function normalizeForSystemIngredients(selected: string[]): string[] {
  // Backend system recipes filter is a regex match against recipe.ingredients strings.
  // For "any:" tokens, pass just the base word (e.g. "beef") so it still matches.
  return selected
    .map((s) => (isAnyToken(s) ? anyTokenWord(s) : s))
    .map((s) => s.trim())
    .filter(Boolean);
}

function searchTermsForSystemGroup(group: string[]): string[] {
  const terms = new Set<string>();
  for (const raw of group) {
    const name = raw.trim();
    if (!name) continue;
    const lower = name.toLowerCase();
    terms.add(lower);
    const words = lower.split(/[\s,-]+/).filter((w) => w.length >= 2);
    for (const w of words) terms.add(w);
    if (words.length >= 2) {
      terms.add(words.slice(-2).join(" "));
      terms.add(words.slice(0, 2).join(" "));
    }
  }
  return [...terms];
}

/** AND across groups, OR within each group — for Eatwell+ recipe search. */
export function systemGroupsForSelected(selected: string[]): string[][] {
  return selectedToIngredientGroups(selected).map((group) =>
    searchTermsForSystemGroup(group),
  );
}

export function buildAnyCandidates(
  query: string,
  catalog: CatalogIngredient[],
  limit = 25,
) {
  const q = query.trim().toLowerCase();
  if (q.length < 3) return { word: q, matches: [] as CatalogIngredient[] };

  const matches = catalog
    .filter((i) => i.mealDbKey.includes(q) || i.mealDbName.toLowerCase().includes(q))
    .slice(0, limit);

  return { word: q, matches };
}


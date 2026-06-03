export type IngredientGroupId =
  | "meat"
  | "seafood"
  | "vegetables"
  | "fruits"
  | "dairy"
  | "grains"
  | "legumes"
  | "spices"
  | "baking"
  | "other";

export interface IngredientGroup {
  id: IngredientGroupId;
  label: string;
}

export const INGREDIENT_GROUPS: IngredientGroup[] = [
  { id: "meat", label: "Мах, тахиа" },
  { id: "seafood", label: "Далайн хоол" },
  { id: "vegetables", label: "Хүнсний ногоо" },
  { id: "fruits", label: "Жимс" },
  { id: "dairy", label: "Сүү, сүүн бүтээгдэхүүн" },
  { id: "grains", label: "Үр тариа, гоймон" },
  { id: "legumes", label: "Бууцай, самар" },
  { id: "spices", label: "Амтлагч" },
  { id: "baking", label: "Жигнэмэг, чихэр" },
  { id: "other", label: "Бусад" },
];

const RULES: { group: IngredientGroupId; keywords: string[] }[] = [
  {
    group: "meat",
    keywords: [
      "chicken",
      "beef",
      "pork",
      "lamb",
      "mutton",
      "duck",
      "turkey",
      "bacon",
      "ham",
      "sausage",
      "mince",
      "steak",
      "veal",
      "venison",
      "goose",
      "prosciutto",
      "chorizo",
      "salami",
      "meat",
      "liver",
      "kidney",
      "brisket",
    ],
  },
  {
    group: "seafood",
    keywords: [
      "salmon",
      "tuna",
      "cod",
      "prawn",
      "shrimp",
      "crab",
      "lobster",
      "fish",
      "anchovy",
      "sardine",
      "mussel",
      "clam",
      "oyster",
      "squid",
      "octopus",
      "haddock",
      "trout",
      "seafood",
      "crayfish",
      "scallop",
    ],
  },
  {
    group: "vegetables",
    keywords: [
      "onion",
      "garlic",
      "tomato",
      "potato",
      "carrot",
      "pepper",
      "cabbage",
      "broccoli",
      "spinach",
      "celery",
      "cucumber",
      "lettuce",
      "mushroom",
      "zucchini",
      "courgette",
      "aubergine",
      "eggplant",
      "cauliflower",
      "kale",
      "leek",
      "shallot",
      "beet",
      "radish",
      "corn",
      "pea",
      "bean sprout",
      "asparagus",
      "artichoke",
      "fennel",
      "parsnip",
      "turnip",
      "sweet potato",
      "butternut",
      "pumpkin",
      "squash",
      "chard",
      "okra",
      "ginger root",
    ],
  },
  {
    group: "fruits",
    keywords: [
      "apple",
      "banana",
      "orange",
      "lemon",
      "lime",
      "berry",
      "strawberry",
      "blueberry",
      "raspberry",
      "mango",
      "pineapple",
      "peach",
      "pear",
      "grape",
      "cherry",
      "plum",
      "apricot",
      "melon",
      "watermelon",
      "fig",
      "date",
      "raisin",
      "sultana",
      "currant",
      "coconut",
      "avocado",
      "passion fruit",
      "pomegranate",
      "kiwi",
      "fruit",
    ],
  },
  {
    group: "dairy",
    keywords: [
      "milk",
      "cream",
      "butter",
      "cheese",
      "yogurt",
      "yoghurt",
      "egg",
      "cheddar",
      "mozzarella",
      "parmesan",
      "feta",
      "ricotta",
      "mascarpone",
      "brie",
      "gouda",
      "paneer",
      "buttermilk",
      "custard",
    ],
  },
  {
    group: "grains",
    keywords: [
      "rice",
      "pasta",
      "noodle",
      "flour",
      "bread",
      "oat",
      "barley",
      "quinoa",
      "couscous",
      "bulgur",
      "semolina",
      "macaroni",
      "spaghetti",
      "tortilla",
      "breadcrumb",
      "polenta",
      "grain",
      "wheat",
      "cornmeal",
      "noodles",
    ],
  },
  {
    group: "legumes",
    keywords: [
      "lentil",
      "chickpea",
      "kidney bean",
      "black bean",
      "butter bean",
      "cannellini",
      "haricot",
      "bean",
      "peanut",
      "almond",
      "walnut",
      "cashew",
      "pecan",
      "hazelnut",
      "pistachio",
      "pine nut",
      "nut",
      "tofu",
      "tempeh",
    ],
  },
  {
    group: "spices",
    keywords: [
      "salt",
      "pepper",
      "cumin",
      "paprika",
      "cinnamon",
      "nutmeg",
      "oregano",
      "basil",
      "thyme",
      "rosemary",
      "parsley",
      "coriander",
      "cilantro",
      "turmeric",
      "chilli",
      "chili",
      "cayenne",
      "curry",
      "garam masala",
      "cardamom",
      "clove",
      "bay",
      "saffron",
      "vanilla",
      "spice",
      "herb",
      "dill",
      "mint",
      "sage",
      "tarragon",
      "mustard seed",
      "fenugreek",
    ],
  },
  {
    group: "baking",
    keywords: [
      "sugar",
      "honey",
      "syrup",
      "chocolate",
      "cocoa",
      "baking powder",
      "baking soda",
      "yeast",
      "icing",
      "frosting",
      "jam",
      "marmalade",
      "gelatin",
      "molasses",
      "treacle",
      "caster",
      "icing sugar",
    ],
  },
];

export function categorizeIngredient(name: string): IngredientGroupId {
  const lower = name.toLowerCase();
  for (const { group, keywords } of RULES) {
    if (keywords.some((kw) => lower.includes(kw))) return group;
  }
  return "other";
}

export function dedupeIngredientNames(names: string[]): string[] {
  const seen = new Set<string>();
  const out: string[] = [];
  for (const name of names) {
    const key = name.trim().toLowerCase();
    if (!key || seen.has(key)) continue;
    seen.add(key);
    out.push(name.trim());
  }
  return out;
}

export function dedupeByName<T extends { strIngredient: string }>(
  items: T[],
): T[] {
  const seen = new Set<string>();
  const out: T[] = [];
  for (const item of items) {
    const key = item.strIngredient.trim().toLowerCase();
    if (!key || seen.has(key)) continue;
    seen.add(key);
    out.push(item);
  }
  return out;
}

export type CatalogPickerItem = {
  mealDbKey: string;
  mealDbName: string;
  nameMn: string;
  thumb: string;
};

export function groupCatalogItems(
  items: CatalogPickerItem[],
): { group: IngredientGroup; items: CatalogPickerItem[] }[] {
  const buckets = new Map<IngredientGroupId, CatalogPickerItem[]>();
  for (const item of items) {
    const id = categorizeIngredient(item.mealDbName);
    if (!buckets.has(id)) buckets.set(id, []);
    buckets.get(id)!.push(item);
  }

  return INGREDIENT_GROUPS.map((group) => ({
    group,
    items: (buckets.get(group.id) ?? []).sort((a, b) =>
      a.nameMn.localeCompare(b.nameMn, "mn"),
    ),
  })).filter((g) => g.items.length > 0);
}

export function groupIngredients<T extends { strIngredient: string }>(
  items: T[],
): { group: IngredientGroup; items: T[] }[] {
  const buckets = new Map<IngredientGroupId, T[]>();
  for (const item of items) {
    const id = categorizeIngredient(item.strIngredient);
    if (!buckets.has(id)) buckets.set(id, []);
    buckets.get(id)!.push(item);
  }

  return INGREDIENT_GROUPS.map((group) => ({
    group,
    items: (buckets.get(group.id) ?? []).sort((a, b) =>
      a.strIngredient.localeCompare(b.strIngredient),
    ),
  })).filter((g) => g.items.length > 0);
}

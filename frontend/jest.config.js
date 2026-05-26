/** @type {import('jest').Config} */
module.exports = {
  preset: "ts-jest",
  testEnvironment: "jsdom",
  setupFilesAfterEnv: ["<rootDir>/jest.setup.ts"],
  testMatch: ["**/__tests__/**/*.test.ts", "**/__tests__/**/*.test.tsx"],
  moduleNameMapper: {
    "^@/(.*)$": "<rootDir>/src/$1",
  },
  collectCoverageFrom: [
    "src/lib/api.ts",
    "src/lib/admin.ts",
    "src/lib/auth.ts",
    "src/lib/ingredients.ts",
    "src/lib/ingredientCatalog.ts",
    "src/lib/ingredientGroups.ts",
    "src/lib/purchases.ts",
    "src/lib/allergens.ts",
    "src/lib/recipeForm.ts",
    "src/components/AllergenWarningBadge.tsx",
    "src/components/AllergenAlertBanner.tsx",
    "src/components/UserAvatar.tsx",
    "src/components/LoginRequiredModal.tsx",
    "src/components/admin/StatCard.tsx",
  ],
  coverageThreshold: {
    global: {
      statements: 80,
      branches: 80,
      functions: 80,
      lines: 80,
    },
  },
};

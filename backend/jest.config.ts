export default {
  preset: "ts-jest",
  testEnvironment: "node",
  testMatch: ["**/__tests__/**/*.ts"],
  collectCoverageFrom: [
    "src/lib/ingredientGroup.ts",
    "src/lib/mealdbIngredients.ts",
    "src/lib/passwordReset.ts",
    "src/lib/userResponse.ts",
    "src/middleware/auth.ts",
    "src/routes/ingredients.ts",
    "src/models/IngredientCatalog.ts",
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

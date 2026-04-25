const typescript = require("@typescript-eslint/eslint-plugin");
const parser = require("@typescript-eslint/parser");

module.exports = [
  {
    files: ["src/**/*.ts"],
    languageOptions: {
      parser: parser,
    },
    plugins: {
      "@typescript-eslint": typescript,
    },
    rules: {
      ...typescript.configs.recommended.rules,
    },
  },
];

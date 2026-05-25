export default {
  preset: "ts-jest",
  testEnvironment: "node",
  testMatch: ["**/__tests__/integration/**/*.integration.test.ts"],
  testTimeout: 30_000,
  maxWorkers: 1,
};

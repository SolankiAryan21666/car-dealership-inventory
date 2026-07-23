module.exports = {
  preset: "ts-jest",
  testEnvironment: "node",
  testMatch: ["**/tests/**/*.test.ts"],
  verbose: true,
  clearMocks: true,
  collectCoverageFrom: [
    "src/**/*.ts",
    "!src/app.ts",
    "!src/config/**",
  ],
};

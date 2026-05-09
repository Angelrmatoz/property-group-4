import type { Config } from "jest";

const config: Config = {
  preset: "ts-jest",
  testEnvironment: "node",
  roots: ["<rootDir>/src"],
  testMatch: ["**/__tests__/**/*.test.ts"],
  moduleNameMapper: {
    "^@/(.*)$": "<rootDir>/src/$1",
    "^@$": "<rootDir>/src",
  },
  setupFiles: ["<rootDir>/src/__tests__/setup.ts"],
  clearMocks: true,
  resetMocks: false,
  testPathIgnorePatterns: ["/node_modules/", "/dist/"],
};

export default config;

import type { Config } from "jest";

const config: Config = {
  preset: "ts-jest",
  testEnvironment: "node",
  roots: ["<rootDir>"],
  testMatch: ["**/*.test.ts"],
  moduleNameMapper: {
    "^@/(.*)$": "<rootDir>/src/$1",
    "^@$": "<rootDir>/src",
  },
  setupFiles: ["<rootDir>/tests/setup.ts"],
  clearMocks: true,
  resetMocks: false,
  testPathIgnorePatterns: ["/node_modules/", "/dist/"],
};

export default config;

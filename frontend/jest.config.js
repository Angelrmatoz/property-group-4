/** @type {import('jest').Config} */
const config = {
  preset: "ts-jest",
  testEnvironment: "jest-environment-jsdom",
  roots: ["<rootDir>"],
  testMatch: [
    "**/*.test.ts",
    "**/*.test.tsx"
  ],
  moduleNameMapper: {
    "^@/(.*)$": "<rootDir>/$1",
    "\\.(css|less|scss|sass)$": "identity-obj-proxy",
    "\\.(jpg|jpeg|png|gif|webp|svg)$": "<rootDir>/tests/mocks/fileMock.js",
  },
  setupFilesAfterEnv: ["<rootDir>/tests/setup.ts"],
  transform: {
    "^.+\\.(ts|tsx)$": [
      "ts-jest",
      {
        tsconfig: "tsconfig.json",
      },
    ],
  },
  transformIgnorePatterns: [
    "node_modules/(?!(lucide-react|recharts|embla-carousel-react|@hookform)/)",
  ],
  testPathIgnorePatterns: ["/node_modules/", "/.next/", "/e2e/"],
  clearMocks: true,
  resetMocks: false,
};

module.exports = config;

// Jest config for NestJS projects (ts-jest preset)
/** @type {import('jest').Config} */
export default {
  preset: "ts-jest",
  testEnvironment: "node",
  // Match *.spec.ts files anywhere under src/
  testRegex: ".spec.ts$",
  // Collect coverage from all source files (exclude test files themselves)
  collectCoverageFrom: ["src/**/*.(t|j)s", "!src/**/*.spec.(t|j)s"],
  coverageDirectory: "coverage",
  // Enforce minimum coverage thresholds — adjust per project
  coverageThreshold: {
    global: {
      branches: 70,
      functions: 80,
      lines: 80,
      statements: 80,
    },
  },
  // Map path aliases that NestJS projects often configure in tsconfig.json
  // e.g. moduleNameMapper: { '^@app/(.*)$': '<rootDir>/src/$1' }
  moduleFileExtensions: ["js", "json", "ts"],
  transform: {
    "^.+\\.(t|j)s$": "ts-jest",
  },
};

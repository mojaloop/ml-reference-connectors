/** @type {import('jest').Config} */
module.exports = {
    preset: 'ts-jest',                     // Use ts-jest preset for TypeScript
    testEnvironment: 'node',               // Simulate Node.js environment
    roots: ['<rootDir>/test'],              // Your test files live in "test/"
    moduleFileExtensions: ['ts', 'js', 'json', 'node'],
    transform: {
      '^.+\\.ts$': 'ts-jest',               // Transform .ts files using ts-jest
    },
    testRegex: '(/__tests__/.*|(\\.|/)(test|spec))\\.ts$', // Run *.test.ts and *.spec.ts
    globals: {
      'ts-jest': {
        tsconfig: 'tsconfig.json',          // Point to your tsconfig.json
      },
    },
    moduleNameMapper: {
      '^src/(.*)$': '<rootDir>/src/$1',     // Allow clean imports like src/xyz
      '^test/(.*)$': '<rootDir>/test/$1'
    },
    coverageDirectory: 'coverage',          // Output coverage reports here
    collectCoverageFrom: [
      "src/**/*.{ts,js}",
      "!src/**/*.d.ts"
    ]
  };
  
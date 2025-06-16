module.exports = {
    preset: 'ts-jest',
    testEnvironment: 'node',
    clearMocks: true,
    verbose: true,
    moduleNameMapper: {
        '^src/(.*)$': '<rootDir>/src/$1',
        '^test/(.*)$': '<rootDir>/test/$1',
    },
    transform: {
        '^.+\\.[tj]s$': ['ts-jest', { tsconfig: '<rootDir>/tsconfig.test.json' }],
    },
    testPathIgnorePatterns: ['/examples/'],
    coveragePathIgnorePatterns: ['dist'],
    coverageReporters: ['text', ['json', { file: 'integration-final.json' }]],
    coverageDirectory: './coverage/',
    coverageThreshold: {
        "global": {
            "branches": 90,
            "functions": 90,
            "lines": 90,
            "statements": -10
        }
    }
};

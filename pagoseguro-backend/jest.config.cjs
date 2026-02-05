module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  roots: ['<rootDir>/tests/jest'],
  testMatch: [
    '**/tests/jest/**/*.test.ts',
    '**/tests/jest/**/*.test.tsx'
  ],
  testPathIgnorePatterns: [
    '/node_modules/',
    '/tests/k6/',
    '/dist/'
  ],
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json'],
  transform: {
    '^.+\\.tsx?$': ['ts-jest', { tsconfig: 'tsconfig.json' }]
  },
  collectCoverageFrom: [
    'src/**/*.{ts,tsx}',
    '!src/**/*.d.ts',
    '!src/**/*.interface.ts'
  ],
  coverageDirectory: 'coverage',
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1'
  }
};

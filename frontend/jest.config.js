/** @type {import('jest').Config} */
export default {
  testEnvironment: 'jsdom',
  transform: {
    '^.+\\.(ts|tsx|js|jsx)$': 'babel-jest',
  },
  moduleNameMapper: {
    '\\.(css|less|scss|sass)$': 'identity-obj-proxy',
    '^lucide-react$': '<rootDir>/src/__tests__/__mocks__/lucide-react.tsx',
  },
  transformIgnorePatterns: [],
  testMatch: ['**/__tests__/**/*.test.{ts,tsx}'],
}

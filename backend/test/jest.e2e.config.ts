import type { Config } from 'jest';

const config: Config = {
  verbose: true,
  moduleFileExtensions: ['js', 'json', 'ts'],
  rootDir: '.',
  testEnvironment: 'node',
  testRegex: 'e2e.spec.ts$',
  transform: {
    '^.+\\.(t|j)s$': 'ts-jest',
  },
  setupFiles: ['./jest.setup.ts'],
};

export default config;

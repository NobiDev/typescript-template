import type { Config } from '@jest/types';
import { existsSync, readFileSync } from 'fs-extra';
import { get } from 'lodash';
import { join, resolve } from 'path';
import { pathsToModuleNameMapper } from 'ts-jest/utils';
import type { CompilerOptions } from 'typescript';
import { readConfigFile } from 'typescript';

const result = readConfigFile('./tsconfig.json', (p) => readFileSync(p).toString());

const compilerOptions = get(result.config, 'compilerOptions') as CompilerOptions;

const jestConfig: Config.InitialOptions = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  setupFiles: [] as string[],
  testMatch: ['<rootDir>/src/**/*.(spec|test).ts', '<rootDir>/tests/**/*.tests.ts'],
  moduleNameMapper: pathsToModuleNameMapper(compilerOptions.paths ?? {}, { prefix: '<rootDir>/' }),
  modulePathIgnorePatterns: ['<rootDir>/dist/', '/node_modules/'],
};

for (const entry of ['index.ts', 'loader.ts'].reverse()) {
  const path = resolve(join('src', entry));
  if (existsSync(path)) {
    jestConfig.setupFiles?.push(path);
  }
}

// noinspection JSUnusedGlobalSymbols
export default jestConfig;

import { config } from 'dotenv';
import ForkTsCheckerWebpackPlugin from 'fork-ts-checker-webpack-plugin';
import { existsSync } from 'fs';
import { mkdirpSync, writeJsonSync } from 'fs-extra';
import glob from 'glob';
import { keys, set } from 'lodash';
import { dirname, join, relative } from 'path';
import TsconfigPathsPlugin from 'tsconfig-paths-webpack-plugin';
import type { Configuration } from 'webpack';
import { EnvironmentPlugin } from 'webpack';

export interface TypeScriptConfig {
  extends: string;
  compilerOptions: {
    noEmit?: boolean;
    declaration?: boolean;
    declarationMap?: boolean;
    declarationDir?: string | null;
    composite?: boolean;
  };
}

// noinspection JSUnusedGlobalSymbols
enum NodeEnvironment {
  Development = 'development',
  Production = 'production',
}

interface BuildConfiguration {
  nodeEnv?: NodeEnvironment;
  env: Record<string, string>;
}

config();
const basePath = dirname(__filename);
const TSCONFIG_NAME = 'tsconfig.json';

const buildWebpackConfiguration = (_: never, buildConfig: BuildConfiguration): Configuration => {
  const isProduction = !buildConfig.nodeEnv || buildConfig.nodeEnv === NodeEnvironment.Production;
  const sourcePath = join(basePath, 'src');
  const outputPath = join(basePath, 'dist');
  const tsConfigPath = join(outputPath, TSCONFIG_NAME);

  if (!existsSync(tsConfigPath)) {
    mkdirpSync(dirname(tsConfigPath));
    const tsConfig: TypeScriptConfig = {
      extends: join(relative(dirname(tsConfigPath), basePath), TSCONFIG_NAME),
      compilerOptions: {
        noEmit: false,
      },
    };
    if (isProduction) {
      tsConfig.compilerOptions = {
        ...tsConfig.compilerOptions,
        declaration: false,
        declarationMap: false,
        declarationDir: null,
        composite: false,
      };
    }
    writeJsonSync(tsConfigPath, tsConfig);
  }

  // noinspection JSUnusedGlobalSymbols
  const configuration: Configuration = {
    mode: isProduction ? 'production' : 'development',
    target: ['node', 'es2017'],
    entry: glob.sync(`${sourcePath}/**/?(*.)main.ts`),
    externals: ({ context, request, dependencyType }, callback): void => {
      if (context && request && dependencyType) {
        try {
          const result = require.resolve(request);
          if (/\/node_modules\//.test(context) || /\/node_modules\//.test(result)) {
            switch (dependencyType) {
              case 'esm':
              case 'commonjs':
                return callback(undefined, `commonjs ${request}`);
            }
          }
        } catch (ignored) {
          return callback();
        }
      }
      return callback();
    },
    output: {
      path: outputPath,
      clean: true,
    },
    module: {
      rules: [
        {
          test: /\.tsx?$/,
          loader: 'ts-loader',
          options: {
            configFile: tsConfigPath,
          },
          exclude: /node_modules/,
        },
      ],
    },
    resolve: {
      extensions: ['.ts', '.js'],
      plugins: [
        new TsconfigPathsPlugin({
          configFile: tsConfigPath,
        }),
      ],
    },
    optimization: {
      minimize: true,
      runtimeChunk: 'multiple',
      splitChunks: {
        cacheGroups: {
          vendor: {
            test: /[\\/]node_modules[\\/]/,
            name: 'vendors',
            chunks: 'async',
          },
        },
      },
    },
    plugins: [
      new EnvironmentPlugin(keys(process.env)),
      new ForkTsCheckerWebpackPlugin({
        async: true,
        typescript: {
          enabled: true,
        },
        eslint: {
          files: ['src', 'tests'],
          enabled: true,
        },
      }),
    ],
  };

  for (const entry of ['index.ts', 'loader.ts'].reverse()) {
    const path = join(sourcePath, entry);
    if (existsSync(path)) {
      (configuration.entry as string[]).unshift(path);
    }
  }
  if (buildConfig.nodeEnv) {
    const nodeEnv = Object.values(NodeEnvironment).find((x) => x.toLowerCase() === buildConfig.nodeEnv);
    set(configuration, 'mode', nodeEnv);
  }

  if (!isProduction) {
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    configuration.optimization!.minimize = false;
    configuration.devtool = 'source-map';
    configuration.profile = true;
    configuration.cache = {
      type: 'filesystem',
      allowCollectingMemory: true,
      cacheDirectory: join(outputPath, '.cache'),
    };
  }

  return configuration;
};

// noinspection JSUnusedGlobalSymbols
export default buildWebpackConfiguration;

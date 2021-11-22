import svelte from 'rollup-plugin-svelte';
import commonjs from '@rollup/plugin-commonjs';
import replace from '@rollup/plugin-replace';
import babel from '@rollup/plugin-babel';
import resolve from '@rollup/plugin-node-resolve';
import typescript from '@rollup/plugin-typescript';
import livereload from 'rollup-plugin-livereload';
import { terser } from 'rollup-plugin-terser';
import sveltePreprocess from 'svelte-preprocess';
import css from 'rollup-plugin-css-only';
import childProcess from 'child_process';

import dotenv from 'dotenv';
import path from 'path';

const ENTRY_POINTS = {
  // -> Add entry points bundles
  MAIN: 'main',
};

const configEnv = {
  path: path.join(path.dirname(__filename), './.env'),
};
dotenv.config(configEnv);

const production = !process.env.ROLLUP_WATCH;
const APP_NAME = process.env.APP_NAME;

// Validate what type of process to run
const validateApps = () => {
  if (APP_NAME === 'ALL') {
    return Object.keys(ENTRY_POINTS);
  }
  if (!ENTRY_POINTS[APP_NAME]) {
    throw new Error('Invalid app name');
  }
  return [APP_NAME];
};

// Manage server with sirv-cli
const serve = (appName) => {
  let server;
  const toExit = () => {
    if (server) server.kill(0);
  };
  return {
    writeBundle() {
      if (server) return;
      server = childProcess.spawn(
        'npm',
        ['run', 'start', `public/${ENTRY_POINTS[appName]}`, '--', '--dev'],
        {
          stdio: ['ignore', 'inherit', 'inherit'],
          shell: true,
        }
      );

      process.on('SIGTERM', toExit);
      process.on('exit', toExit);
    },
  };
};

// Manage configuracion
const getConfigurationRollup = (appName) => ({
  input: `src/${ENTRY_POINTS[appName]}.ts`,
  output: {
    sourcemap: true,
    format: 'iife',
    name: ENTRY_POINTS[appName],
    file: `public/${ENTRY_POINTS[appName]}/build/bundle.js`,
  },
  plugins: [
    replace({
      preventAssignment: true,
      API_KEY: process.env.API_KEY,
    }),
    svelte({
      preprocess: sveltePreprocess({ sourceMap: !production }),
      compilerOptions: {
        // enable run-time checks when not in production
        dev: !production,
        // customElement: true // -> Create web components
      },
    }),

    // we'll extract any component CSS out into
    // a separate file - better for performance
    css({ output: `bundle.css` }),

    // If you have external dependencies installed from
    // npm, you'll most likely need these plugins. In
    // some cases you'll need additional configuration -
    // consult the documentation for details:
    // https://github.com/rollup/plugins/tree/master/packages/commonjs
    resolve({
      browser: true,
      dedupe: ['svelte'],
    }),
    commonjs(),
    babel({
      extensions: ['.js', '.mjs', '.html', '.svelte'],
      exclude: ['node_modules/@babel/**'],
      babelHelpers: 'bundled',
    }),
    typescript({
      sourceMap: !production,
      inlineSources: !production,
    }),

    // In dev mode, call `npm run start` once
    // the bundle has been generated
    !production && serve(appName),

    // Watch the `public` directory and refresh the
    // browser on changes when not in production
    !production && livereload(`public/${ENTRY_POINTS[appName]}`),

    // If we're building for production (npm run build
    // instead of npm run dev), minify
    production && terser(),
  ],
  watch: {
    clearScreen: false,
  },
});

export default validateApps().map((appsName) =>
  getConfigurationRollup(appsName)
);

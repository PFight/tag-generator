const includePaths = require('rollup-plugin-includepaths');
const { nodeResolve } = require('@rollup/plugin-node-resolve');
const { terser } = require("rollup-plugin-terser");
const replace = require('rollup-plugin-replace');
const typescript = require('rollup-plugin-typescript');
const sourceMaps = require('rollup-plugin-sourcemaps');
const conditional = require("rollup-plugin-conditional");
const autoprefixer = require('autoprefixer');
const postcss = require('rollup-plugin-postcss');
const builtins = require('rollup-plugin-node-builtins');
const commonjs = require("@rollup/plugin-commonjs");

const PROD = process.env.NODE_ENV === 'production';

var config = {
	input: "./src/main.ts",
	plugins: [
		postcss({
			plugins: [ 
				autoprefixer(),
			],
			extract: true,
			minimize: PROD
		}),
		typescript(), // Разкомментировать, если хочешь работать без compile on save (плюс поменять MAIN_BUNDLE_ENTRY расширение на ts)
		// sourceMaps(), // Разкомментировать, если хочешь source maps на typescript
		includePaths({
			include: {},
			paths: ['src'],
			external: [],
			extensions: ['.ts', '.tsx']
		}),
		nodeResolve({ preferBuiltins: true }),
		builtins(),
        commonjs(),
		replace({ 'process.env.NODE_ENV': `'${process.env.NODE_ENV}'` })
	],
	output: {
		name: 'app',
		file: './docs/app.js',
		format: 'iife',
		interop: true,
		sourcemap: true
	},
	treeshake: true
};

if (PROD) {
	config.plugins.push(
		terser()
	);
}

module.exports = config;
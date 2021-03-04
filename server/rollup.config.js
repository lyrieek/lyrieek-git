import typescript from '@rollup/plugin-typescript'
import commonjs from '@rollup/plugin-commonjs';
import { nodeResolve } from '@rollup/plugin-node-resolve';
import json from '@rollup/plugin-json'


export default {
	input: 'index.ts',
	output: {
		file: '../dist/index.js',
		format: 'cjs'
	},
	plugins: [nodeResolve({ preferBuiltins: true }), commonjs(), typescript(), json()]
}

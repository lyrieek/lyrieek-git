import typescript from '@rollup/plugin-typescript'
import commonjs from '@rollup/plugin-commonjs';
import { nodeResolve } from '@rollup/plugin-node-resolve';
import json from '@rollup/plugin-json'
import shebang from 'rollup-plugin-add-shebang';

const _outputFile = '../dist/index.js'

export default {
	input: 'index.ts',
	output: {
		file: _outputFile,
		format: 'cjs'
	},
	plugins: [nodeResolve({ preferBuiltins: true }), commonjs(), shebang({include: _outputFile}), typescript(), json()]
}

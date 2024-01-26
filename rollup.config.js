import resolve from '@rollup/plugin-node-resolve'
import terser from '@rollup/plugin-terser'
import wasm from '@rollup/plugin-wasm'
import serve from 'rollup-plugin-serve'
import livereload from 'rollup-plugin-livereload'

const isProd = process.env.BUILD === 'prod'

export default {
    input: 'src/index.js',
    output: [
        {
            file: 'dist/xert.js',
            format: 'umd',
            name: 'Xert',
            globals: {
                'three': 'THREE',
                'three/addons/utils/BufferGeometryUtils.js': 'BufferGeometryUtils'
            }
        },
        {
            file: 'dist/xert.module.js',
            format: 'esm'
        }
    ],
    external: [/node_modules/],
    plugins: [
        resolve(),
        wasm({fileName:'[name][extname]'}),
        isProd && terser(),
        ! isProd && serve({port:8000}),
        ! isProd && livereload({port:9000})
    ]
}
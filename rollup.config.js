import typescript from 'rollup-plugin-typescript2';

export default {
    input: 'src/index.ts',
    output: {
        format: 'umd',
        name: 'test',
        file: 'dist/audentia.umd.js',
    },
    plugins: [
        typescript(),
    ],
};

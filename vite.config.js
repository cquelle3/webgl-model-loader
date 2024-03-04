export default{
    base: '/webgl-model-loader/',
    esbuild: {
        supported: {
            'top-level-await': true
        },
    },
    build: {
        outDir: './docs',
    }
};
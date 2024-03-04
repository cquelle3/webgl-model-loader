export default{
    esbuild: {
        supported: {
            'top-level-await': true
        },
    },
    build: {
        outDir: './docs',
        base: '/<REPO>/'
    }
};
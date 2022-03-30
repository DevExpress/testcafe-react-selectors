module.exports = {
    webpack (cfg) {
        cfg.optimization = {
            minimize: false
        };

        return cfg;
    },

    staticMarkup: true,
    dev:          true,

    eslint: {
        ignoreDuringBuilds: true
    }
};

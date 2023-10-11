module.exports = {
    webpack (cfg) {
        cfg.optimization = {
            minimize: false
        };

        return cfg;
    },

    eslint: {
        ignoreDuringBuilds: true
    }
};

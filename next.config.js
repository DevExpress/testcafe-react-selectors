module.exports = {
    webpack (cfg) {
        cfg.mode         = 'development';
        cfg.optimization = {
            minimize: false
        };

        return cfg;
    },

    staticMarkup: true,
    dev:          true
};

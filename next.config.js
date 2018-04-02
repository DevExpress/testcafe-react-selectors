module.exports = {
    webpack (cfg) {
        cfg.plugins = cfg.plugins.filter((plugin) => {
            return plugin.constructor.name !== 'UglifyJsPlugin';
        });

        return cfg;
    },

    staticMarkup: true
};

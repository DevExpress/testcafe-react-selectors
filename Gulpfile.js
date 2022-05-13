const createTestCafe   = require('testcafe');
const del              = require('del');
const eslint           = require('gulp-eslint-new');
const fs               = require('fs');
const glob             = require('glob');
const gulp             = require('gulp');
const mustache         = require('gulp-mustache');
const pathJoin         = require('path').join;
const rename           = require('gulp-rename');
const startTestServer  = require('./test/server');
const { promisify }    = require('util');
const nextBuild        = require('next/dist/build').default;
const { createServer } = require('vite');
const legacy           = require('@vitejs/plugin-legacy');

const listFiles   = promisify(glob);
const deleteFiles = promisify(del);

let devServer   = null;

gulp.task('clean', () => {
    return deleteFiles([
        'lib',
        'test/data/lib'
    ]);
});

gulp.task('lint', () => {
    return gulp
        .src([
            'src/**/*.js',
            'test/**/*.js',
            '!test/data/**',
            'Gulpfile.js'
        ])
        .pipe(eslint())
        .pipe(eslint.format())
        .pipe(eslint.failAfterError());
});

gulp.task('build-selectors-script', () => {
    function loadModule (modulePath) {
        return fs.readFileSync(modulePath).toString();
    }

    return gulp.src('./src/index.js.mustache')
        .pipe(mustache({
            getRootElsReact15:     loadModule('./src/react-15/get-root-els.js'),
            getRootElsReact16to18: loadModule('./src/react-16-18/get-root-els.js'),

            selectorReact15:     loadModule('./src/react-15/index.js'),
            selectorReact16to18: loadModule('./src/react-16-18/index.js'),

            react15Utils:     loadModule('./src/react-15/react-utils.js'),
            react16to18Utils: loadModule('./src/react-16-18/react-utils.js'),

            waitForReact: loadModule('./src/wait-for-react.js')
        }))
        .pipe(rename('index.js'))
        .pipe(gulp.dest('lib'));
});

gulp.task('clean-build-tmp-resources', () => {
    return deleteFiles(['lib/tmp']);
});

gulp.task('build-nextjs-app', () => {
    const appPath = pathJoin(__dirname, './test/data/server-render');

    return nextBuild(appPath, require('./next.config.js'));
});

gulp.task('build', gulp.series('clean', 'lint', 'build-selectors-script', 'clean-build-tmp-resources'));

gulp.task('start-dev-server', async () => {
    const src = 'test/data/app';

    devServer = await createServer({
        configFile: false,
        root:       src,

        server: {
            port: 3000
        }
    });

    await devServer.listen();
});


gulp.task('run-tests', async cb => {
    const files = await listFiles('test/fixtures/**/*.{js,ts}');

    await startTestServer();

    const testCafe = await createTestCafe('localhost', 1337, 1338);

    await testCafe.createRunner()
        .src(files)
        .browsers(['chrome', 'firefox', 'edge'])
        .reporter('list')
        .run({ quarantineMode: true, debugOnFail: false })
        .then(failed => {
            devServer.close();

            cb();
            process.exit(failed);
        });
});

gulp.task('test', gulp.series('build', 'start-dev-server', 'build-nextjs-app', 'run-tests'));

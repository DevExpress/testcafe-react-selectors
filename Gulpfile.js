const babel           = require('gulp-babel');
const createTestCafe  = require('testcafe');
const del             = require('del');
const eslint          = require('gulp-eslint');
const fs              = require('fs');
const glob            = require('glob');
const gulp            = require('gulp');
const mustache        = require('gulp-mustache');
const pathJoin        = require('path').join;
const rename          = require('gulp-rename');
const startTestServer = require('./test/server');
const nextBuild       = require('next/dist/build').default;
const gulpStep        = require('gulp-step');

gulpStep.install();

gulp.task('lint', () => {
    return gulp
        .src([
            'src/**/*.js',
            'test/**/*.{js,ts}',
            '!test/data/**/*.js',
            'Gulpfile.js'
        ])
        .pipe(eslint())
        .pipe(eslint.format())
        .pipe(eslint.failAfterError());
});

gulp.step('clean', cb => {
    del([
        'lib',
        'test/data/lib'
    ], cb);
});

gulp.step('build-test-app', () => {
    return gulp
        .src('test/data/src/**/*.{jsx,js}')
        .pipe(babel())
        .pipe(gulp.dest('test/data/lib'));
});

gulp.step('build-selectors-script', () => {
    function loadModule (modulePath) {
        return fs.readFileSync(modulePath).toString();
    }

    return gulp.src('./src/index.js.mustache')
        .pipe(mustache({
            getRootElsReact15: loadModule('./src/react-15/get-root-els.js'),
            getRootElsReact16: loadModule('./src/react-16/get-root-els.js'),

            selectorReact15: loadModule('./src/react-15/index.js'),
            selectorReact16: loadModule('./src/react-16/index.js'),

            react15Utils: loadModule('./src/react-15/react-utils.js'),
            react16Utils: loadModule('./src/react-16/react-utils.js'),

            waitForReact: loadModule('./src/wait-for-react.js')
        }))
        .pipe(rename('index.js'))
        .pipe(gulp.dest('lib/tmp'));
});

gulp.step('transpile', gulp.series('build-selectors-script', () => {
    return gulp
        .src('lib/tmp/**/*.js')
        .pipe(babel({ extends: pathJoin(__dirname, './src/.babelrc') }))
        .pipe(gulp.dest('lib'));
}));

gulp.step('clean-build-tmp-resources', cb => {
    del(['lib/tmp'], cb);
});

gulp.step('build-nextjs-app', gulp.series('build-test-app', () => {
    const appPath = pathJoin(__dirname, './test/data/lib/server-render');

    return nextBuild(appPath, require('./next.config.js'));
}));

gulp.task('build', gulp.series('clean', 'lint', 'transpile', 'clean-build-tmp-resources'));

gulp.step('run-tests', cb => {
    glob('test/fixtures/**/*.{js,ts}', (err, files) => {
        if (err) throw err;

        startTestServer()
            .then(() => createTestCafe('localhost', 1337, 1338))
            .then(testCafe => {
                return testCafe.createRunner()
                    .src(files)
                    .browsers(['chrome', 'firefox', 'ie'])
                    .reporter('list')
                    .run({ quarantineMode: true });
            })
            .then(() => {
                cb();
                process.exit();
            });
    });
});

gulp.task('test', gulp.series('build', 'build-test-app', 'build-nextjs-app', 'run-tests'));

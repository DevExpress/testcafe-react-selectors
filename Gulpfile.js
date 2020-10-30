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
const { promisify }   = require('util');
const nextBuild       = require('next/dist/build').default;

const listFiles   = promisify(glob);
const deleteFiles = promisify(del);

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
            'test/**/*.{js,ts}',
            '!test/data/**/*.js',
            'Gulpfile.js'
        ])
        .pipe(eslint())
        .pipe(eslint.format())
        .pipe(eslint.failAfterError());
});

gulp.task('build-test-app', () => {
    return gulp
        .src('test/data/src/**/*.{jsx,js}')
        .pipe(babel())
        .pipe(gulp.dest('test/data/lib'));
});

gulp.task('build-selectors-script', () => {
    function loadModule (modulePath) {
        return fs.readFileSync(modulePath).toString();
    }

    return gulp.src('./src/index.js.mustache')
        .pipe(mustache({
            getRootElsReact15:     loadModule('./src/react-15/get-root-els.js'),
            getRootElsReact16or17: loadModule('./src/react-16-17/get-root-els.js'),

            selectorReact15:     loadModule('./src/react-15/index.js'),
            selectorReact16or17: loadModule('./src/react-16-17/index.js'),

            react15Utils:     loadModule('./src/react-15/react-utils.js'),
            react16or17Utils: loadModule('./src/react-16-17/react-utils.js'),

            waitForReact: loadModule('./src/wait-for-react.js')
        }))
        .pipe(rename('index.js'))
        .pipe(gulp.dest('lib/tmp'));
});

gulp.task('transpile', () => {
    return gulp
        .src('lib/tmp/**/*.js')
        .pipe(babel({ extends: pathJoin(__dirname, './src/.babelrc') }))
        .pipe(gulp.dest('lib'));
});

gulp.task('clean-build-tmp-resources', () => {
    return deleteFiles(['lib/tmp']);
});

gulp.task('build-nextjs-app', () => {
    const appPath = pathJoin(__dirname, './test/data/lib/server-render');

    return nextBuild(appPath, require('./next.config.js'));
});

gulp.task('build', gulp.series('clean', 'lint', 'build-selectors-script', 'transpile', 'clean-build-tmp-resources'));

gulp.task('run-tests', async cb => {
    const files = await listFiles('test/fixtures/**/*.{js,ts}');

    await startTestServer();

    const testCafe = await createTestCafe('localhost', 1337, 1338);
    
    await testCafe.createRunner()
        .src(files)
        .browsers(['chrome', 'firefox', 'ie'])
        .reporter('list')
        .run({ quarantineMode: true })
        .then(failed => {
            cb();
            process.exit(failed);
        });
});

gulp.task('test', gulp.series('build', 'build-test-app', 'build-nextjs-app', 'run-tests'));

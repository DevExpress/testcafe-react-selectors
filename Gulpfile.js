var babel           = require('gulp-babel');
var createTestCafe  = require('testcafe');
var del             = require('del');
var eslint          = require('gulp-eslint');
var fs              = require('fs');
var glob            = require('glob');
var gulp            = require('gulp');
var mustache        = require('gulp-mustache');
var pathJoin        = require('path').join;
var rename          = require('gulp-rename');
var startTestServer = require('./test/server');
var nextBuild       = require('next/dist/server/build').default;

const HangPromise = new Promise(() => {
});

gulp.task('clean', function (cb) {
    del([
        'lib',
        'test/data/lib'
    ], cb);
});

gulp.task('lint', function () {
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

gulp.task('build-test-app', ['clean', 'lint'], function () {
    return gulp
        .src('test/data/src/**/*.{jsx,js}')
        .pipe(babel())
        .pipe(gulp.dest('test/data/lib'));
});

gulp.task('build-selectors-script', ['clean', 'lint'], function () {
    return gulp.src('./src/index.js.mustache')
        .pipe(mustache({
            getRootElsReact15: fs.readFileSync('./src/react-15/get-root-els.js').toString(),
            getRootElsReact16: fs.readFileSync('./src/react-16/get-root-els.js').toString(),

            selectorReact15: fs.readFileSync('./src/react-15/index.js').toString(),
            selectorReact16: fs.readFileSync('./src/react-16/index.js').toString(),

            getReactReact15: fs.readFileSync('./src/react-15/get-react.js').toString(),
            getReactReact16: fs.readFileSync('./src/react-16/get-react.js').toString(),

            waitForReact: fs.readFileSync('./src/wait-for-react.js').toString()
        }))
        .pipe(rename('index.js'))
        .pipe(gulp.dest('lib/tmp'));
});

gulp.task('transpile', ['build-selectors-script'], function () {
    return gulp
        .src('lib/tmp/**/*.js')
        .pipe(babel({ extends: pathJoin(__dirname, './src/.babelrc') }))
        .pipe(gulp.dest('lib'));
});

gulp.task('clean-build-tmp-resources', ['transpile'], function (cb) {
    del(['lib/tmp'], cb);
});

gulp.task('build-nextjs-app', ['build-test-app'], () => {
    return nextBuild('./test/data/lib/server-render', require('./next.config.js'));
});

gulp.task('build', ['transpile', 'clean-build-tmp-resources']);

gulp.task('test', ['build', 'build-test-app', 'build-nextjs-app'], function () {
    glob('test/fixtures/**/*.{js,ts}', (err, files) => {
        if (err) throw err;

        startTestServer()
            .then(() => createTestCafe('localhost', 1337, 1338))
            .then(testCafe => {
                return testCafe.createRunner()
                    .src(files)
                    .browsers(['chrome', 'firefox', 'ie'])
                    .reporter('list')
                    .run();
            })
            .then(process.exit);
    });

    return HangPromise;
});

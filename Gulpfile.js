var babel           = require('gulp-babel');
var createTestCafe  = require('testcafe');
var del             = require('del');
var eslint          = require('gulp-eslint');
var startTestServer = require('./test/server');
var glob            = require('glob');
var gulp            = require('gulp');

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

gulp.task('build', ['clean', 'lint'], function () {
    return gulp
        .src('src/**/*.js')
        .pipe(babel())
        .pipe(gulp.dest('lib'));
});

gulp.task('test', ['build', 'build-test-app'], function () {
    startTestServer();

    glob('test/fixtures/**/*.{js,ts}', (err, files) => {
        if (err) throw err;

        createTestCafe('localhost', 1337, 1338)
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

var babel          = require('gulp-babel');
var createTestCafe = require('testcafe');
var del            = require('del');
var eslint         = require('gulp-eslint');
var gulp           = require('gulp');

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
            'test/**/*.js',
            '!test/data/**/*.js',
            'Gulpfile.js'
        ])
        .pipe(eslint())
        .pipe(eslint.format())
        .pipe(eslint.failAfterError());
});

gulp.task('build-test-app', ['clean', 'lint'], function () {
    return gulp
        .src('test/data/src/**/*.jsx')
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
    return createTestCafe('localhost', 1337, 1338)
        .then(testCafe => {
            return testCafe.createRunner()
                .src('test/react-plugin-test.js')
                .browsers(['chrome', 'firefox', 'ie'])
                .reporter('list')
                .run();
        })
        .then(process.exit);
});

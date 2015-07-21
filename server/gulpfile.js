var gulp       = require('gulp')
  , ts         = require('gulp-typescript')
  ;

var tsProject = ts.createProject({
    declarationFiles: false,
    target: 'ES6',
    typescript: require('typescript')
});

gulp.task('default', function() {
    return gulp.src(['server.ts'], { base: './' })
        .pipe(ts(tsProject)).js
        .pipe(gulp.dest('./'))
        ;
});

gulp.task('watch', ['default'], function() {
    gulp.watch('src/**/*.ts', ['default']);
});

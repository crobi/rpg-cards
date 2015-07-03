var gulp       = require('gulp')
  , ts         = require('gulp-typescript')
  , sourcemaps = require('gulp-sourcemaps')
  , babel      = require('gulp-babel')
  , rev        = require('gulp-rev')
  ;

var tsProject = ts.createProject({
      declarationFiles: false,
      noExternalResolve: true,
      removeComments: true,
      target: 'ES6',
      typescript: require('typescript'),
      out: 'app.js'
  });

  var tsProject2 = ts.createProject('tsconfig.json');

gulp.task('default', function() {
    return tsProject2.src()
        .pipe(sourcemaps.init())
        .pipe(ts(tsProject)).js
        .pipe(babel())
        .pipe(sourcemaps.write('.', {sourceRoot: '../src'}))
        .pipe(gulp.dest('./js/'))
        ;
});

gulp.task('rev', function() {
    return gulp.src(['src/**/*.ts'], { base: './' })
        .pipe(sourcemaps.init())
        .pipe(ts(tsProject)).js
        .pipe(babel())
        .pipe(sourcemaps.write('.', {sourceRoot: '../src'}))
        .pipe(gulp.dest('./js/'))
        .pipe(rev())
        .pipe(sourcemaps.write('.', {sourceRoot: '../src'}))
        .pipe(gulp.dest('./js/'))
        .pipe(rev.manifest())
        .pipe(gulp.dest('./js/'))
        ;
});

gulp.task('watch', ['default'], function() {
    gulp.watch('src/**/*.ts', ['default']);
});

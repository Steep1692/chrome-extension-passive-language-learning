const gulp = require('gulp');
const terser = require('gulp-terser');
const uglify = require('gulp-uglify');
const cssnano = require('gulp-cssnano');
const htmlmin = require('gulp-htmlmin');
const jsonminify = require('gulp-jsonminify');
// const imagemin = require('gulp-imagemin');
const rename = require('gulp-rename');
const sourcemaps = require('gulp-sourcemaps');

const srcDir = 'src';
const buildDir = 'build';

// Minify JavaScript files
gulp.task('minify-js', () => {
  return gulp.src(`${srcDir}/**/*.js`)
    .pipe(sourcemaps.init())
    .pipe(terser({
      compress: true,
      mangle: {
        toplevel: true,
      },
    }))
    .pipe(uglify())
    .pipe(rename({ suffix: '.min' }))
    .pipe(sourcemaps.write('.'))
    .pipe(gulp.dest(buildDir));
});

// Minify CSS files
gulp.task('minify-css', () => {
  return gulp.src(`${srcDir}/**/*.css`)
    .pipe(sourcemaps.init())
    .pipe(cssnano())
    .pipe(rename({ suffix: '.min' }))
    .pipe(sourcemaps.write('.'))
    .pipe(gulp.dest(buildDir));
});

// Minify HTML files
gulp.task('minify-html', () => {
  return gulp.src(`${srcDir}/**/*.html`)
    .pipe(htmlmin({ collapseWhitespace: true }))
    .pipe(gulp.dest(buildDir));
});

// Minify JSON files
gulp.task('minify-json', () => {
  return gulp.src(`${srcDir}/**/*.json`)
    .pipe(jsonminify())
    .pipe(gulp.dest(buildDir));
});

// Copy PNG files
gulp.task('copy-png', () => {
  return gulp.src(`${srcDir}/**/*.png`)
    .pipe(gulp.dest(buildDir));
});

// Copy MP4 files
gulp.task('copy-mp4', () => {
  return gulp.src(`${srcDir}/**/*.mp4`)
    .pipe(gulp.dest(buildDir));
});

// Copy VTT files
gulp.task('copy-vtt', () => {
  return gulp.src(`${srcDir}/**/*.vtt`)
    .pipe(gulp.dest(buildDir));
});

// Watch for changes in the source files
gulp.task('watch', () => {
  gulp.watch(`${srcDir}/**/*.js`, gulp.series('minify-js'));
  gulp.watch(`${srcDir}/**/*.css`, gulp.series('minify-css'));
  gulp.watch(`${srcDir}/**/*.html`, gulp.series('minify-html'));
  gulp.watch(`${srcDir}/**/*.json`, gulp.series('minify-json'));
  gulp.watch(`${srcDir}/**/*.png`, gulp.series('copy-png'));
  gulp.watch(`${srcDir}/**/*.mp4`, gulp.series('copy-mp4'));
  gulp.watch(`${srcDir}/**/*.vtt`, gulp.series('copy-vtt'));
});

// Default task
gulp.task('default', gulp.series('minify-js', 'minify-css', 'minify-html', 'minify-json', 'copy-png', 'copy-mp4', 'copy-vtt', 'watch'));
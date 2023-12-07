import gulp from 'gulp';
// import terser from 'gulp-terser';
// import uglify from 'gulp-uglify';
import cssnano from 'gulp-cssnano';
import htmlmin from 'gulp-htmlmin';
import jsonminify from 'gulp-jsonminify';
// import imagemin from 'gulp-imagemin';
import sourcemaps from 'gulp-sourcemaps';
import svgmin from 'gulp-svgmin';
import webpackStream from 'webpack-stream'
import webpackConfig from './webpack.config.js'
import { IN_FOLDER_NAME, OUT_FOLDER_NAME } from './builder-config.js'

// Minify JavaScript files
gulp.task('minify-js', () => {
  return gulp.src(`${IN_FOLDER_NAME}/**/*.js`)
    .pipe(sourcemaps.init())
    .pipe(webpackStream(webpackConfig))
    // .pipe(terser({
    //   compress: true,
    //   mangle: {
    //     toplevel: false,
    //   },
    // }))
    // .pipe(uglify())
    .pipe(sourcemaps.write('.'))
    .pipe(gulp.dest(OUT_FOLDER_NAME));
});

// Minify CSS files
gulp.task('minify-css', () => {
  return gulp.src(`${IN_FOLDER_NAME}/**/*.css`)
    .pipe(sourcemaps.init())
    .pipe(cssnano())
    .pipe(sourcemaps.write('.'))
    .pipe(gulp.dest(OUT_FOLDER_NAME));
});

// Minify HTML files
gulp.task('minify-html', () => {
  return gulp.src(`${IN_FOLDER_NAME}/**/*.html`)
    .pipe(htmlmin({ collapseWhitespace: true }))
    .pipe(gulp.dest(OUT_FOLDER_NAME));
});

// Minify JSON files
gulp.task('minify-json', () => {
  return gulp.src(`${IN_FOLDER_NAME}/**/*.json`)
    .pipe(jsonminify())
    .pipe(gulp.dest(OUT_FOLDER_NAME));
});

// Copy PNG files
gulp.task('copy-png', () => {
  return gulp.src(`${IN_FOLDER_NAME}/**/*.png`)
    .pipe(gulp.dest(OUT_FOLDER_NAME));
});

// Task to minify and copy SVG files
gulp.task('minify-svg', () => {
  return gulp.src(`${IN_FOLDER_NAME}/**/*.svg`)
    .pipe(svgmin())
    .pipe(gulp.dest(OUT_FOLDER_NAME));
});

// Copy MP4 files
gulp.task('copy-mp4', () => {
  return gulp.src(`${IN_FOLDER_NAME}/**/*.mp4`)
    .pipe(gulp.dest(OUT_FOLDER_NAME));
});

// Copy VTT files
gulp.task('copy-vtt', () => {
  return gulp.src(`${IN_FOLDER_NAME}/**/*.vtt`)
    .pipe(gulp.dest(OUT_FOLDER_NAME));
});

// Watch for changes in the source files
gulp.task('watch', () => {
  gulp.watch(`${IN_FOLDER_NAME}/**/*.js`, gulp.series('minify-js'));
  gulp.watch(`${IN_FOLDER_NAME}/**/*.css`, gulp.series('minify-css'));
  gulp.watch(`${IN_FOLDER_NAME}/**/*.html`, gulp.series('minify-html'));
  gulp.watch(`${IN_FOLDER_NAME}/**/*.json`, gulp.series('minify-json'));
  gulp.watch(`${IN_FOLDER_NAME}/**/*.png`, gulp.series('copy-png'));
  gulp.watch(`${IN_FOLDER_NAME}/**/*.svg`, gulp.series('minify-svg'));
  gulp.watch(`${IN_FOLDER_NAME}/**/*.mp4`, gulp.series('copy-mp4'));
  gulp.watch(`${IN_FOLDER_NAME}/**/*.vtt`, gulp.series('copy-vtt'));
});

// Default task
gulp.task('default', gulp.series('minify-js', 'minify-css', 'minify-html', 'minify-json', 'copy-png', 'minify-svg', 'copy-mp4', 'copy-vtt', 'watch'));
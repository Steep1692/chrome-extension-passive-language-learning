import gulp from 'gulp';
import terser from 'gulp-terser';
import uglify from 'gulp-uglify';
import cssnano from 'gulp-cssnano';
import htmlmin from 'gulp-htmlmin';
import jsonminify from 'gulp-jsonminify';
// import imagemin from 'gulp-imagemin';
import sourcemaps from 'gulp-sourcemaps';
import svgmin from 'gulp-svgmin';

const srcDir = 'src';
const buildDir = 'build';

// Minify JavaScript files
gulp.task('minify-js', () => {
  return gulp.src(`${srcDir}/**/*.js`)
    .pipe(sourcemaps.init())
    // .pipe(terser({
    //   compress: true,
    //   mangle: {
    //     toplevel: false,
    //   },
    // }))
    .pipe(uglify())
    .pipe(sourcemaps.write('.'))
    .pipe(gulp.dest(buildDir));
});

// Minify CSS files
gulp.task('minify-css', () => {
  return gulp.src(`${srcDir}/**/*.css`)
    .pipe(sourcemaps.init())
    .pipe(cssnano())
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

// Task to minify and copy SVG files
gulp.task('minify-svg', () => {
  return gulp.src(`${srcDir}/**/*.svg`)
    .pipe(svgmin())
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
  gulp.watch(`${srcDir}/**/*.svg`, gulp.series('minify-svg'));
  gulp.watch(`${srcDir}/**/*.mp4`, gulp.series('copy-mp4'));
  gulp.watch(`${srcDir}/**/*.vtt`, gulp.series('copy-vtt'));
});

// Default task
gulp.task('default', gulp.series('minify-js', 'minify-css', 'minify-html', 'minify-json', 'copy-png', 'minify-svg', 'copy-mp4', 'copy-vtt', 'watch'));
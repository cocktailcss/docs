const gulp = require('gulp');
const plumber = require('gulp-plumber');
const notify = require('gulp-notify');
const browserSync = require('browser-sync');
const runSequence = require('run-sequence');
const pug = require('gulp-pug');
const htmlbeautify = require('gulp-html-beautify');
const webpackStream = require('webpack-stream');
const webpack = require('webpack');
const uglify = require('gulp-uglify');
const jsonminify = require('gulp-jsonminify');
const cleanCSS = require('gulp-clean-css');
const concatFiles = require('gulp-concat');
const eslint = require('gulp-eslint');
const sass = require('gulp-sass');
const autoprefixer = require('gulp-autoprefixer');
const gcmq = require('gulp-group-css-media-queries');
const imagemin = require('gulp-imagemin');
const _ = require('lodash');
const reload = browserSync.reload;

const plumberErrorHandler = () =>
  plumber({
    errorHandler: err => {
      notify.onError({
        title: `Gulp error in ${err.plugin}`,
        message: err.toString(),
      })(err);
    },
  });

// pug
gulp.task('pug', () =>
  gulp
    .src('src/pug/*.pug')
    .pipe(plumberErrorHandler())
    .pipe(
      pug({
        locals: {
          _,
        },
      }),
    )
    .on('error', console.log)
    .pipe(gulp.dest('docs'))
    .pipe(reload({ stream: true })),
);

// htmlBeautify
gulp.task('htmlBeautify', () => {
  const options = { indentSize: 2 };

  return gulp
    .src('docs/*.html')
    .pipe(plumberErrorHandler())
    .pipe(htmlbeautify(options))
    .pipe(gulp.dest('docs'))
    .pipe(reload({ stream: true }));
});

// js
gulp.task('js', () =>
  gulp
    .src('src/js/app.js')
    .pipe(plumberErrorHandler())
    .pipe(eslint())
    .pipe(eslint.format())
    .pipe(webpackStream(require('./webpack.config.js'), webpack))
    .pipe(gulp.dest('docs/script/'))
    .pipe(reload({ stream: true })),
);

// scss
gulp.task('scss', () =>
  gulp
    .src('src/scss/app.scss')
    .pipe(plumberErrorHandler())
    .pipe(
      sass({
        outputStyle: 'expanded',
      }).on('error', sass.logError),
    )
    .pipe(
      autoprefixer({
        browsers: ['> 1%'],
      }),
    )
    .pipe(gcmq())
    .pipe(gulp.dest('docs/style'))
    .pipe(reload({ stream: true })),
);

// pluginCSS
gulp.task('pluginCSS', () =>
  gulp
    .src('src/plugin/css/**/*.css')
    .pipe(concatFiles('plugin.css'))
    .pipe(gulp.dest('./docs/style'))
    .pipe(reload({ stream: true })),
);

// pluginJS
gulp.task('pluginJS', () =>
  gulp
    .src('src/plugin/js/**/*.js')
    .pipe(concatFiles('plugin.js'))
    .pipe(gulp.dest('docs/script'))
    .pipe(reload({ stream: true })),
);

// optimizeImg
gulp.task('optimizeImg', () =>
  gulp
    .src('docs/img/**/*')
    .pipe(
      imagemin([
        imagemin.gifsicle({ interlaced: true }),
        imagemin.jpegtran({ progressive: true }),
        imagemin.optipng(),
        imagemin.svgo(),
      ]),
    )
    .pipe(gulp.dest('docs/img')),
);

// uglifyJS
gulp.task('uglifyJS', () =>
  gulp
    .src('docs/script/*.js')
    .pipe(uglify())
    .pipe(gulp.dest('docs/script')),
);

// cleanCSS
gulp.task('cleanCSS', () =>
  gulp
    .src('docs/style/*.css')
    .pipe(cleanCSS({ compatibility: 'ie9' }))
    .pipe(gulp.dest('docs/style')),
);

// jsonMinify
gulp.task('jsonMinify', () =>
  gulp
    .src('src/*.json')
    .pipe(jsonminify())
    .pipe(gulp.dest('docs/data')),
);

// markup
gulp.task('markup', () => {
  runSequence('pug', 'htmlBeautify');
});

// style
gulp.task('style', ['scss']);

// script
gulp.task('script', ['js']);

// plugin
gulp.task('plugin', ['pluginJS', 'pluginCSS']);

// build
gulp.task('build', ['markup', 'style', 'script', 'plugin']);

// prod
gulp.task('prod', () => {
  runSequence('build', 'optimizeImg', 'uglifyJS', 'cleanCSS', 'jsonMinify');
});

// default (watch)
gulp.task('default', ['build'], () => {
  browserSync({
    notify: false,
    port: 9000,
    logLevel: 'silent',
    server: {
      baseDir: ['docs'],
    },
  });

  gulp.watch(['src/pug/local/data.js', 'src/pug/local/util.js'], ['build']);
  gulp.watch('src/pug/**/*.pug', ['markup']);
  gulp.watch('src/scss/**/*.scss', ['style']);
  gulp.watch('src/js/**/*.js', ['script']);
  gulp.watch('src/plugin/js/**/*.js', ['pluginJS']);
  gulp.watch('src/plugin/css/**/*.css', ['pluginCSS']);
});

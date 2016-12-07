var fs = require('fs');
var gulp = require('gulp');
var copy = require('gulp-copy');
var clean = require('gulp-clean');
var sass = require('gulp-sass');
var insert = require('gulp-insert');
var replace = require('gulp-replace');
var uglify = require('gulp-uglify');
var rjs = require('gulp-requirejs');
var htmlmin = require('gulp-htmlmin');
var browserSync = require('browser-sync');
var cleanCSS = require('gulp-clean-css');
var config = fs.readFileSync('js/config.js', 'utf-8');

gulp.task('sass', function() {
    return gulp.src('./scss/index.scss')
        .pipe(sass({outputStyle: 'expanded'}).on('error', sass.logError))
        .pipe(gulp.dest('./css/'))
        .pipe(browserSync.reload({stream: true}))
});

gulp.task('serv', ['sass'], function() {
    browserSync.init({
        server: {
            baseDir: './'
        },
        port: 8098
    });

    gulp.watch('./scss/**/*.scss', ['sass']);
    gulp.watch('./*.html').on('change', browserSync.reload);
});

gulp.task('clean', function () {
    return gulp.src('dist').pipe(clean({force: true}));
});

gulp.task('cssmin', ['clean', 'sass'], function () {
    return gulp.src('css/*')
        .pipe(cleanCSS({compatibility: 'ie8'}))
        .pipe(gulp.dest('dist/css'));
});

gulp.task('copy', ['cssmin'], function () {
    return gulp.src(['js/lib/*', './imgs/*']).pipe(copy('dist'));
});

gulp.task('uglify', ['copy'], function () {
    return gulp.src('js/*.js')
        .pipe(insert.transform(function (contents) { //insert config.js
            return config + contents;
        }))
        .pipe(uglify())
        .pipe(gulp.dest('dist/js'));
});

gulp.task('htmlmin', ['uglify'], function () {
    return gulp.src('./*.html')
        .pipe(htmlmin({collapseWhitespace: true}))
        .pipe(replace('<script src="js/config.js"></script>', '')) //config.js已插到对应的js文件
        .pipe(gulp.dest('dist'));
});

//concat util/*、init.js
gulp.task('rjs', ['htmlmin'], function () {
    rjs({
        baseUrl: './js',
        name: 'init',
        out: './dist/js/init.js',
        paths: {
            mask: 'util/mask',
            tool: 'util/tool',
            rsa: 'util/rsa',
            ui: 'util/ui',
            jquery: 'empty:',
            jsencrypt: 'lib/jsencrypt.min'
        }
    })
        .pipe(uglify())
        .pipe(gulp.dest('./'));
});

gulp.task('build', ['rjs']);

gulp.task('default', ['serv']);

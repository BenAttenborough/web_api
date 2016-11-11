/**
 * Created by ben on 11/11/2016.
 */

"use strict";

var sassDir = 'sass/',
    sassFile = 'style.scss',
    sassMain = sassDir.concat(sassFile),
    cssDir = 'css',
    gulp = require('gulp'),
    concat = require('gulp-concat'),
    uglify = require('gulp-uglify'),
    rename = require('gulp-rename'),
    sassify = require('gulp-sass'),
    maps = require('gulp-sourcemaps'),
    del = require('del');

gulp.task('sassify', function () {
    return gulp.src([
            sassMain
        ])
        .pipe(maps.init())
        .pipe(sassify({outputStyle: 'compressed'}))
        .pipe(maps.write('./'))
        .pipe(gulp.dest(cssDir))
});

gulp.task('watchFiles', function () {
    gulp.watch('sass/**/*.scss', ['sassify']);
});

//gulp.task('clean', function() {
//    return gulp.src([
//        'css/*',
//        'js/*',
//    ])
//});

gulp.task("concatScripts", function () {
    return gulp.src([
            'js/jquery-3.1.1.min.js',
            'js/api.js'
        ])
        .pipe(maps.init())
        .pipe(concat('app.js'))
        .pipe(maps.write('./'))
        .pipe(gulp.dest('js'));
});

gulp.task("minifyScripts", ["concatScripts"], function () {
    return gulp.src(['js/app.js'])
        .pipe(uglify())
        .pipe(rename('app.min.js'))
        .pipe(gulp.dest('js'));
});

gulp.task('build', function () {
    return gulp.src([
            'css/style.css*',
            'img/**',
            'js/**',
            'languages/**',
            'layouts/**',
            'template-parts/**',
            'inc/**',
            '*.php',
            '*.js',
            '*.md',
            '*.txt',
            '*.css',
            '*.png'
        ],
        {base: './'})
        .pipe(gulp.dest('dist'))
});

gulp.task('default', function () {
    gulp.start('build');
});
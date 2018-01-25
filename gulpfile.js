var gulp = require('gulp');
var sass = require('gulp-sass');
gulp.task('complie-sass', function(){
    gulp.src('./public/css/sass/*.scss')
    .pipe(sass.sync().on('error', sass.logError))
    .pipe(gulp.dest('./public/css'))
})
gulp.task('watch', function(){
    gulp.watch('./public/css/sass/*.scss',['complie-sass'])
})
gulp.task('default',['complie-sass'])


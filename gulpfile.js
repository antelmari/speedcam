const gulp         = require("gulp"); // Подключает сам gulp.
const browserSync  = require("browser-sync"); // Автоматическая перезагрузка страницы.
const del          = require("del"); // Удаляет что либо.
const path         = require("path"); // Манипуляции с путями.
const argv         = require("yargs").argv; // Проверяет наличие флага -production в консоли.
const gulpif       = require("gulp-if"); // Условия.
const combine      = require("stream-combiner2").obj; // Комбинирует пайпы. Для gulp-if.
const revReplace   = require("gulp-rev-replace");
const rev          = require("gulp-rev");
const fileinclude  = require("gulp-file-include");

// html.
const htmlhint     = require("gulp-htmlhint");
const prettyHtml   = require("gulp-pretty-html"); // Добавляет индентацию.

// css.
const sass         = require("gulp-sass")(require("sass"));
const sortCSSmq    = require("sort-css-media-queries");
const postcss      = require("gulp-postcss");
const cssnano      = require("cssnano");
const mqpacker     = require("css-mqpacker"); // Группирует медиазапросы.
const autoprefixer = require("gulp-autoprefixer");
const rename       = require("gulp-rename");
const sourcemaps   = require("gulp-sourcemaps"); // Создаёт soursemaps.

// js.
const uglify       = require("gulp-uglify");

// Работа с изображениями.
const webp         = require("gulp-webp"); // Конвертирует изображение в webp.
const smushit      = require("gulp-smushit"); // Сжатие изображений.
const filter       = require("gulp-filter"); // Проверка на формат изображений.

// Работа с SVG-спрайтами.
const svgSprite    = require("gulp-svg-sprite"); // Спрайты из SVG.
const cheerio      = require("gulp-cheerio");
const replace      = require("gulp-replace"); // Заменяет одно на другое.

// deploy.
const gutil        = require("gulp-util"); // будет выводить уведомления.
const ftp          = require("vinyl-ftp");
const ftpHost      = ""; // Хост для ftp-подключения.
const ftpUser      = ""; // Пользователь для ftp-подключения.
const ftpPass      = ""; // Пароль для ftp-подключения.
const ftpDest      = "/httpdocs/" + path.basename(__dirname); // Путь куда на хостинге будет выгружаться сайт. (вторая часть - это название папки проекта)

// Флаги.cache
const dist         = argv.dist;
const min          = argv.min;
const norev        = argv.norev;

// Пути.
const buildHtml    = "build";
const buildCss     = "build/css";
const buildJs      = "build/js";
const buildImgs    = "build/imgs";
const buildFonts   = "build/fonts";
const buildSvg     = "build/imgs";
const buildFavicon = "build/favicon";
const buildJson = "build/json";

gulp.task("browser-sync", function(c) {
  if (!dist) {
    browserSync.init({
      server: {
        baseDir: "build"
      },
      directory: false,
      notify: false,
      ghostMode: false,
      tunnel: false
    });
  } else {
    c(); // Вызывает callback, чтобы gulp не ругался.
  }
});

gulp.task("html", function() {
  return gulp.src("src/*.html", {base: "src", since: gulp.lastRun("html")})

    // HTML-валидатор.
    .pipe(htmlhint(".htmlhintrc"))
    .pipe(htmlhint.reporter())

    // @@include("blocks/header/header.html").
    .pipe(fileinclude({
      prefix: '@@',
      basepath: '@file'
    })).on('error', console.log)

    // Манифест.
    // Если флаг --dist без --norev.
    .pipe(gulpif(dist,
      gulpif(!norev,
        revReplace({manifest: gulp.src("manifest/manifest.json", {allowEmpty: true})})
      )
    ))

    // Добавляет индентацию для заинклюженных блоков.
    .pipe(gulpif(dist,
      prettyHtml({
        indent_size: 2
      })
    ))

    // Выгрузка.
    .pipe(gulp.dest(buildHtml))

    // browserSync.
    .pipe(gulpif(!dist, browserSync.stream())); // Если нет флага --dist.
});

gulp.task("htmlInclude", function() {
  return gulp.src("src/*.html", {base: "src"})
    // HTML-валидатор.
    .pipe(htmlhint(".htmlhintrc"))
    .pipe(htmlhint.reporter())

    // @@include("blocks/header/header.html").
    .pipe(fileinclude({
      prefix: '@@',
      basepath: '@file'
    })).on('error', console.log)

    // Выгрузка.
    .pipe(gulp.dest(buildHtml))

    // browserSync.
    .pipe(gulpif(!dist, browserSync.stream())); // Если нет флага --dist.
});

gulp.task("css", function() {
  return gulp.src("src/blocks/styles.scss")

    // Sourcemaps.
    .pipe(gulpif(!dist, sourcemaps.init())) // Если нет флага --dist.

    // Компилируем SASS.
    .pipe(sass({outputStyle: "expanded"}).on("error", sass.logError))

    // Переименовываем в styles.css.
    .pipe(rename("styles.css"))

    // Если флаг --min, то сжимаем css.
    .pipe(gulpif(min,
      postcss([
        cssnano({
          preset: "default"
        })
      ])
    ))

    // Группируем медиазапросы.
    .pipe(postcss([
      mqpacker({
        sort: sortCSSmq // Кастомный метод сортировки.
      })
    ]))

    // autoprefixer.
    .pipe(autoprefixer({
      cascade: false
    }))

    // Sourcemaps.
    .pipe(gulpif(!dist, sourcemaps.write())) // Если нет флага --dist.

    // Приписывает хэш в конце файла(styles-004da46867.css). Чтобы при обновлении сайта не приходилось очищать кэш.
    // Если флаг --dist без --norev.
    .pipe(gulpif(dist,
      gulpif(!norev,
        rev()
      )
    ))

    // Выгрузка.
    .pipe(gulp.dest(buildCss))

    // Если флаг --dist без --norev.
    .pipe(gulpif(dist,
      gulpif(!norev,
        combine(
          // Создаёт манифест с новым названием.
          rev.manifest("manifest/manifest.json", {
            base: "manifest", // Базовый каталог для manifest.json. Можно было бы и обойтись без этой опции, но без неё не работает merge.
            merge: true // Чтобы манифесты не перезаписывались, а соединялись в один.
          }),
          // Выгружает файл манифеста в папку manifest.
          gulp.dest("manifest")
        )
      )
    ))

    // Browsersync.
    .pipe(gulpif(!dist, browserSync.stream())); // Если нет флага --dist.
});

gulp.task("cssLibs", function() {
  return gulp.src("src/blocks/libs.scss")

    // Компилируем SASS.
    .pipe(sass({outputStyle: "expanded"}).on("error", sass.logError))

    // Переименовываем в libs.css.
    .pipe(rename("libs.css"))

    // Минифицируем.
    .pipe(postcss([
      cssnano({
        preset: "default"
      })
    ]))

    // Выгрузка.
    .pipe(gulp.dest(buildCss))

    // Browsersync.
    .pipe(gulpif(!dist, browserSync.stream())); // Если нет флага --dist.
});

gulp.task("js", function() {
  return gulp.src("src/blocks/scripts.js")

    // Собираем всё в один файл.
    // // include("../../node_modules/jquery/dist/jquery.min.js").
    .pipe(fileinclude({
      prefix: '//',
      basepath: '@file'
    })).on('error', console.log)

    // Приписывает хэш в конце файла(styles-004da46867.css). Чтобы при обновлении сайта не приходилось очищать кэш.
    // Если флаг --dist без --norev.
    .pipe(gulpif(dist,
      gulpif(!norev,
        rev()
      )
    ))

    .pipe(gulpif(min,
      uglify()
    ))

    // Выгрузка.
    .pipe(gulp.dest(buildJs))

    // Если флаг --dist без --norev.
    .pipe(gulpif(dist,
      gulpif(!norev,
        combine(
          // Создаёт манифест с новым названием.
          rev.manifest("manifest/manifest.json", {
            base: "manifest", // Базовый каталог для manifest.json. Можно было бы и обойтись без этой опции, но без неё не работает merge.
            merge: true // Чтобы манифесты не перезаписывались, а соединялись в один.
          }),
          // Выгружает файл манифеста в папку manifest.
          gulp.dest("manifest")
        )
      )
    ))

    // Browsersync.
    .pipe(gulpif(!dist, browserSync.stream())); // Если нет флага --dist.
});

gulp.task("jsLibs", function() {
  return gulp.src("src/blocks/libs.js")

    // Собираем всё в один файл.
    // // include("../../node_modules/jquery/dist/jquery.min.js").
    .pipe(fileinclude({
      prefix: '//',
      basepath: '@file'
    })).on('error', console.log)

    // Минифицируем.
    //.pipe(uglify())

    // Выгрузка.
    .pipe(gulp.dest(buildJs))

    // Browsersync.
    .pipe(gulpif(!dist, browserSync.stream())); // Если нет флага --dist.
});

gulp.task("imgs", function() {
  var smushitFilter = filter("**/*.{jpg,jpeg,png}", {restore: true})
  return gulp.src("src/blocks/**/*.{jpg,jpeg,png,gif,ico}")

    /* .pipe(smushitFilter) // Фильтруем поток.
    .pipe(gulpif(dist, // Если есть флаг --dist.
      smushit({
        verbose: true // Подробный режим.
      })
    ))
    .pipe(smushitFilter.restore) // Восстанавливаем поток. */

    // Выгрузка.
    .pipe(gulp.dest(buildImgs))

    // Browsersync.
    .pipe(gulpif(!dist, browserSync.stream())); // Если нет флага --dist.
});

gulp.task("favicon", function() {
  return gulp.src("src/favicon/*.*")

    // Выгрузка.
    .pipe(gulp.dest(buildFavicon))

    // Browsersync.
    .pipe(gulpif(!dist, browserSync.stream())); // Если нет флага --dist.
});

gulp.task("json", function() {
  return gulp.src("src/json/*.*")

    // Выгрузка.
    .pipe(gulp.dest(buildJson))

    // Browsersync.
    .pipe(gulpif(!dist, browserSync.stream())); // Если нет флага --dist.
});

// Из-за того, что smushit не умеет обрабатывать svg пришлось сделать для них отдельный таск.
gulp.task("imgsSvg", function() {
  return gulp.src(["src/blocks/**/*.svg", "!src/blocks/svg-sprite/*.svg", "!src/blocks/fonts/**/*.svg"])

    // Выгрузка.
    .pipe(gulp.dest(buildImgs))

    // Browsersync.
    .pipe(gulpif(!dist, browserSync.stream())); // Если нет флага --dist.
});

gulp.task("fonts", function() {
  return gulp.src("src/fonts/**/*.{woff,woff2,ttf,eot,svg}")

    // Выгрузка.
    .pipe(gulp.dest(buildFonts))

    // browserSync.
    .pipe(gulpif(!dist, browserSync.stream())); // Если нет флага --dist.
});

gulp.task("clean", function() {
  return del("build");
});

gulp.task("cleanManifest", function(c) {
  return del("manifest");
});

/* Собирает все svg файлы и сохраняет их в файл svg-sprite.svg.
<svg class="inline-svg-icon browser"><use xlink:href="imgs/svg-sprite.svg#baseball"></use></svg>
https://www.youtube.com/watch?v=ihAHwkl0KAI и https://habrahabr.ru/post/272505/ */
gulp.task("svg", function() {
  return gulp.src("src/svg-sprite/*.svg")

    // Удаляет атрибуты из svg файлов, чтобы можно было их менять с помощью css.
    .pipe(cheerio({
      run: function ($) {
        $("[fill]").removeAttr("fill");
        $("[fill-rule]").removeAttr("fill-rule");
        $("[clip-rule]").removeAttr("clip-rule");
        $("[transform]").removeAttr("transform");
        $("[fill-opacity]").removeAttr("fill-opacity");
        $("[stroke]").removeAttr("stroke");
        $("[stroke-dasharray]").removeAttr("stroke-dasharray");
        $("[stroke-dashoffset]").removeAttr("stroke-dashoffset");
        $("[stroke-linecap]").removeAttr("stroke-linecap");
        $("[stroke-linejoin]").removeAttr("stroke-linejoin");
        $("[stroke-miterlimit]").removeAttr("stroke-miterlimit");
        $("[stroke-opacity]").removeAttr("stroke-opacity");
        $("[stroke-width]").removeAttr("stroke-width");
        $("[font-family]").removeAttr("font-family");
        $("[font-size]").removeAttr("font-size");
        $("[font-size-adjust]").removeAttr("font-size-adjust");
        $("[font-stretch]").removeAttr("font-stretch");
        $("[font-style]").removeAttr("font-style");
        $("[font-variant]").removeAttr("font-variant");
        $("[font-weight]").removeAttr("font-weight");
        $("[style]").removeAttr("style");
      },
      parserOptions: {xmlMode: true}
    }))

    // У cheerio есть один баг — иногда он преобразовывает символ '>' в кодировку '&gt;'.
    .pipe(replace("&gt;", ">"))

    // Делаем спрайт.
    .pipe(svgSprite({
      mode: {
        symbol: {
          sprite: "sprite.svg",
          dest: "./" // Убираем папку с названием мода.
        }
      },
      shape: { // Убирает префикс с путями.
        id: {
          generator: function(name) {
            return path.basename(name, ".svg");
          }
        }
      }
    }))

    // Выгрузка.
    .pipe(gulp.dest(buildSvg));
});

gulp.task("deploy", function() {
  var conn = ftp.create({
    host:      ftpHost,
    user:      ftpUser,
    password:  ftpPass,
    parallel:  10,
    log: gutil.log
  });

  var globs = ["build/**"];
  return gulp.src(globs, {buffer: false})
  .pipe(conn.dest(ftpDest));
});

gulp.task("watch", function(c) {
  if (!dist) { // Проверяет на наличие флага.
    gulp.watch(["src/*.html"], gulp.series("html"));
    gulp.watch(["src/blocks/**/*.html"], gulp.series("htmlInclude"));
    gulp.watch(["src/blocks/**/*.scss", "src/consts/*.scss", "src/fonts/fonts.scss", "src/mixins/*.scss", "src/custom-libs/*.{scss, css}"], gulp.series("css"));
    gulp.watch(["src/blocks/libs.scss", "src/custom-libs/**/*.{scss, css}"], gulp.series("cssLibs"));
    gulp.watch(["src/blocks/**/*.js", "src/blocks/scripts.js"], gulp.series("js"));
    gulp.watch("src/blocks/libs.js", gulp.series("jsLibs"));
    gulp.watch("src/svg-sprite/*.svg", gulp.series("svg"));
    gulp.watch("src/custom-libs/**/*.*", gulp.series("css", "js"));
    gulp.watch("src/favicon/*.*", gulp.series("favicon"));

    // Наблюдает за изображениями. При добавлении - переносит в build/imgs, при удалении - удаляет из build/imgs. https://github.com/gulpjs/gulp/blob/4.0/docs/recipes/handling-the-delete-event-on-watch.md
    gulp.watch("src/blocks/**/*.{jpg,jpeg,png,gif,svg}", gulp.series("imgs", "imgsSvg")).on("unlink", function(filepath) {
      var filePathFromSrc = path.relative(path.resolve("src/blocks/"), filepath);
      var destFilePath = path.resolve(buildImgs, filePathFromSrc);
      var destFilePathWebp = path.parse(destFilePath);
      var destFilePathWebp = destFilePathWebp.dir + "\\" + destFilePathWebp.name + ".webp";
      del.sync(destFilePath);
      del.sync(destFilePathWebp);
    });

    // Тоже самое, только со шрифтами.
    gulp.watch("src/fonts/**/*.{woff,woff2,ttf,eot}", gulp.series("fonts")).on("unlink", function(filepath) {
      var filePathFromSrc = path.relative(path.resolve("src/blocks/fonts"), filepath);
      var destFilePath = path.resolve(buildFonts, filePathFromSrc);
      del.sync(destFilePath);
    });
  } else {
    c(); // Вызывает callback, чтобы gulp не ругался.
  }
});

gulp.task("build",
  gulp.series(
    "clean", "cssLibs", "css", "jsLibs", "js", "html", "imgs", "imgsSvg", "fonts", "svg", "favicon", "json", "cleanManifest"
  )
);

gulp.task("default", gulp.series("build", gulp.parallel("watch", "browser-sync")));

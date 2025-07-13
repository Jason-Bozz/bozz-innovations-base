import { sync } from 'glob'
import { writeFile, stat } from 'fs/promises'
import { Parcel } from '@parcel/core'
import { PurgeCSS } from 'purgecss'
import chalk from 'chalk'
import { ESLint } from 'eslint'

const watch = process.argv[2] || false
const purge = process.argv[3] || false
const themePath = 'public_html/themes'
const basePath = `${themePath}/custom/base`
const componentsPath = `${basePath}/templates`
const outputDir = `${basePath}/dist`
const eslint = new ESLint()

const filePatterns = [
  `${componentsPath}/**/*.js`,
  `${componentsPath}/**/*.scss`,
]

let buildMode = 'production'
let files = []

if (watch && watch === 'watch') {
  buildMode = 'development'
} else {
  buildMode = 'production'
}

filePatterns.forEach((pattern) => {
  const matchedFiles = sync(pattern)
  files.push(...matchedFiles)
})

files = files.filter((path) => {
  const pathParts = path.split('/')
  const fileName = pathParts[pathParts.length - 1]
  return !fileName.startsWith('_') && path.indexOf('/dist/') === -1
})

const filesLint = files.filter((path) => {
  const pathParts = path.split('/')
  const fileName = pathParts[pathParts.length - 1]
  return fileName.includes('.js')
})

let bundler = new Parcel({
  entries: files,
  defaultConfig: '@parcel/config-default',
  mode: buildMode,
  shouldDisableCache: true,
  defaultTargetOptions: {
    shouldOptimize: false,
    distDir: outputDir,
    sourceMaps: false,
  },
})

const lintFiles = async () => {
  try {
    const results = await eslint.lintFiles(filesLint)
    const formatter = await eslint.loadFormatter('stylish')
    const resultText = formatter.format(results)

    console.log(resultText)

    results.forEach(result => {
      if (result.errorCount > 0) {
        result.messages.forEach(message => {
          const severity = message.severity === 2 ? 'error' : 'warning';
          if (severity === 'error') {
            process.exit(1)
          }
        });
      }
    });
  } catch (error) {
    console.error('Error occurred:', error)
    process.exit(1)
  }
}

const buildedCommand = (bundles) => {
  bundles.forEach((bundle) => {
    console.log(chalk.cyanBright(`📂 ${bundle.filePath}`))
    console.log(
      chalk.green(
        `🤓 Info for nerds ${chalk.green.bold('size:')} ${
          bundle.stats.size
        } bytes ${chalk.green.bold('time:')} ${bundle.stats.time}ms`
      )
    )
  })
}

const purgeBuildCss = async (log) => {
  console.log(chalk.cyanBright(`\n🥁 Wait for PurgeCSS...`))

  const purgeCSSResult = await new PurgeCSS().purge({
    content: [
      `${componentsPath}/**/*.twig`,
      `${themePath}/drupal_core/templates/**/*.twig`,
    ],
    css: [`${outputDir}/**/*.css`],
    safelist: {
      standard: [
        /-active$/,
        /-enter$/,
        /-leave-to$/,
        /show$/,
        /alert/,
        /alert-*/,
        /block-base-content/,
        /block-base-primary-local-tasks/,
        /block-booknavigation/,
        /block-language/,
        /dialog-off-canvas-main-canvas/,
        /dropmenu--*/,
        /drupal-live-announce/,
        /edit-actions/,
        /eu-cookie-*/,
        /messages/,
        /messages--*/,
        /mm-*/,
        /paragraph--*/,
        /page/,
        /sliding-popup/,
        /view-*/,
        /tablefield-wrapper/,
        /toolbar/,
        /user-login-form$/,
        /utilities/,
        /caption/,
        /h1/,
        /h2/,
        /h3/,
        /h4/,
        /h5/,
        /h6/,
        /p/,
        /b/,
        /i/,
        /strong/,
        /a/,
        /ul/,
        /ol/,
        /lil/,
        /u/,
        /form/,
        /label/,
        /select/,
        /textarea/,
        /button/,
        /legend/,
        /option/,
        /table/,
        /tbody/,
        /td/,
        /th/,
        /thead/,
        /tr/,
        /animation-*/,
        /swiper/,
        /swiper-*/,
      ],
    },
  })

  const purgeCssDone = await Promise.all([
    ...purgeCSSResult.map(async ({ css, file }) => {
      const initialSize = (await stat(file)).size

      await writeFile(file, css)

      const postSize = (await stat(file)).size

      if (log) {
        console.log(chalk.cyanBright(`📂 ${file}`))
        console.log(
          chalk.green(
            `🤓 Info for nerds ${chalk.green.bold(
              'Initial size:'
            )} ${initialSize} bytes ${chalk.green.bold(
              'Post size:'
            )} ${postSize} bytes`
          )
        )
      }
    }),
  ])

  if (purgeCssDone) {
    console.log(chalk.blueBright.bold(`\n🏁 Done!`))
  }
}

const build = async () => {
  if (watch && watch === 'watch') {
    await bundler.watch((err, event) => {
      lintFiles()

      if (err) {
        throw err
      }

      if (event.type === 'buildSuccess') {
        let bundles = event.bundleGraph.getBundles()
        if (bundles) {
          console.log(
            chalk.cyanBright(
              `👀 ${chalk.blueBright.bold('Watching...')} ${
                bundles.length
              } bundles and ${event.changedAssets.size} change(s) in ${
                event.buildTime
              }ms!`
            )
          )
          if (purge && purge === 'purge') purgeBuildCss(false)
        }
      } else if (event.type === 'buildFailure') {
        console.log(event.diagnostics)
      }
    })
  } else {
    try {
      lintFiles()

      let { bundleGraph, buildTime } = await bundler.run()
      let bundles = bundleGraph.getBundles()

      buildedCommand(bundles)

      console.log(
        chalk.blueBright.bold(
          `\n✨ ${bundles.length} bundles in ${buildTime}ms!`
        )
      )

      purgeBuildCss(true)
    } catch (err) {
      console.log(err.diagnostics)
    }
  }
}

build()
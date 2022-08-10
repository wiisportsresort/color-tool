import { stripIndents } from 'common-tags'
import fs from 'node:fs/promises'
import path from 'node:path'

import React from 'react'
import ReactDOMServer from 'react-dom/server'
import Home from '../pages/index'

import autoprefixer from 'autoprefixer'
import cssnano from 'cssnano'
import postcss, { AcceptedPlugin } from 'postcss'
import postcssColorContrast from 'postcss-color-contrast'
import postcssFlexbugsFixes from 'postcss-flexbugs-fixes'
import postcssPresetEnv from 'postcss-preset-env'
import sass from 'sass'
import tailwindcss from 'tailwindcss'

const body = ReactDOMServer.renderToString(<Home />)

const out = (...dirs: string[]): string => path.resolve(__dirname, '../out', ...dirs)

const cssFile = path.resolve(__dirname, '../..', 'styles', 'globals.scss')

const postcssPlugins: AcceptedPlugin[] = [
  postcssFlexbugsFixes as AcceptedPlugin,
  postcssPresetEnv,
  autoprefixer,
  tailwindcss(path.resolve(__dirname, '../..', 'tailwind.config.js')),
  postcssColorContrast,
  cssnano,
]

const scriptPath = process.argv[2]

const sassResult = sass.compile(cssFile, { sourceMap: true })

postcss(postcssPlugins)
  .process(sassResult.css, { from: sassResult.sourceMap!.file })
  .then(async (result) => {
    const scriptContent = await fs.readFile(scriptPath, 'utf8')
    const html = stripIndents`
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta http-equiv="X-UA-Compatible" content="IE=edge">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <meta name="theme-color" content="#94a3b8">
        <meta name="description" content="TailwindCSS color palette tool">

        <title>Color Tool</title>

        <link rel="manifest" href="/manifest.json">
        <link rel="icon" href="/icon/256.png">
        <link rel="shortcut icon" href="/icon/256.png">
        <link rel="apple-touch-icon" href="/icon/192.png">

        <style>${result.css}</style>
      </head>
      <body class="bg-zinc-50">
        <div id="root">${body}</div>
        <script type="module">${scriptContent}</script>
      </body>
      </html>
    `

    const file = path.resolve(__dirname, '../out', 'index.html')
    return fs.writeFile(file, html)
  })

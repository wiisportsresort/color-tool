// @ts-check

import fs from 'node:fs/promises'
import path from 'node:path'
import React from 'react'
import ReactDOMServer from 'react-dom/server'

import autoprefixer from 'autoprefixer'
import cssnano from 'cssnano'
import postcss, { AcceptedPlugin } from 'postcss'
import flexbugsFixes from 'postcss-flexbugs-fixes'
import presetEnv from 'postcss-preset-env'
import tailwindcss from 'tailwindcss'

import { stripIndents } from 'common-tags'
import Home from '../pages/index'

const body = ReactDOMServer.renderToString(<Home />)

const out = (...dirs: string[]): string => path.resolve(__dirname, '../out', ...dirs)

const cssFile = path.resolve(__dirname, '../..', 'styles', 'globals.css')

const postcssPlugins: AcceptedPlugin[] = [
  flexbugsFixes as AcceptedPlugin,
  presetEnv,
  autoprefixer,
  tailwindcss(path.resolve(__dirname, '../..', 'tailwind.config.js')),
  cssnano,
]

const scriptPath = process.argv[2]

fs.readFile(cssFile, 'utf8')
  .then((css) => postcss(postcssPlugins).process(css, { from: cssFile }))
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

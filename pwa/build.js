/* eslint-disable no-sequences */
const { fork: origFork } = require('child_process')
const fs = require('fs/promises')
const path = require('path')
const esbuild = require('esbuild')
const resolve = (...dirs) => path.resolve(__dirname, ...dirs)
const out = (...dirs) => path.resolve(__dirname, 'out', ...dirs)
const temp = (...dirs) => path.resolve(__dirname, 'temp', ...dirs)

const done = (msg) => console.log('\x1b[32m✅ %s\x1b[0m', msg)

const fork = (module, ...args) =>
  new Promise((resolve, reject) => {
    const child = origFork(module, args)
    child.on('error', reject)
    child.on('exit', (code) => {
      if (code !== 0) {
        reject(new Error(`${module} exited with code ${code}`))
      }
      resolve()
    })
  })

const copyDir = async (src, dest) => {
  const [entries] = await Promise.all([
    fs.readdir(src, { withFileTypes: true }),
    fs.mkdir(dest, { recursive: true }),
  ])

  await Promise.all(
    entries.map((entry) => {
      const srcPath = path.join(src, entry.name)
      const destPath = path.join(dest, entry.name)
      return entry.isDirectory() ? copyDir(srcPath, destPath) : fs.copyFile(srcPath, destPath)
    })
  )
}

/** @type {esbuild.BuildOptions} */
const clientBuildConfig = {
  entryPoints: [resolve('script.tsx')],
  bundle: true,
  outdir: temp(),
  target: 'es2020',
  splitting: false,
  minify: true,
  write: false,
  entryNames: '[name]',
  // jsxFactory: 'h',
  // jsxFragment: 'Fragment',
  jsx: 'automatic',
  // plugins: [
  //   {
  //     name: 'preact',
  //     // eslint-disable-next-line space-before-function-paren
  //     setup(build) {
  //       build.onResolve({ filter: /^react(?:-dom)?$/ }, async () => {
  //         const result = await build.resolve(require.resolve('preact/compat'), {
  //           resolveDir: __dirname,
  //         })
  //         if (result.errors.length > 0) {
  //           return { errors: result.errors }
  //         }
  //         return { path: result.path, external: true }
  //       })
  //     },
  //   },
  // ],
}

const swBuildConfig = {
  ...clientBuildConfig,
  entryPoints: [resolve('sw/sw.ts')],
  outfile: out('sw.js'),
  outdir: undefined,
  entryNames: undefined,
  write: true,
}

/** @type {esbuild.BuildOptions} */
const prerenderBuildConfig = {
  entryPoints: [resolve('prerender.tsx')],
  outfile: temp('prerender.js'),
  bundle: true,
  platform: 'node',
  target: 'es2020',
  format: 'cjs',
  jsx: 'automatic',
  external: ['postcss', 'tailwindcss', '@napi-rs/canvas'],
}

const iconsBuildConfig = {
  ...prerenderBuildConfig,
  entryPoints: [resolve('icons.ts')],
  outfile: temp('icons.js'),
}

let scriptPath

fs.rm(out(), { recursive: true })
  .then(() =>
    Promise.all([
      //
      fs.mkdir(out(), { recursive: true }),
      fs.mkdir(temp(), { recursive: true }),
    ])
  )
  .then(() =>
    Promise.all([
      Promise.all([
        esbuild.build(clientBuildConfig).then((result) => (done('Build script.js'), result)),
        esbuild.build(prerenderBuildConfig).then((result) => done('Build prerender.js')),
      ])
        .then(([{ outputFiles: out }]) => fs.writeFile((scriptPath = out[0].path), out[0].contents))
        .then(() => fork(temp('prerender.js'), scriptPath))
        .then(() => done('Prerender complete')),

      esbuild //
        .build(swBuildConfig)
        .then(() => done('Build sw.js')),

      esbuild
        .build(iconsBuildConfig)
        .then(() => done('Build icons.js'))
        .then(() => fork(temp('icons.js')))
        .then(() => done('Generated icons')),

      fs
        .copyFile(resolve('manifest.json'), out('manifest.json'))
        .then(() => done('Copy manifest.json')),

      copyDir(resolve('../public'), out()).then(() => done('Copy assets')),
    ])
  )
  .then(() => fs.rm(temp(), { recursive: true }))
  .then(() => done('Cleanup'))
  .then(() => done('Build complete'))
  .catch((err) => console.error(err))

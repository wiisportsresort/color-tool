import { createCanvas } from '@napi-rs/canvas'
import fs from 'node:fs/promises'
import path from 'node:path'
import { colors, tailwindColors } from '../util/colors'

const generate = async (size: number): Promise<Buffer> => {
  const canvas = createCanvas(size, size)

  const ctx = canvas.getContext('2d')
  if (!ctx) throw new Error('Could not get context')

  const width = canvas.width
  const height = canvas.height

  const ignore = ['fuchsia', 'pink', 'rose', 'slate', 'gray']
  const targetColors = Object.keys(colors).filter(
    (x) => colors[x as keyof typeof colors] !== undefined && !ignore.includes(x)
  )

  for (const [i, colorName] of targetColors.entries()) {
    const swatch = tailwindColors[colorName as keyof typeof tailwindColors]
    const shades = Object.keys(swatch)
    const y = i * (width / targetColors.length)
    shades.reverse()
    for (const [j, shade] of shades.entries()) {
      const color = swatch[shade as keyof typeof swatch]
      const x = j * (height / shades.length)
      ctx.fillStyle = color
      ctx.fillRect(x, y, height / shades.length, width / targetColors.length)
    }
  }

  return canvas.toBuffer('image/png')
}

const sizes = [16, 24, 32, 48, 64, 96, 128, 192, 256, 512, 1024, 2048]

fs.mkdir(path.resolve(__dirname, '../out/icon'), { recursive: true }).then(() =>
  Promise.all(
    sizes.map(async (size) => {
      const buffer = await generate(size)
      await fs.writeFile(path.resolve(__dirname, '../out/icon', `${size}.png`), buffer)
      console.log(`\x1b[32m✅ Generated ${size}x${size} icon\x1b[0m`)
    })
  )
)

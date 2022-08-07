import { NextPage } from 'next'
import React, { useEffect, useRef } from 'react'
import { colors, tailwindColors } from '../util/colors'
const IconPage: NextPage = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    if (!canvasRef.current) return

    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')
    if (!ctx) return

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
      for (const [j, shade] of shades.entries()) {
        const color = swatch[shade as keyof typeof swatch]
        const x = j * (height / shades.length)
        ctx.fillStyle = color
        ctx.fillRect(x, y, height / shades.length, width / targetColors.length)
      }
    }
  }, [canvasRef])

  const size = 64

  return (
    <>
      <div className="flex items-center justify-center">
        <canvas ref={canvasRef} width={size} height={size} />
      </div>
    </>
  )
}

export default IconPage

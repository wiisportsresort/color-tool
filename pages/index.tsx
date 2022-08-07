// import { Fragment, h } from 'preact'
import React, { Fragment, useState } from 'react'
import { colors } from '../util/colors'

enum CopyMode {
  HEX = 'Hex',
  PLAIN = 'Plain',
  RGB = 'RGB',
  HSL = 'HSL',
  HSL_APPROX = 'HSL (approximate)',
}

const copyModeExamples: Record<CopyMode, string> = {
  [CopyMode.HEX]: '#1e90ff',
  [CopyMode.PLAIN]: '1e90ff',
  [CopyMode.RGB]: 'rgb(30, 144, 255)',
  [CopyMode.HSL]: 'hsl(209.6, 100%, 55.88235294117647%)',
  [CopyMode.HSL_APPROX]: 'hsl(210, 100%, 56%)',
}

let lastCopiedTimeout: NodeJS.Timeout | undefined

const Home = (): JSX.Element => {
  const [lastCopied, setLastCopied] = useState('')
  const [copyMode, setCopyMode] = useState(CopyMode.HEX)

  return (
    <div className="flex items-center justify-center">
      <div className=" lg:text-xl md:text-base text-xs mx-8 lg:max-w-6xl">
        <form onSubmit={(e) => e.preventDefault()} className="flex flex-wrap justify-end mb-2">
          {Object.values(CopyMode).map((mode, i) => (
            <label key={i} className="inline-flex items-center ml-2">
              <input
                type="radio"
                className="mr-1"
                name="copyMode"
                value={mode}
                checked={copyMode === mode}
                onChange={() => setCopyMode(mode)}
              />
              {mode}{' '}
              <code className="ml-1 text-xs bg-neutral-300 p-1 rounded">
                {copyModeExamples[mode]}
              </code>
            </label>
          ))}
        </form>
        <div className="grid grid-cols-11">
          {Object.entries(colors)
            .filter(([k, v]) => !!v)
            .map(([name, shades], i) => (
              <Fragment key={i}>
                <h1 className="flex items-center justify-start">{name}</h1>
                {Object.entries(shades!).map(([shade, color], i) => (
                  <div
                    key={i}
                    className={`flex items-center justify-center h-10 md:h-12 lg:h-16 cursor-pointer hover:border ${
                      parseInt(shade) >= 600 ? 'text-neutral-200' : 'hover:border-black'
                    }`}
                    style={{ background: color }}
                    onClick={() => {
                      clearTimeout(lastCopiedTimeout)
                      navigator.clipboard.writeText(formatColor(color, copyMode))
                      setLastCopied(name + shade)
                      lastCopiedTimeout = setTimeout(() => setLastCopied(''), 3000) as any
                    }}
                  >
                    {name + shade === lastCopied ? '✅' : shade}
                  </div>
                ))}
              </Fragment>
            ))}
        </div>
      </div>
    </div>
  )
}

export default Home

export const rgbToHsl = (r: number, g: number, b: number): [h: number, s: number, l: number] => {
  r /= 255
  g /= 255
  b /= 255
  const max = Math.max(r, g, b)
  const value = max
  const min = Math.min(r, g, b)
  const chroma = max - min
  const lightness = (max + min) / 2

  let hue
  if (chroma === 0) {
    hue = 0
  }

  switch (value) {
    case r:
      hue = (0 + (g - b) / chroma) * 60
      break
    case g:
      hue = (2 + (b - r) / chroma) * 60
      break
    case b:
      hue = (4 + (r - g) / chroma) * 60
      break
    default:
      throw new Error('Invalid RGB color')
  }

  let saturation
  if (lightness === 0 || lightness === 1) {
    saturation = 0
  } else {
    saturation = (value - lightness) / Math.min(lightness, 1 - lightness)
  }

  return [hue, saturation, lightness]
}

const formatColor = (colorAsHex: string, mode: CopyMode): string => {
  switch (mode) {
    case CopyMode.HEX:
      return colorAsHex
    case CopyMode.PLAIN:
      return colorAsHex.replace(/^#/, '')
    case CopyMode.RGB:
    case CopyMode.HSL:
    case CopyMode.HSL_APPROX: {
      const [r, g, b] = colorAsHex
        .replace(/^#/, '')
        .match(/.{2}/g)!
        .map((x) => parseInt(x, 16))
      if (mode === CopyMode.RGB) return `rgb(${r}, ${g}, ${b})`
      let [h, s, l] = rgbToHsl(r, g, b)
      s *= 100
      l *= 100
      if (mode === CopyMode.HSL) return `hsl(${h}, ${s}%, ${l}%)`
      return `hsl(${Math.round(h)}, ${Math.round(s)}%, ${Math.round(l)}%)`
    }
  }
}

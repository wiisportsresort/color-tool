import tailwindColors from 'tailwindcss/colors'

export { tailwindColors }
export const colors = {
  ...tailwindColors,
  inherit: undefined,
  current: undefined,
  transparent: undefined,
  black: undefined,
  white: undefined,
  lightBlue: undefined,
  warmGray: undefined,
  trueGray: undefined,
  coolGray: undefined,
  blueGray: undefined,
}

delete colors.inherit
delete colors.current
delete colors.transparent
delete colors.black
delete colors.white
delete colors.lightBlue
delete colors.warmGray
delete colors.trueGray
delete colors.coolGray
delete colors.blueGray

import type { AppProps } from 'next/app'
// import { Fragment, h } from 'preact'
import React from 'react'
import '../styles/globals.scss'

function App({ Component, pageProps }: AppProps): JSX.Element {
  return <Component {...pageProps} />
}

export default App

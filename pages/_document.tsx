import Document, { Head, Html, Main, NextScript } from 'next/document'
// import { h } from 'preact'
import React from 'react'

class CustomDocument extends Document {
  render(): JSX.Element {
    return (
      <Html>
        <Head />
        <body className={'bg-zinc-50'}>
          <Main />
          <NextScript />
        </body>
      </Html>
    )
  }
}

export default CustomDocument

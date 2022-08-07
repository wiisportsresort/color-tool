import React from 'react'
import { render } from 'react-dom'
import Home from '../pages'

render(<Home />, document.getElementById('root'))

addEventListener('load', () => {
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('/sw.js')
  }
})

import React from 'react'
import { configure, addDecorator } from '@storybook/react'
import { BrowserRouter } from 'react-router-dom'
import Decorator from './Decorator'

const req = require.context('components', true, /story.jsx$/i)

function loadStories() {
  req.keys().forEach(filename => req(filename))
}

addDecorator(story => {
  return React.createElement(BrowserRouter, null,
    React.createElement(Decorator, null, story())
  )
})

configure(loadStories, module)

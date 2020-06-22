import React from 'react'
import { addDecorator } from '@storybook/react'
import styled, { createGlobalStyle } from 'styled-components'

import Palette from '../src/components/styleUtils/Palette'
import StyleProps from '../src/components/styleUtils/StyleProps'
import Fonts from '../src/components/atoms/Fonts'
import { BrowserRouter as Router, Switch, Route } from 'react-router-dom'

const Wrapper = styled.div`
  display: inline-block;
  background: ${Palette.grayscale[7]};
  padding: 32px;
`

const GlobalStyle = createGlobalStyle`
  ${Fonts}
  body {
    color: ${Palette.black};
    font-family: Rubik;
    font-size: 14px;
    font-weight: ${StyleProps.fontWeights.regular};
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
  }
`

addDecorator(storyFn => (
  <Router>
    <Switch>
      <Wrapper>
        <GlobalStyle />
        {storyFn()}
      </Wrapper>
    </Switch>
  </Router>
  )
)

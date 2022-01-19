import React from 'react'
import { addDecorator } from '@storybook/react'
import styled, { createGlobalStyle } from 'styled-components'

import { ThemePalette, ThemeProps } from '@src/components/Theme'
import Fonts from '@src/components/ui/Fonts'
import { BrowserRouter as Router, Switch, Route } from 'react-router-dom'

const Wrapper = styled.div`
  display: inline-block;
  background: ${ThemePalette.grayscale[7]};
  padding: 32px;
`

const GlobalStyle = createGlobalStyle`
  ${Fonts}
  body {
    color: ${ThemePalette.black};
    font-family: Rubik;
    font-size: 14px;
    font-weight: ${ThemeProps.fontWeights.regular};
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

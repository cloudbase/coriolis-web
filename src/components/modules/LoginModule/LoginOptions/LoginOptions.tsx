/*
Copyright (C) 2017  Cloudbase Solutions SRL
This program is free software: you can redistribute it and/or modify
it under the terms of the GNU Affero General Public License as
published by the Free Software Foundation, either version 3 of the
License, or (at your option) any later version.
This program is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
GNU Affero General Public License for more details.
You should have received a copy of the GNU Affero General Public License
along with this program.  If not, see <http://www.gnu.org/licenses/>.
*/

import React from 'react'
import styled, { css } from 'styled-components'

import { ThemePalette, ThemeProps } from '../../../Theme'
import { loginButtons } from '../../../../constants'
import googleLogo from './images/google-logo.svg'
import microsoftLogo from './images/microsoft-logo.svg'
import facebookLogo from './images/facebook-logo.svg'
import githubLogo from './images/github-logo.svg'

const Wrapper = styled.div<any>`
  display: flex;
  flex-wrap: wrap;
  width: ${loginButtons.length > 2 ? '420px' : '210px'};
  margin-left: -16px;
  margin-top: 16px;
`

const buttonStyle = (id: any, isLogo?: boolean) => {
  switch (id) {
    case 'google':
      return isLogo
        ? css`background-image: url('${googleLogo}');`
        : css`
          color: ${ThemePalette.grayscale[4]};
          border-color: ${ThemePalette.grayscale[2]};
          background-color: white;
        `
    case 'microsoft':
      return isLogo
        ? css`background-image: url('${microsoftLogo}');`
        : css`
          border-color: #0078D7;
          background-color: #0078D7;
        `
    case 'facebook':
      return isLogo
        ? css`
          height: 27px;
          background-image: url('${facebookLogo}');
          margin-top: 8px;
        `
        : css`
          border-color: #2553B4;
          background-color: #2553B4;
        `
    case 'github':
      return isLogo
        ? css`background-image: url('${githubLogo}');`
        : css`
          border-color: ${ThemePalette.grayscale[4]};
          background-color: ${ThemePalette.grayscale[4]};
        `
    default:
      return ''
  }
}

const Button = styled.div<any>`
  width: ${ThemeProps.inputSizes.large.width - 2}px;
  height: ${ThemeProps.inputSizes.large.height - 2}px;
  display: flex;
  align-items: center;
  border: 1px solid;
  border-radius: ${ThemeProps.borderRadius};
  color: white;
  cursor: pointer;
  margin-left: 16px;
  margin-bottom: 16px;
  ${props => buttonStyle(props.id)}
`

const Logo = styled.div<any>`
  width: 17px;
  height: 17px;
  background-repeat: no-repeat;
  margin: 0 8px 0 8px;
  ${props => buttonStyle(props.id, true)}
`
type Props = {
  buttons?: { name: string, id: string }[]
}
const LoginOptions = (props: Props) => {
  const buttons = props.buttons || loginButtons

  if (buttons.length === 0) {
    return null
  }

  return (
    <Wrapper>
      {buttons.map(button => (
        <Button
          data-test-id={`loginOptions-button-${button.id}`}
          key={button.id}
          id={button.id}
        >
          <Logo data-test-id={`loginOptions-logo-${button.id}`} id={button.id} />Sign in with {button.name}
        </Button>
      ))}
    </Wrapper>
  )
}

export default LoginOptions

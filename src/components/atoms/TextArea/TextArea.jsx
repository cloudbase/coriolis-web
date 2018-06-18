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

// @flow

import React from 'react'
import { observer } from 'mobx-react'
import styled from 'styled-components'
import Palette from '../../styleUtils/Palette'
import StyleProps from '../../styleUtils/StyleProps'

const getInputWidth = props => {
  if (props.width) {
    return props.width
  }

  if (props.large) {
    return `${StyleProps.inputSizes.large.width}px`
  }

  return `${StyleProps.inputSizes.regular.width}px`
}

const Input = styled.textarea`
  width: ${props => getInputWidth(props)};
  height: ${props => props.height || `${StyleProps.inputSizes.regular.height * 2}px`};
  border-radius: ${StyleProps.borderRadius};
  background-color: #FFF;
  border: 1px solid ${props => props.highlight ? Palette.alert : Palette.grayscale[3]};
  color: ${Palette.black};
  padding: 8px;
  font-size: inherit;
  transition: all ${StyleProps.animations.swift};
  box-sizing: border-box;
  font-family: monospace;
  &:hover {
    border-color: ${props => props.highlight ? Palette.alert : Palette.primary};
  }
  &:focus {
    border-color: ${props => props.highlight ? Palette.alert : Palette.primary};
    outline: none;
  }
  &:disabled {
    color: ${Palette.grayscale[3]};
    border-color: ${Palette.grayscale[0]};
    background-color: ${Palette.grayscale[0]};
  }
  &::placeholder {
    color: ${Palette.grayscale[3]};
  }
`

@observer
class TextArea extends React.Component<{}> {
  render() {
    return (
      <Input {...this.props} />
    )
  }
}

export default TextArea

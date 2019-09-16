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
import styled from 'styled-components'

import Palette from '../../styleUtils/Palette'
import StyleProps from '../../styleUtils/StyleProps'

const backgroundColor = (props) => {
  if (props.hollow) {
    if (props.transparent) {
      return 'transparent'
    }
    return 'white'
  }
  if (props.secondary) {
    return Palette.secondaryLight
  }
  if (props.alert) {
    return Palette.alert
  }
  return Palette.primary
}
const disabledBackgroundColor = props => {
  if (props.secondary && props.hollow) {
    return Palette.grayscale[7]
  }
  return backgroundColor(props)
}

const hoverBackgroundColor = (props) => {
  if (props.disabled && props.secondary && props.hollow) {
    return Palette.grayscale[7]
  }

  if (props.secondary) {
    return Palette.grayscale[8]
  }

  if (props.hoverPrimary) {
    return Palette.primary
  }

  if (props.alert) {
    return Palette.alert
  }
  return Palette.primary
}

const border = (props) => {
  if (props.hollow) {
    if (props.secondary) {
      return `border: 1px solid ${Palette.grayscale[3]};`
    }
    if (props.alert) {
      return `border: 1px solid ${Palette.alert};`
    }
    return `border: 1px solid ${Palette.primary};`
  }
  return ''
}
const disabledBorder = props => {
  if (props.secondary && props.hollow) {
    return 'border: none;'
  }
  return border(props)
}

const color = (props) => {
  if (props.hollow) {
    if (props.secondary) {
      return props.disabled ? Palette.grayscale[3] : Palette.black
    }
    if (props.alert) {
      return Palette.alert
    }
    return Palette.primary
  }
  return 'white'
}
const getWidth = props => {
  if (props.width) {
    return props.width
  }

  if (props.large) {
    return `${StyleProps.inputSizes.large.width}px`
  }
  return `${StyleProps.inputSizes.regular.width}px`
}
const StyledButton = styled.button`
  ${StyleProps.exactHeight('32px')}
  border-radius: 4px;
  margin: 0;
  background-color: ${props => backgroundColor(props)};
  border: none;
  ${props => border(props)}
  color: ${props => color(props)};
  padding: 0;
  ${props => StyleProps.exactWidth(getWidth(props))}
  cursor: pointer;
  font-size: inherit;
  transition: background-color ${StyleProps.animations.swift}, opacity ${StyleProps.animations.swift};
  &:disabled {
    opacity: ${props => props.secondary ? 1 : 0.7};
    cursor: not-allowed;
    background-color: ${props => disabledBackgroundColor(props)};
    ${props => disabledBorder(props)}
  }
  &:hover {
    ${props => props.hollow ? `color: ${props.disabled ? Palette.grayscale[3] : 'white'};` : ''}
    background-color: ${props => hoverBackgroundColor(props)};
  }
  &:focus {
    outline: none;
  }
`

const Button = (props: any) => {
  return (
    <StyledButton {...props} onFocus={e => { e.target.blur() }} />
  )
}

export default Button

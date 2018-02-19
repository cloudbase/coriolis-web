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
import PropTypes from 'prop-types'
import styled from 'styled-components'

import Palette from '../../styleUtils/Palette'
import StyleProps from '../../styleUtils/StyleProps'

const backgroundColor = (props) => {
  if (props.hollow) {
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

const hoverBackgroundColor = (props) => {
  if (props.hoverPrimary) {
    return Palette.primary
  }
  if (props.secondary) {
    return Palette.grayscale[3]
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

const color = (props) => {
  if (props.hollow) {
    if (props.secondary) {
      return Palette.black
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
  transition: all ${StyleProps.animations.swift};
  &:disabled {
    opacity: 0.7;
    cursor: not-allowed;
  }
  &:hover {
    ${props => props.hollow ? 'color: white;' : ''}
    background-color: ${props => hoverBackgroundColor(props)};
  }
  &:focus {
    outline: none;
  }
`

const Button = ({ ...props }) => {
  return (
    <StyledButton {...props} onFocus={e => { e.target.blur() }} />
  )
}

Button.propTypes = {
  children: PropTypes.node,
}

export default Button

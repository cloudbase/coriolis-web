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

import arrowImage from './images/arrow.js'

import Palette from '../../styleUtils/Palette'
import StyleProps from '../../styleUtils/StyleProps'

const getLabelColor = props => {
  if (props.disabled) {
    return Palette.grayscale[3]
  }

  if (props.primary) {
    return 'white'
  }

  return Palette.black
}
const Label = styled.div`
  color: ${props => getLabelColor(props)};
  margin: 0 32px 0 16px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  flex-grow: 1;
  ${props => props.useBold ? `font-weight: ${StyleProps.fontWeights.medium};` : ''}
  ${props => props.centered ? 'text-align: center;' : ''}
`

const getBackgroundColor = props => {
  if (props.disabled) {
    return Palette.grayscale[0]
  }

  if (props.primary) {
    return Palette.primary
  }

  return 'white'
}
const getArrowColor = props => {
  if (props.disabled) {
    return Palette.grayscale[0]
  }

  if (props.primary) {
    return 'white'
  }

  return Palette.grayscale[4]
}
const getWidth = props => {
  if (props.large) {
    return StyleProps.inputSizes.large.width - 2
  }
  if (props.width) {
    return props.width - 2
  }
  return StyleProps.inputSizes.regular.width - 2
}
const borderColor = props => {
  if (props.disabled) {
    return Palette.grayscale[0]
  }
  if (props.primary) {
    return Palette.primary
  }
  return Palette.grayscale[3]
}

const Wrapper = styled.div`
  display: flex;
  align-items: center;
  position: relative;
  width: ${props => getWidth(props)}px;
  height: ${props => props.large ? StyleProps.inputSizes.large.height - 2
    : StyleProps.inputSizes.regular.height - 2}px;
  border: 1px solid ${props => borderColor(props)};
  border-radius: ${StyleProps.borderRadius};
  cursor: ${props => props.disabled ? 'default' : 'pointer'};
  transition: all ${StyleProps.animations.swift};
  background: ${props => getBackgroundColor(props)};

  #dropdown-arrow-image {stroke: ${props => getArrowColor(props)};}
  &:hover {
    #dropdown-arrow-image {stroke: ${props => props.disabled ? '' : 'white'};}
    background: ${props => props.disabled ? '' : Palette.primary};
  }

  &:hover ${Label} {
    color: ${props => props.disabled ? '' : 'white'};
  }
`
const Arrow = styled.div`
  position: absolute;
  right: 8px;
  top: 12px;
  display: flex;
`

const DropdownButton = ({ value, onClick, className, disabled, ...props }) => {
  return (
    <Wrapper
      onClick={e => { disabled ? null : onClick(e) }}
      className={className}
      disabled={disabled}
      {...props}
    >
      <Label {...props} disabled={disabled}>{value}</Label>
      <Arrow {...props} disabled={disabled} dangerouslySetInnerHTML={{ __html: arrowImage }} />
    </Wrapper>
  )
}

DropdownButton.propTypes = {
  value: PropTypes.string,
  className: PropTypes.string,
  onClick: PropTypes.func,
  disabled: PropTypes.bool,
}

export default DropdownButton

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
type Props = {
  value: string,
  onClick?: (event: Event) => void,
  customRef?: (ref: HTMLElement) => void,
  innerRef?: (ref: HTMLElement) => void,
  className?: string,
  disabled?: boolean,
  'data-test-id'?: string,
}
class DropdownButton extends React.Component<Props> {
  render() {
    return (
      <Wrapper
        data-test-id={this.props['data-test-id'] || 'dropdownButton'}
        {...this.props}
        innerRef={e => {
          if (this.props.customRef) {
            this.props.customRef(e)
          } else if (this.props.innerRef) {
            this.props.innerRef(e)
          }
        }}
        onClick={e => { if (!this.props.disabled && this.props.onClick) this.props.onClick(e) }}
      >
        <Label
          {...this.props}
          onClick={() => {}}
          innerRef={() => {}}
          data-test-id="dropdownButton-value"
          disabled={this.props.disabled}
        >{this.props.value}</Label>
        <Arrow
          {...this.props}
          innerRef={() => {}}
          onClick={() => {}}
          data-test-id=""
          disabled={this.props.disabled}
          dangerouslySetInnerHTML={{ __html: arrowImage }}
        />
      </Wrapper>
    )
  }
}

export default DropdownButton

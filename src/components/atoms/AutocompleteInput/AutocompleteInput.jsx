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
import styled, { css } from 'styled-components'

import arrowImage from './images/arrow'

import TextInput from '../TextInput'
import Palette from '../../styleUtils/Palette'
import StyleProps from '../../styleUtils/StyleProps'

const getWidth = props => {
  if (props.width) {
    return props.width - 2
  }

  if (props.large) {
    return StyleProps.inputSizes.large.width - 2
  }

  return StyleProps.inputSizes.regular.width - 2
}

const getBorder = props => {
  if (props.embedded) {
    return css`border: none;`
  }
  return css`border: 1px solid ${props.highlight ? Palette.alert : props.disabled ? Palette.grayscale[0] : Palette.grayscale[3]};`
}

const Wrapper = styled.div`
  display: flex;
  align-items: center;
  position: relative;
  width: ${props => props.embedded ? 'calc(100% + 8px)' : `${getWidth(props)}px`};
  height: ${props => props.large ? StyleProps.inputSizes.large.height - 2
    : StyleProps.inputSizes.regular.height - 2}px;
  ${props => getBorder(props)}
  border-radius: ${StyleProps.borderRadius};
  cursor: ${props => props.disabled ? 'default' : 'pointer'};
  transition: all ${StyleProps.animations.swift};
  background: ${props => props.disabled && !props.embedded ? Palette.grayscale[0] : 'white'};

  #dropdown-arrow-image {stroke: ${props => props.disabled ? Palette.grayscale[3] : Palette.black};}
  ${props => props.focus ? css`border-color: ${Palette.primary};` : ''}
  ${props => props.disabledLoading ? StyleProps.animations.disabledLoading : ''}

`
const Arrow = styled.div`
  position: absolute;
  top: 8px;
  right: 8px;
  width: 16px;
  height: 16px;
  display: flex;
  justify-content: center;
  align-items: center;
`
type Props = {
  value: string,
  customRef?: (ref: HTMLElement) => void,
  innerRef?: (ref: HTMLElement) => void,
  onChange: (value: string) => void,
  onClick?: () => void,
  disabled?: boolean,
  disabledLoading?: boolean,
  width?: number,
  large?: boolean,
  onFocus?: () => void,
  highlight?: boolean,
  embedded?: boolean,
}
type State = {
  textInputFocus: boolean,
}
class AutocompleteInput extends React.Component<Props, State> {
  state = {
    textInputFocus: false,
  }

  render() {
    let disabled = this.props.disabled || this.props.disabledLoading
    return (
      <Wrapper
        large={this.props.large}
        width={this.props.width}
        focus={this.state.textInputFocus}
        highlight={this.props.highlight}
        disabled={disabled}
        disabledLoading={this.props.disabledLoading}
        embedded={this.props.embedded}
        innerRef={e => {
          if (this.props.customRef) {
            this.props.customRef(e)
          } else if (this.props.innerRef) {
            this.props.innerRef(e)
          }
        }}
      >
        <TextInput
          data-test-id="acInput-text"
          disabled={disabled}
          value={this.props.value}
          onChange={e => { this.props.onChange(e.target.value) }}
          embedded
          width={this.props.embedded ? '100%' : this.props.width ? `${this.props.width - 40}px` : '180px'}
          style={{
            marginLeft: this.props.embedded ? 0 : '16px',
            paddingRight: this.props.embedded ? '32px' : '8px',
          }}
          height="29px"
          lineHeight="30px"
          placeholder="Type to search ..."
          onFocus={() => { if (this.props.onFocus) { this.props.onFocus() } this.setState({ textInputFocus: true }) }}
          onBlur={() => { this.setState({ textInputFocus: false }) }}
        />
        <Arrow
          data-test-id="acInput-arrow"
          disabled={disabled}
          dangerouslySetInnerHTML={{ __html: arrowImage }}
          onClick={this.props.onClick}
        />
      </Wrapper>
    )
  }
}

export default AutocompleteInput

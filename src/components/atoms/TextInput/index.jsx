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

import * as React from 'react'
import styled, { css } from 'styled-components'
import Palette from '../../styleUtils/Palette'
import StyleProps from '../../styleUtils/StyleProps'

import starImage from './images/star.svg'
import closeImage from './images/close.svg'

const Wrapper = styled.div`
  position: relative;
`
const getInputWidth = props => {
  if (props.width) {
    return props.width
  }

  if (props.large) {
    return `${StyleProps.inputSizes.large.width}px`
  }

  return `${StyleProps.inputSizes.regular.width}px`
}
const borderColor = (props, defaultColor = Palette.grayscale[3]) => props.highlight ? Palette.alert : defaultColor
const Input = styled.input`
  width: ${props => getInputWidth(props)};
  height: ${StyleProps.inputSizes.regular.height}px;
  line-height: ${StyleProps.inputSizes.regular.height}px;
  border-radius: ${StyleProps.borderRadius};
  background-color: #FFF;
  border: ${props => props.embedded ? 0 : css`1px solid ${props => borderColor(props)}`};
  color: ${Palette.black};
  padding: 0 ${props => props.customRequired ? '29px' : '8px'} 0 ${props => props.embedded ? 0 : '16px'};
  font-size: inherit;
  transition: all ${StyleProps.animations.swift};
  box-sizing: border-box;
  &:hover {
    border-color: ${props => borderColor(props, props.disablePrimary ? null : Palette.primary)};
  }
  &:focus {
    border-color: ${props => borderColor(props, props.disablePrimary ? null : Palette.primary)};
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
const Required = styled.div`
  display: ${props => props.show ? 'block' : 'none'};
  position: absolute;
  right: 12px;
  top: 13px;
  width: 8px;
  height: 8px;
  background: url('${starImage}') center no-repeat;
`
const Close = styled.div`
  display: ${props => props.show ? 'block' : 'none'};
  width: 16px;
  height: 16px;
  background: url('${closeImage}') center no-repeat;
  position: absolute;
  top: 8px;
  right: 8px;
  cursor: pointer;
`

type Props = {
  _ref?: (ref: HTMLElement) => void,
  required?: boolean,
  disabled?: boolean,
  highlight?: boolean,
  large?: boolean,
  onChange?: (e: SyntheticInputEvent<EventTarget>) => void,
  placeholder?: string,
  type?: string,
  value?: string,
  showClose?: boolean,
  onCloseClick?: () => void,
  embedded?: boolean,
}
const TextInput = (props: Props) => {
  const { _ref, required, value, onChange, showClose, onCloseClick } = props
  let input
  return (
    <Wrapper>
      <Input
        innerRef={ref => { input = ref; if (_ref) _ref(ref) }}
        type="text"
        customRequired={required}
        value={value}
        onChange={onChange}
        {...props}
      />
      <Required show={required} />
      <Close
        show={showClose && value}
        onClick={() => {
          input.focus()
          // $FlowIgnore
          if (onChange) onChange({ target: { value: '' } })
          if (onCloseClick) onCloseClick()
        }}
      />
    </Wrapper>
  )
}

export default TextInput

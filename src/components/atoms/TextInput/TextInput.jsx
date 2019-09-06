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

import closeImage from './images/close.svg'
import requiredImage from './images/required.svg'

const Wrapper = styled.div`
  position: relative;
  ${props => props.disabledLoading ? StyleProps.animations.disabledLoading : ''}
`
const Required = styled.div`
  position: absolute;
  width: 8px;
  height: 8px;
  right: -16px;
  top: 12px;
  background: url('${requiredImage}') center no-repeat;
`
const getInputWidth = props => {
  if (props.width) {
    return typeof props.width === 'number' ? `${props.width}px` : props.width
  }

  if (props.large) {
    return `${StyleProps.inputSizes.large.width}px`
  }

  return `${StyleProps.inputSizes.regular.width}px`
}
const borderColor = (props, defaultColor = Palette.grayscale[3]) => props.highlight ? Palette.alert : defaultColor
const Input = styled.input`
  width: ${props => getInputWidth(props)};
  height: ${props => props.height || `${StyleProps.inputSizes.regular.height}px`};
  line-height: ${props => props.lineHeight || 'normal'};
  border-radius: ${StyleProps.borderRadius};
  background-color: #FFF;
  border: ${props => props.embedded ? 0 : css`1px solid ${props => borderColor(props)}`};
  border-top-left-radius: ${props => props.embedded ? 0 : StyleProps.borderRadius};
  border-top-right-radius: ${StyleProps.borderRadius};
  border-bottom-left-radius: ${props => props.embedded ? 0 : StyleProps.borderRadius};
  border-bottom-right-radius: ${StyleProps.borderRadius};
  color: ${Palette.black};
  padding: 0 8px 0 ${props => props.embedded ? 0 : '16px'};
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
    color: ${props => !props.embedded ? Palette.grayscale[3] : 'inherit'};
    border-color: ${props => !props.embedded ? Palette.grayscale[0] : 'inherit'};
    background-color: ${props => !props.embedded ? Palette.grayscale[0] : 'inherit'};
  }
  &::placeholder {
    color: ${Palette.grayscale[3]};
  }
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
  height?: string,
  'data-test-id'?: string,
  required?: boolean,
  disabledLoading?: boolean,
}
const TextInput = (props: Props) => {
  const { _ref, value, onChange, showClose, onCloseClick, disabled, disabledLoading } = props
  let actualDisabled = disabled || disabledLoading
  let input
  return (
    <Wrapper data-test-id={props['data-test-id'] || 'textInput'} disabledLoading={disabledLoading}>
      <Input
        innerRef={ref => { input = ref; if (_ref) _ref(ref) }}
        type="text"
        value={value}
        onChange={onChange}
        data-test-id="textInput-input"
        {...props}
        disabled={actualDisabled}
      />
      {props.required ? <Required /> : null}
      <Close
        data-test-id="textInput-close"
        show={showClose && value !== '' && value !== undefined}
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

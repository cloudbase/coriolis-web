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

import * as React from 'react'
import styled, { css } from 'styled-components'
import { ThemePalette, ThemeProps } from '@src/components/Theme'

import closeImage from './images/close.svg'
import requiredImage from './images/required.svg'

const Wrapper = styled.div<any>`
  position: relative;
  ${props => (props.disabledLoading ? ThemeProps.animations.disabledLoading : '')}
`
const Required = styled.div<any>`
  position: absolute;
  width: 8px;
  height: 8px;
  right: ${props => props.right}px;
  top: 12px;
  background: url('${requiredImage}') center no-repeat;
`
const getInputWidth = (props: any) => {
  if (props.width) {
    return typeof props.width === 'number' ? `${props.width}px` : props.width
  }

  if (props.large) {
    return `${ThemeProps.inputSizes.large.width}px`
  }

  return `${ThemeProps.inputSizes.regular.width}px`
}
const borderColor = (
  props: any,
  defaultColor: string | undefined | null = ThemePalette.grayscale[3],
) => (props.highlight ? ThemePalette.alert : defaultColor)
const Input = styled.input<any>`
  width: ${props => getInputWidth(props)};
  height: ${props => props.height || `${ThemeProps.inputSizes.regular.height}px`};
  line-height: ${props => props.lineHeight || 'normal'};
  border-radius: ${ThemeProps.borderRadius};
  background-color: #FFF;
  border: ${props => (props.embedded ? 0 : css`1px solid ${borderColor(props)}`)};
  border-top-left-radius: ${props => (props.embedded ? 0 : ThemeProps.borderRadius)};
  border-top-right-radius: ${ThemeProps.borderRadius};
  border-bottom-left-radius: ${props => (props.embedded ? 0 : ThemeProps.borderRadius)};
  border-bottom-right-radius: ${ThemeProps.borderRadius};
  color: ${ThemePalette.black};
  padding: 0 8px 0 ${props => (props.embedded ? 0 : '16px')};
  font-size: inherit;
  transition: all ${ThemeProps.animations.swift};
  box-sizing: border-box;
  &:hover {
    border-color: ${props => borderColor(props, props.disablePrimary ? null : ThemePalette.primary)};
  }
  &:focus {
    border-color: ${props => borderColor(props, props.disablePrimary ? null : ThemePalette.primary)};
    outline: none;
  }
  &:disabled {
    color: ${props => (!props.embedded ? ThemePalette.grayscale[3] : 'inherit')};
    border-color: ${props => (!props.embedded ? ThemePalette.grayscale[0] : 'inherit')};
    background-color: ${props => (!props.embedded ? ThemePalette.grayscale[0] : 'inherit')};
  }
  &::placeholder {
    color: ${ThemePalette.grayscale[3]};
  }
`
export const Close = styled.div<any>`
  display: ${props => (props.show ? 'block' : 'none')};
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
  onChange?: (e: React.ChangeEvent<HTMLInputElement> | { target: { value: string } }) => void,
  placeholder?: string,
  type?: string,
  value?: string,
  showClose?: boolean,
  onCloseClick?: () => void,
  embedded?: boolean,
  width?: string | number,
  height?: string,
  style?: React.CSSProperties,
  lineHeight?: string,
  'data-test-id'?: string,
  required?: boolean,
  disabledLoading?: boolean,
  onInputKeyDown?: (e: React.KeyboardEvent<HTMLInputElement>) => void,
  onFocus?: () => void,
  onBlur?: () => void,
}
const TextInput = (props: Props) => {
  const {
    // eslint-disable-next-line @typescript-eslint/naming-convention
    _ref, value, onChange, showClose, onCloseClick,
    disabled, disabledLoading, embedded, onInputKeyDown,
  } = props
  const actualDisabled = disabled || disabledLoading
  let input: { focus: () => void }
  return (
    <Wrapper data-test-id={props['data-test-id'] || 'textInput'} disabledLoading={disabledLoading}>
      <Input
        ref={(ref: HTMLElement) => { input = ref; if (_ref) _ref(ref) }}
        type="text"
        value={value}
        onChange={onChange}
        data-test-id="textInput-input"
        // eslint-disable-next-line react/jsx-props-no-spreading
        {...props}
        onKeyDown={onInputKeyDown}
        disabled={actualDisabled}
      />
      {props.required ? <Required right={embedded ? -24 : -16} /> : null}
      <Close
        data-test-id="textInput-close"
        show={showClose && value !== '' && value !== undefined}
        onClick={() => {
          input.focus()

          if (onChange) onChange({ target: { value: '' } })
          if (onCloseClick) onCloseClick()
        }}
      />
    </Wrapper>
  )
}

export default TextInput

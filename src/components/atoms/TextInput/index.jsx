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
import styled from 'styled-components'
import Palette from '../../styleUtils/Palette'
import StyleProps from '../../styleUtils/StyleProps'

import starImage from './images/star.svg'

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
const Input = styled.input`
  width: ${props => getInputWidth(props)};
  height: ${StyleProps.inputSizes.regular.height}px;
  line-height: ${StyleProps.inputSizes.regular.height}px;
  border-radius: ${StyleProps.borderRadius};
  background-color: #FFF;
  border: 1px solid ${props => props.highlight ? Palette.alert : Palette.grayscale[3]};
  color: ${Palette.black};
  padding: 0 ${props => props.customRequired ? '29px' : '8px'} 0 16px;
  font-size: inherit;
  transition: all ${StyleProps.animations.swift};
  box-sizing: border-box;
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
const Required = styled.div`
  display: ${props => props.show ? 'block' : 'none'};
  position: absolute;
  right: 12px;
  top: 13px;
  width: 8px;
  height: 8px;
  background: url('${starImage}') center no-repeat;
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
}
const TextInput = (props: Props) => {
  const { _ref, required } = props
  return (
    <Wrapper>
      <Input innerRef={_ref} type="text" customRequired={required} {...props} />
      <Required show={required} />
    </Wrapper>
  )
}

export default TextInput

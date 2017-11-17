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
import styled from 'styled-components'
import PropTypes from 'prop-types'

import Palette from '../../styleUtils/Palette'
import StyleProps from '../../styleUtils/StyleProps'

import checkedImage from './images/checked.svg'

const Wrapper = styled.div`
  ${props => props.disabled ? 'opacity: 0.5;' : ''}
`
const LabelStyled = styled.label`
  display: flex;
`
const Text = styled.div`
  margin-left: 16px;
`
const InputStyled = styled.input`
  width: 16px;
  height: 16px;
  border: 1px solid ${Palette.grayscale[3]};
  border-radius: 50%;
  background: white;
  appearance: none;
  outline: 0;
  transition: all ${StyleProps.animations.swift};
  position: relative;
  margin: 0;
  cursor: pointer;

  &:checked {
    background: url('${checkedImage}') center no-repeat;
    border-color: transparent;
  }
`

class RadioInput extends React.Component {
  static propTypes = {
    label: PropTypes.string,
  }

  render() {
    return (
      <Wrapper {...this.props}>
        <LabelStyled>
          <InputStyled type="radio" {...this.props} />
          <Text>{this.props.label}</Text>
        </LabelStyled>
      </Wrapper>
    )
  }
}

export default RadioInput

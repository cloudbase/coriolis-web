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
import styled, { css } from 'styled-components'
import PropTypes from 'prop-types'

import Palette from '../../styleUtils/Palette'
import StyleProps from '../../styleUtils/StyleProps'

import checkmarkImage from './images/checkmark.svg'

const CheckmarkImage = styled.div`
  width: 10px;
  height: 7px;
  background: url('${checkmarkImage}') no-repeat center;
  transform: scale(0);
  transition: transform 250ms cubic-bezier(0, 1.4, 1, 1);
`
const Wrapper = styled.div`
  display: flex;
  ${props => props.disabled ? '' : 'cursor: pointer;'}
  ${props => props.disabled ? 'opacity: 0.9;' : ''}
  justify-content: center;
  align-items: center;
  ${StyleProps.exactSize('16px')}
  border: 1px solid ${Palette.grayscale[3]};
  border-radius: 3px;
  background: white;
  transition: all ${StyleProps.animations.swift};
  ${props => props.checked ? css`
    border-color: ${Palette.primary};
    background: ${Palette.primary};
    ${CheckmarkImage} {
      transform: scale(1);
    }
  ` : ''}
`

class Checkbox extends React.Component {
  static propTypes = {
    className: PropTypes.string,
    checked: PropTypes.bool,
    disabled: PropTypes.bool,
    onChange: PropTypes.func.isRequired,
  }

  handleClick() {
    if (this.props.disabled) {
      return
    }

    this.props.onChange(!this.props.checked)
  }

  render() {
    return (
      <Wrapper
        className={this.props.className}
        onClick={() => { this.handleClick() }}
        checked={this.props.checked}
      >
        <CheckmarkImage />
      </Wrapper>
    )
  }
}

export default Checkbox

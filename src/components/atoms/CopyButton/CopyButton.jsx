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

import StyleProps from '../../styleUtils/StyleProps'

import copyImage from './images/copy.svg'

const Wrapper = styled.span`
  opacity: 0;
  width: 16px;
  height: 16px;
  display: inline-block;
  background: url('${copyImage}') no-repeat;
  background-position-y: 2px;
  transition: all ${StyleProps.animations.swift};
`

class CopyButton extends React.Component {
  render() {
    return (
      <Wrapper {...this.props} />
    )
  }
}

export default CopyButton

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

import questionImage from './images/question.svg'

const Wrapper = styled.div`
  width: 16px;
  height: 16px;
  background: url('${questionImage}') center no-repeat;
  display: inline-block;
  margin-bottom: -4px;
  margin-left: ${props => props.marginLeft ? `${props.marginLeft}px` : '4px'};
`
type Props = {
  text: string,
  marginLeft: number,
}
class InfoIcon extends React.Component<Props> {
  render() {
    return (
      <Wrapper data-tip={this.props.text} marginLeft={this.props.marginLeft} />
    )
  }
}

export default InfoIcon

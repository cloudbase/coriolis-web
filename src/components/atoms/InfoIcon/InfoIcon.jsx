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
import { observer } from 'mobx-react'
import styled from 'styled-components'

import questionImage from './images/question.svg'
import warningImage from './images/warning.svg'
import questionFilledImage from './images/question-filled.svg'

const Wrapper = styled.div`
  width: 16px;
  height: 16px;
  background: url('${props => props.warning ? warningImage : props.filled ? questionFilledImage : questionImage}') center no-repeat;
  display: inline-block;
  margin-left: ${props => props.marginLeft != null ? `${props.marginLeft}px` : '4px'};
  margin-bottom: ${props => props.marginBottom != null ? `${props.marginBottom}px` : '-4px'};
`
type Props = {
  text: string,
  marginLeft?: ?number,
  marginBottom?: ?number,
  className?: string,
  warning?: boolean,
  filled?: boolean,
}
@observer
class InfoIcon extends React.Component<Props> {
  render() {
    return (
      <Wrapper
        data-tip={this.props.text}
        marginLeft={this.props.marginLeft}
        marginBottom={this.props.marginBottom}
        className={this.props.className}
        warning={this.props.warning}
        filled={this.props.filled}
      />
    )
  }
}

export default InfoIcon

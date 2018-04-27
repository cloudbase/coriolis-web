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

import Palette from '../../styleUtils/Palette'
import StyleProps from '../../styleUtils/StyleProps'

type Props = {
  progress: number,
  width?: number,
}

const Wrapper = styled.div`
  background: white;
`
const Progress = styled.div`
  height: 2px;
  background: ${Palette.primary};
  transition: all ${StyleProps.animations.swift};
  width: ${(props: Props) => props.width}%;
`

@observer
class ProgressBar extends React.Component<Props> {
  render() {
    return (
      <Wrapper {...this.props}>
        <Progress data-test-id="progressBar-progress" width={this.props.progress} />
      </Wrapper>
    )
  }
}

export default ProgressBar

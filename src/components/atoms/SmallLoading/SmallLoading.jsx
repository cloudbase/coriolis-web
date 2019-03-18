/*
Copyright (C) 2018  Cloudbase Solutions SRL
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
import styled, { css } from 'styled-components'

import StyleProps from '../../styleUtils/StyleProps'
import Palette from '../../styleUtils/Palette'

const Wrapper = styled.div`
  position: relative;
  ${StyleProps.exactSize('28px')}
  background-repeat: no-repeat;
  background-position: center;
`
const ProgressSvgWrapper = styled.svg`
  ${StyleProps.exactSize('100%')}
  transform: rotate(-90deg);
  ${props => props.spinning ? css`animation: rotate 1s linear infinite;` : ''}
  @keyframes rotate {
    0% {transform: rotate(0deg);}
    100% {transform: rotate(360deg);}
  }
`
const ProgressText = styled.div`
  color: ${Palette.primary};
  font-size: 9px;
  font-weight: ${StyleProps.fontWeights.medium};
  top: 9px;
  position: absolute;
  width: 100%;
  text-align: center;
`
const CircleProgressBar = styled.circle`
  transition: stroke-dashoffset ${StyleProps.animations.swift};
`

export const TEST_ID = 'smallLoading'

export type Props = {
  loadingProgress: number,
}

@observer
class SmallLoading extends React.Component<Props> {
  renderProgressImage() {
    let progress = this.props.loadingProgress > -1 ? this.props.loadingProgress : 25

    return (
      <ProgressSvgWrapper
        id="svg"
        width="28"
        height="28"
        viewPort="0 0 28 28"
        spinning={this.props.loadingProgress === -1}
        version="1.1"
        xmlns="http://www.w3.org/2000/svg"
      >
        <g strokeWidth="2">
          <circle
            r="13"
            cx="14"
            cy="14"
            fill="transparent"
            stroke={Palette.grayscale[2]}
          />
          <CircleProgressBar
            data-test-id="statusImage-progressBar"
            r="13"
            cx="14"
            cy="14"
            fill="transparent"
            stroke={Palette.primary}
            strokeDasharray="100 100"
            strokeDashoffset={300 - ((progress / 100) * 82)}
          />
        </g>
      </ProgressSvgWrapper>
    )
  }

  renderProgressText() {
    if (this.props.loadingProgress === -1) {
      return null
    }

    return (
      <ProgressText
        data-test-id={`${TEST_ID}-progressText`}
      >{this.props.loadingProgress ? this.props.loadingProgress.toFixed(0) : 0}%</ProgressText>
    )
  }

  render() {
    return (
      <Wrapper>
        {this.renderProgressImage()}
        {this.renderProgressText()}
      </Wrapper>
    )
  }
}

export default SmallLoading

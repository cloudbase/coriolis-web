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
import styled, { css } from 'styled-components'
import StyleProps from '../../styleUtils/StyleProps'
import Palette from '../../styleUtils/Palette'

import errorImage from './images/error'
import successImage from './images/success'
import loadingImage from './images/loading'
import questionImage from './images/question'

type Props = {
  status?: string,
  loading?: boolean,
  loadingProgress?: number,
  size?: number,
}
const Wrapper = styled.div`
  position: relative;
  ${props => StyleProps.exactSize(`${props.size}px`)}
  background-repeat: no-repeat;
  background-position: center;
`
const ProgressSvgWrapper = styled.svg`
  ${StyleProps.exactSize('100%')}
  transform: rotate(-90deg);
`
const ProgressText = styled.div`
  color: ${Palette.primary};
  font-size: 18px;
  top: 36px;
  position: absolute;
  width: 100%;
  text-align: center;
`
const CircleProgressBar = styled.circle`
  transition: stroke-dashoffset ${StyleProps.animations.swift};
`
const dashAnimationStyle = css`
  .circle {
    stroke-dasharray: 300;
    stroke-dashoffset: 300;
    animation: circleDash 300ms ease-in-out 100ms forwards;
  }
  .path {
    stroke-dasharray: 60;
    stroke-dashoffset: 60;
    animation: pathDash 300ms ease-in-out 100ms forwards;
  }
  .dot {
    fill-opacity: 0;
    animation: appear 300ms ease-in-out 100ms forwards;
  }
  @keyframes appear {
    to { fill-opacity: 1; }
  }
  @keyframes circleDash {
    to { stroke-dashoffset: 600; }
  }
  @keyframes pathDash {
    to { stroke-dashoffset: 120; }
  }
`
const loadingAnimationStyle = css`
  /* background: url(${loadingImage}) center no-repeat; */
  animation: rotate 1s linear infinite;
  @keyframes rotate {
    0% {transform: rotate(0deg);}
    100% {transform: rotate(360deg);}
  }
`
const Image = styled.div`
  ${props => StyleProps.exactSize(`${props.size}px`)}
  ${props => props.cssStyle}
`
const Images = {
  COMPLETED: {
    image: successImage,
    style: dashAnimationStyle,
  },
  ERROR: {
    image: errorImage,
    style: dashAnimationStyle,
  },
  RUNNING: {
    style: loadingAnimationStyle,
    image: loadingImage,
  },
  QUESTION: {
    image: questionImage,
    style: dashAnimationStyle,
  },
}
@observer
class StatusImage extends React.Component<Props> {
  static defaultProps: $Shape<Props> = {
    status: 'RUNNING',
  }

  renderProgressImage() {
    return (
      <ProgressSvgWrapper id="svg" width="96" height="96" viewPort="0 0 96 96" version="1.1" xmlns="http://www.w3.org/2000/svg">
        <g strokeWidth="2">
          <circle
            r="47"
            cx="48"
            cy="48"
            fill="transparent"
            stroke={Palette.grayscale[2]}
          />
          <CircleProgressBar
            data-test-id="statusImage-progressBar"
            r="47"
            cx="48"
            cy="48"
            fill="transparent"
            stroke={Palette.primary}
            strokeDasharray="300 1000"
            strokeDashoffset={300 - ((this.props.loadingProgress || 0) * 3)}
          />
        </g>
      </ProgressSvgWrapper>
    )
  }

  renderProgressText() {
    return (
      <ProgressText
        data-test-id="statusImage-progressText"
      >{this.props.loadingProgress ? this.props.loadingProgress.toFixed(0) : 0}%</ProgressText>
    )
  }

  render() {
    let status = this.props.status || 'QUESTION'
    status = status.toUpperCase()
    status = status === 'SUCCESS' ? 'COMPLETED' : status
    status = status === 'CONFIRMATION' ? 'QUESTION' : status
    if (this.props.loading) {
      status = 'RUNNING'
      if (this.props.loadingProgress !== undefined && this.props.loadingProgress > -1) {
        status = 'PROGRESS'
      }
    }
    let image = status !== 'PROGRESS' ? Images[status].image : null
    if (image instanceof Function) {
      image = image(this.props.size || 96)
    }
    return (
      <Wrapper size={this.props.size || 96}>
        {status !== 'PROGRESS' ? (
          <Image
            data-test-id="statusImage-image"
            dangerouslySetInnerHTML={{ __html: image }}
            cssStyle={Images[status].style}
            size={this.props.size || 96}
          />
        ) : null}
        {status === 'PROGRESS' ? this.renderProgressImage() : null}
        {status === 'PROGRESS' ? this.renderProgressText() : null}
      </Wrapper>
    )
  }
}

export default StatusImage

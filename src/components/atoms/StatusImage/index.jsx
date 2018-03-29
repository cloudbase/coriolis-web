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

import errorImage from './images/error.svg'
import successImage from './images/success.svg'
import loadingImage from './images/loading.svg'

type Props = {
  status?: string,
  loading?: boolean,
  loadingProgress?: number,
}

const statuses = () => {
  return {
    ERROR: css`
      background-image: url('${errorImage}');
    `,
    COMPLETED: css`
      background-image: url('${successImage}');
    `,
    RUNNING: css`
      background-image: url('${loadingImage}');
      transform-origin: 48px 48px;
      animation: rotate 1s linear infinite;

      @keyframes rotate {
        0% {transform: rotate(0deg);}
        100% {transform: rotate(360deg);}
      }
    `,
    PROGRESS: css``,
  }
}
const Wrapper = styled.div`
  position: relative;
  ${StyleProps.exactSize('96px')}
  background-repeat: no-repeat;
  background-position: center;
  ${(props: Props) => statuses()[props.status || 'RUNNING']}
`
const SvgWrapper = styled.svg`
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

@observer
class StatusImage extends React.Component<Props> {
  static defaultProps: $Shape<Props> = {
    status: 'RUNNING',
  }

  renderProgressImage(status: string) {
    if (status !== 'PROGRESS') {
      return null
    }

    return (
      <SvgWrapper id="svg" width="96" height="96" viewPort="0 0 96 96" version="1.1" xmlns="http://www.w3.org/2000/svg">
        <g strokeWidth="2">
          <circle
            r="47"
            cx="48"
            cy="48"
            fill="transparent"
            stroke={Palette.grayscale[2]}
          />
          <CircleProgressBar
            r="47"
            cx="48"
            cy="48"
            fill="transparent"
            stroke={Palette.primary}
            strokeDasharray="300 1000"
            strokeDashoffset={300 - ((this.props.loadingProgress || 0) * 3)}
          />
        </g>
      </SvgWrapper>
    )
  }

  renderProgressText(status: string) {
    if (status !== 'PROGRESS') {
      return null
    }

    return <ProgressText>{this.props.loadingProgress ? this.props.loadingProgress.toFixed(0) : 0}%</ProgressText>
  }

  render() {
    let status = this.props.status
    if (this.props.loading) {
      status = 'RUNNING'
      if (this.props.loadingProgress !== undefined && this.props.loadingProgress > -1) {
        status = 'PROGRESS'
      }
    }

    return (
      <Wrapper
        {...this.props}
        status={status}
      >
        {this.renderProgressImage(status || '')}
        {this.renderProgressText(status || '')}
      </Wrapper>
    )
  }
}

export default StatusImage

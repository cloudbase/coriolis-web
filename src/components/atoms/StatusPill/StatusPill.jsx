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

import Palette from '../../styleUtils/Palette'
import StyleProps from '../../styleUtils/StyleProps'
import runningImage from './images/running.svg'

const statuses = {
  COMPLETED: css`
    background: ${Palette.success};
    color: white;
    border-color: transparent;
  `,
  ERROR: css`
    background: ${Palette.alert};
    color: white;
    border-color: transparent;
  `,
  CANCELED: css`
    background: ${Palette.warning};
    color: ${Palette.black};
    border-color: transparent;
  `,
  PAUSED: css`
    background: white;
    color: ${Palette.primary};
    border-color: ${Palette.primary};
  `,
  RUNNING: css`
    background: url('${runningImage}');
    animation: bgMotion 1s infinite linear;
    color: white;
    border-color: transparent;
    @keyframes bgMotion {
      0% { background-position: -12px -1px; }
      100% { background-position: 0 -1px; }
    }
  `,
  INFO: css``,
}

const primaryColors = css`
  color: ${Palette.primary};
  border-color: ${Palette.primary};
  background: white;
`
const alertColors = css`
  color: ${Palette.alert};
  border-color: ${Palette.alert};
  background: white;
`
const secondaryColors = css`
  color: white;
  border-color: ${Palette.grayscale[8]};
  background: ${Palette.grayscale[8]};
`
const getInfoStatusColor = props => {
  if (props.alert) {
    return alertColors
  }

  if (props.secondary) {
    return secondaryColors
  }

  return primaryColors
}
const Wrapper = styled.div`
  ${props => StyleProps.exactWidth(`${props.small ? 78 : 94}px`)}
  height: 14px;
  line-height: 14px;
  border: 1px solid;
  font-size: 9px;
  font-weight: ${StyleProps.fontWeights.medium};
  text-align: center;
  border-radius: 4px;
  ${props => statuses[props.status]}
  ${props => props.status === 'INFO' ? getInfoStatusColor(props) : ''}
`

type Props = {
  status: ?string,
  label: string,
  primary: boolean,
  secondary: boolean,
  alert: boolean,
  small: boolean,
  'data-test-id': string,
}
@observer
class StatusPill extends React.Component<Props> {
  static defaultProps: $Shape<Props> = {
    status: 'INFO',
  }

  render() {
    const dataTestId = this.props['data-test-id'] ? this.props['data-test-id'] : `statusPill-${this.props.status || 'null'}`
    let label = this.props.label || this.props.status
    let status = this.props.status

    if (status === 'CANCELED_FOR_DEBUGGING') {
      status = 'ERROR'
      label = 'DEBUG'
    }

    return (
      <Wrapper
        {...this.props}
        status={status}
        primary={this.props.primary}
        secondary={this.props.secondary}
        alert={this.props.alert}
        small={this.props.small}
        data-test-id={dataTestId}
      >
        {label}
      </Wrapper>
    )
  }
}

export default StatusPill

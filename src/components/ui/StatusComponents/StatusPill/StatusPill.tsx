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
import { observer } from 'mobx-react'
import styled, { css } from 'styled-components'

import { ThemePalette, ThemeProps } from '@src/components/Theme'
import runningImage from './images/running.svg'
import cancellingImage from './images/cancelling.svg'

const LABEL_MAP: { [status: string]: string } = {
  CANCELED_FOR_DEBUGGING: 'DEBUG',
  FORCE_CANCELED: 'CANCELED',
  STRANDED_AFTER_DEADLOCK: 'DEADLOCKED',
  CANCELED_AFTER_COMPLETION: 'CANCELED',
  CANCELLING_AFTER_COMPLETION: 'CANCELLING',
  FAILED_TO_SCHEDULE: 'UNSCHEDULABLE',
  FAILED_TO_CANCEL: 'CANCELED',
  AWAITING_MINION_ALLOCATIONS: 'AWAITING MINIONS',
  ERROR_ALLOCATING_MINIONS: 'MINIONS ERROR',
  // Minion Pool statuses
  VALIDATING_INPUTS: 'VALIDATING',
  ALLOCATING_SHARED_RESOURCES: 'ALLOCATING',
  ALLOCATING_MACHINES: 'ALLOCATING',
  DEALLOCATING_MACHINES: 'DEALLOCATING',
  DEALLOCATING_SHARED_RESOURCES: 'DEALLOCATING',
  IN_MAINTENANCE: 'MAINTENANCE',
  RESCALING: 'SCALING',
  IN_USE: 'IN USE',
  // Minion Machine power statuses
  POWERING_OFF: 'POWERING OFF',
  POWERING_ON: 'POWERING ON',
  POWERED_ON: 'POWERED ON',
  POWERED_OFF: 'POWERED OFF',
  POWER_ERROR: 'ERROR',
}

const statuses = (status: any) => {
  switch (status) {
    case 'COMPLETED':
    case 'ALLOCATED': // Minion Pool status
    case 'POWERED_ON': // Minion Machine status
    case 'AVAILABLE': // Minion Pool status
      return css`
        background: ${ThemePalette.success};
        color: white;
        border-color: transparent;
      `
    case 'FAILED_TO_SCHEDULE':
    case 'FAILED_TO_CANCEL':
    case 'ERROR':
    case 'ERROR_ALLOCATING_MINIONS':
    case 'POWER_ERROR': // Minion Machine power status
      return css`
        background: ${ThemePalette.alert};
        color: white;
        border-color: transparent;
      `
    case 'CANCELED':
    case 'CANCELED_FOR_DEBUGGING':
    case 'CANCELED_AFTER_COMPLETION':
    case 'FORCE_CANCELED':
      return css`
        background: ${ThemePalette.warning};
        color: ${ThemePalette.black};
        border-color: transparent;
      `
    case 'PAUSED':
      return css`
        background: white;
        color: ${ThemePalette.primary};
        border-color: ${ThemePalette.primary};
      `
    case 'STARTING':
    case 'RUNNING':
    case 'PENDING':
    case 'AWAITING_MINION_ALLOCATIONS':
    case 'INITIALIZING': // Minion Pool status
    case 'ALLOCATING': // Minion Pool status
    case 'RECONFIGURING': // Minion Pool status
    case 'VALIDATING_INPUTS': // Minion Pool status
    case 'ALLOCATING_SHARED_RESOURCES': // Minion Pool status
    case 'ALLOCATING_MACHINES': // Minion Pool status
    case 'SCALING': // Minion Pool status
    case 'RESCALING': // Minion Pool status
    case 'DEPLOYING': // Minion Pool status
    case 'IN_USE': // Minion Pool status
    case 'HEALTHCHECKING': // Minion Machine status
    case 'POWERING_ON': // Minion Machine power status
      return css`
        background: url('${runningImage}');
        animation: bgMotion 1s infinite linear;
        color: white;
        border-color: transparent;
        @keyframes bgMotion {
          0% { background-position: -12px -1px; }
          100% { background-position: 0 -1px; }
        }
      `

    case 'CANCELLING':
    case 'UNINITIALIZING':
    case 'DEALLOCATING': // Minion Machine status
    case 'POWERING_OFF': // Minion Machine power status
    case 'CANCELLING_AFTER_COMPLETION':
    case 'IN_MAINTENANCE': // Minion Pool status
    case 'DEALLOCATING_MACHINES': // Minion Pool status
    case 'DEALLOCATING_SHARED_RESOURCES': // Minion Pool status
      return css`
        background: url('${cancellingImage}');
        animation: bgMotion 1s infinite linear;
        color: ${ThemePalette.black};
        border-color: transparent;
        @keyframes bgMotion {
          0% { background-position: -12px -1px; }
          100% { background-position: 0 -1px; }
        }
      `
    case 'STRANDED_AFTER_DEADLOCK':
    case 'DEADLOCKED':
      return css`
        background: #424242;
        color: white;
        border-color: transparent;
      `
    case 'UNSCHEDULED':
    case 'UNKNOWN': // Minion Pool/Machine status
    case 'UNINITIALIZED': // Minion Pool/Machine status
    case 'DEALLOCATED': // Minion Pool status
    case 'INITIALIZED': // Minion Pool status
    case 'POWERED_OFF': // Minion Machine status
      return css`
        background: ${ThemePalette.grayscale[2]};
        color: ${ThemePalette.black};
        border-color: transparent;
      `
    case 'INFO':
    case 'SCHEDULED':
    case 'UNEXECUTED':
      return null
    default:
      return null
  }
}

const primaryColors = css`
  color: ${ThemePalette.primary};
  border-color: ${ThemePalette.primary};
  background: white;
`
const alertColors = css`
  color: ${ThemePalette.alert};
  border-color: ${ThemePalette.alert};
  background: white;
`
const secondaryColors = css`
  color: white;
  border-color: ${ThemePalette.grayscale[8]};
  background: ${ThemePalette.grayscale[8]};
`
const getInfoStatusColor = (props: any) => {
  if (props.alert) {
    return alertColors
  }

  if (props.secondary) {
    return secondaryColors
  }

  return primaryColors
}
const Wrapper = styled.div<any>`
  ${(props: any) => ThemeProps.exactWidth(`${props.small ? 78 : 94}px`)}
  height: 14px;
  line-height: 14px;
  border: 1px solid;
  font-size: 9px;
  font-weight: ${ThemeProps.fontWeights.medium};
  text-align: center;
  border-radius: 4px;
  ${(props: any) => statuses(props.status)}
  ${(props: any) => (props.status === 'INFO' ? getInfoStatusColor(props) : '')}
  text-transform: uppercase;
  overflow: hidden;
`

type Props = {
  status: string | null,
  label?: string,
  primary?: boolean,
  secondary?: boolean,
  alert?: boolean,
  small?: boolean,
  style?: React.CSSProperties
  'data-test-id'?: string,
}
@observer
class StatusPill extends React.Component<Props> {
  static defaultProps = {
    status: 'INFO',
  }

  render() {
    const dataTestId = this.props['data-test-id'] ? this.props['data-test-id'] : `statusPill-${this.props.status || 'null'}`
    let label = this.props.label || this.props.status
    const { status } = this.props

    label = LABEL_MAP[label || ''] || label

    return (
      <Wrapper
        // eslint-disable-next-line react/jsx-props-no-spreading
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

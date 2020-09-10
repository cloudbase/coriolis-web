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

import Palette from '../../styleUtils/Palette'
import StyleProps from '../../styleUtils/StyleProps'

import errorImage from './images/error.svg'
import progressImage from './images/progress'
import successImage from './images/success.svg'
import warningImage from './images/warning'
import pendingImage from './images/pending.svg'
import successHollowImage from './images/success-hollow.svg'
import errorHollowImage from './images/error-hollow.svg'

type Props = {
  status: string,
  useBackground?: boolean,
  hollow?: boolean,
  secondary?: boolean,
  style?: React.CSSProperties
  onClick?: (e: React.MouseEvent<HTMLDivElement>) => void
}

const getSpinnerUrl = (
  smallCircleColor: string,
  useWhiteBackground: boolean | null | undefined,
) => `url('data:image/svg+xml;utf8,${encodeURIComponent(progressImage(Palette.grayscale[3], smallCircleColor, useWhiteBackground))}');`

const getRunningImageUrl = (props: Props) => {
  const smallCircleColor = props.secondary ? Palette.grayscale[0] : Palette.primary
  return getSpinnerUrl(smallCircleColor, props.useBackground)
}

const getWarningUrl = (background: string) => `url('data:image/svg+xml;utf8,${encodeURIComponent(warningImage(background))}')`

const statuses = (status: any, props: any) => {
  switch (status) {
    case 'COMPLETED':
      return css`
      background-image: url('${props.hollow ? successHollowImage : successImage}');
    `
    case 'STARTING':
    case 'RUNNING':
    case 'PENDING':
      return css`
        background-image: ${getRunningImageUrl(props)};
        ${StyleProps.animations.rotation}
      `
    case 'CANCELLING':
    case 'CANCELLING_AFTER_COMPLETION':
      return css`
        background-image: ${getSpinnerUrl(Palette.warning, props.useBackground)};
        ${StyleProps.animations.rotation}
      `
    case 'SCHEDULED':
      return css`
        background-image: url('${pendingImage}');
      `
    case 'FAILED_TO_SCHEDULE':
    case 'FAILED_TO_CANCEL':
    case 'ERROR':
      return css`
        background-image: url('${props.hollow ? errorHollowImage : errorImage}');
      `
    case 'WARNING':
    case 'CANCELED':
    case 'CANCELED_AFTER_COMPLETION':
    case 'CANCELED_FOR_DEBUGGING':
    case 'FORCE_CANCELED':
      return css`
        background-image: ${getWarningUrl(Palette.warning)};
      `
    case 'DEADLOCKED':
    case 'STRANDED_AFTER_DEADLOCK':
      return css`
        background-image: ${getWarningUrl('#424242')};
      `
    case 'UNSCHEDULED':
    case 'UNEXECUTED':
      return css`
        background-image: ${getWarningUrl(Palette.grayscale[2])};
      `
    default:
      return null
  }
}

const Wrapper = styled.div<any>`
  min-width: 16px;
  max-width: 16px;
  height: 16px;
  background-repeat: no-repeat;
  background-position: center;
  ${(props: any) => statuses(props.status, props)}
`

@observer
class StatusIcon extends React.Component<Props> {
  render() {
    const { status } = this.props
    return (
      // eslint-disable-next-line react/jsx-props-no-spreading
      <Wrapper {...this.props} status={status} />
    )
  }
}

export default StatusIcon

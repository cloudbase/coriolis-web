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
import styled, { css } from 'styled-components'
import StyleProps from '../../styleUtils/StyleProps'

import errorImage from './images/error.svg'
import successImage from './images/success.svg'
import loadingImage from './images/loading.svg'

type Props = {
  status?: string,
  loading?: boolean,
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
  }
}
const Wrapper = styled.div`
  ${StyleProps.exactSize('96px')}
  background-repeat: no-repeat;
  background-position: center;
  ${ // $FlowIssue
  (props: Props) => statuses()[props.status]}
`

class StatusImage extends React.Component<Props> {
  static defaultProps: $Shape<Props> = {
    status: 'RUNNING',
  }

  render() {
    let status = this.props.status
    if (this.props.loading) {
      status = 'RUNNING'
    }
    return (
      <Wrapper status={status} {...this.props} />
    )
  }
}

export default StatusImage

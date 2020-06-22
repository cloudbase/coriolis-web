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
import styled, { css } from 'styled-components'
import { Link } from 'react-router-dom'

import StyleProps from '../../styleUtils/StyleProps'
import coriolisLargeImage from './images/coriolis-large.svg'
import coriolisSmallImage from './images/coriolis-small.svg'
import coriolisSmallBlackImage from './images/coriolis-small-black.svg'

const largeProps = css`
  width: 256px;
  height: 307px;
  background: url('${coriolisLargeImage}') center no-repeat;
`

const smallProps = css`
  width: 245px;
  height: 48px;
  background: url('${coriolisSmallImage}') center no-repeat;
`

const smallblackProps = css`
  width: 245px;
  height: 48px;
  background: url('${coriolisSmallBlackImage}') center no-repeat;
`
const Wrapper = styled(Link)`
  transition: all ${StyleProps.animations.swift};
`
const Coriolis = styled.div<any>`
  ${props => (props.small ? smallProps : props.smallblack ? smallblackProps : largeProps)}
  ${props => (!props.large && !props.small && !props.smallblack ? css`
    @media (max-height: 760px) {
      width: 246px;
      height: 42px;
      background: url('${coriolisSmallImage}') center no-repeat;
    }
  ` : '')}
`

type Props = {
  small?: boolean,
  smallblack?: boolean,
  large?: boolean,
  customRef?: (ref: HTMLElement) => void,
  to?: string,
  className?: string,
}

class Logo extends React.Component<Props> {
  render() {
    const to = this.props.to || ''
    return (
      <div
        style={{ transition: `all ${StyleProps.animations.swift}` }}
        className={this.props.className}
        ref={ref => { if (this.props.customRef && ref) this.props.customRef(ref) }}
      >
        <Wrapper to={to}>
          <Coriolis
            large={this.props.large}
            small={this.props.small}
            smallblack={this.props.smallblack}
          />
        </Wrapper>
      </div>
    )
  }
}

export default Logo

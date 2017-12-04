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
import PropTypes from 'prop-types'
import styled, { css } from 'styled-components'

import StyleProps from '../../styleUtils/StyleProps'
import coriolisLargeImage from './images/coriolis-large.svg'
import coriolisSmallImage from './images/coriolis-small.svg'

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

const Wrapper = styled.a``
const Coriolis = styled.div`
  ${props => props.small ? smallProps : largeProps}
  ${props => !props.large && !props.small ? StyleProps.media.handheld`
    width: 246px;
    height: 42px;
    background: url('${coriolisSmallImage}') center no-repeat;
  ` : ''}
`

const Logo = ({ large, small, ...props }) => {
  return (
    <Wrapper {...props}>
      <Coriolis large={large} small={small} />
    </Wrapper>
  )
}

Logo.propTypes = {
  large: PropTypes.bool,
  small: PropTypes.bool,
}

export default Logo

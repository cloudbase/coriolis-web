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

import * as React from 'react'
import styled from 'styled-components'

import Button from '../../atoms/Button'

import StyleProps from '../../styleUtils/StyleProps'

import loadingImage from './images/loading.svg'

const ButtonStyled = styled(Button)`
  position: relative;
`
const Loading = styled.span`
  position: absolute;
  top: 8px;
  right: 8px;
  width: 16px;
  height: 16px;
  background: url('${loadingImage}') center no-repeat;
  ${StyleProps.animations.rotation}
`

type Props = {
  children: React.Node,
}
class LoadingButton extends React.Component<Props> {
  render() {
    return (
      <ButtonStyled {...this.props} disabled>
        <span>{this.props.children}<Loading /></span>
      </ButtonStyled>
    )
  }
}

export default LoadingButton

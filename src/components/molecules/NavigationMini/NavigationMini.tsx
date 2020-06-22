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

import Navigation from '../../organisms/Navigation'

import StyleProps from '../../styleUtils/StyleProps'
import menuImage from './images/menu'

const Wrapper = styled.div<any>`
  margin-right: 38px;
  margin-left: 32px;
`
const Close = css`
  transform: rotate(0deg) translateX(0) translateY(0);
`
const Stub = styled.div<any>`
  width: 20px;
`
const MenuImage = styled.div<any>`
  cursor: pointer;
  width: 20px;
  height: 20px;
  ${props => (props.open ? css`position: fixed;` : '')}
  top: 23px;
  z-index: 99;
  #top {
    ${props => (props.open ? css`transform: rotate(45deg) translateX(0.5px) translateY(-4.5px);` : Close)}
    transition: all ${StyleProps.animations.swift};
  }
  #bottom {
    ${props => (props.open ? css`transform: rotate(-45deg) translateX(-6.5px) translateY(1.5px);` : Close)}
    transition: all ${StyleProps.animations.swift};
  }
`
const NavigationStyled = styled(Navigation)<any>`
  position: fixed;
  left: ${props => (props.open ? 0 : -80)}px;
  top: 0;
  padding-top: 24px;
  transition: left ${StyleProps.animations.swift};
  z-index: 9;
`

export const TEST_ID = 'navigationMini'

type State = {
  open: boolean,
}
@observer
class NavigationMini extends React.Component<{}, State> {
  state = {
    open: false,
  }

  handleMenuToggleClick() {
    this.setState(prevState => ({ open: !prevState.open }))
  }

  render() {
    return (
      <Wrapper>
        <MenuImage
          open={this.state.open}
          onClick={() => { this.handleMenuToggleClick() }}
          dangerouslySetInnerHTML={{ __html: menuImage() }}
          data-test-id={`${TEST_ID}-toggleButton`}
        />
        {this.state.open ? <Stub /> : null}
        <NavigationStyled
          open={this.state.open}
          collapsed
          hideLogos
        />
      </Wrapper>
    )
  }
}

export default NavigationMini

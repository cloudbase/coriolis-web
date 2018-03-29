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

import { navigationMenu } from '../../../config'
import hamburgerImage from './images/hamburger'
import backgroundImage from './images/star-bg.jpg'

const Wrapper = styled.div`
  margin-right: 20px;
`
const OpenTopLayer = css`
  transform: rotate(45deg) translateX(3px);
  width: 19px;
`
const OpenMiddleLayer = css`
  transform: rotate(-45deg) translateY(4.5px) translateX(-10.5px);
  width: 19px;
`
const Close = css`
  transform: rotate(0) translateY(0) translateX(0);
  opacity: 1;
`
const OpenBottomLayer = css`
  opacity: 0;
`

const Hamburger = styled.div`
  cursor: pointer;
  #top-layer, #middle-layer, #bottom-layer {
    transition: all .4s cubic-bezier(0, 1.4, 1, 1);
  }
  #top-layer {
    ${props => props.open ? OpenTopLayer : Close};
  }
  #middle-layer {
    ${props => props.open ? OpenMiddleLayer : Close};
  }
  #bottom-layer {
    ${props => props.open ? OpenBottomLayer : Close};
  }
`
const Menu = styled.div`
  position: fixed;
  background: url('${backgroundImage}');
  top: 64px;
  left: ${props => props.open ? 0 : '-224px'};
  bottom: 0;
  width: 184px;
  padding-left: 40px;
  padding-top: 60px;
  transition: all ${StyleProps.animations.swift};
  display: flex;
  flex-direction: column;
  z-index: 1;
`
const MenuItem = styled.a`
  font-size: 18px;
  color: white;
  margin-bottom: 24px;
  cursor: pointer;
  text-decoration: none;

  &:hover {
    color: ${Palette.primary};
  }
`

type Props = {}
type State = {
  open: boolean,
}
@observer
class SideMenu extends React.Component<Props, State> {
  constructor() {
    super()

    this.state = {
      open: false,
    }
  }

  handleHamburgerClick() {
    this.setState({ open: !this.state.open })
  }

  render() {
    return (
      <Wrapper>
        <Hamburger
          open={this.state.open}
          onClick={() => { this.handleHamburgerClick() }}
          dangerouslySetInnerHTML={{ __html: hamburgerImage() }}
        />
        <Menu open={this.state.open}>
          {navigationMenu.filter(i => !i.disabled).map(item => {
            return (
              <MenuItem key={item.value} href={`/#/${item.value}`}>{item.label}</MenuItem>
            )
          })}
        </Menu>
      </Wrapper>
    )
  }
}

export default SideMenu

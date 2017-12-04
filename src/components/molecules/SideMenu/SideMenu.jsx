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

import StyleProps from '../../styleUtils/StyleProps'

import hamburgerImage from './images/hamburger'
import backgroundImage from './images/star-bg.jpg'

const Wrapper = styled.div`
  margin-right: 20px;
`
const OpenTopLayer = css`
  transform: rotate(45deg) translateX(3px);
`
const OpenMiddleLayer = css`
  transform: rotate(-45deg) translateY(7px) translateX(-4px);
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
    transition: all ${StyleProps.animations.swift};
  }
  #top-layer {
    ${props => props.open ? OpenTopLayer : Close};
  }
  #middle-layer {
    transform-origin: 0% 100%;
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
`
const MenuItem = styled.a`
  font-size: 18px;
  color: white;
  margin-bottom: 24px;
  cursor: pointer;
  text-decoration: none;
`

class SideMenu extends React.Component {
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
          <MenuItem href="/#/replicas">Replicas</MenuItem>
          <MenuItem href="/#/migrations">Migrations</MenuItem>
          <MenuItem href="/#/endpoints">Cloud Endpoints</MenuItem>
        </Menu>
      </Wrapper>
    )
  }
}

export default SideMenu
